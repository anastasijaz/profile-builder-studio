-- Melt: core schema, row-level security, storage and realtime.
--
-- Security model in one paragraph: every table has RLS enabled and policies
-- only for the `authenticated` role. A user can always see and edit their own
-- rows. Other people's profiles, interests and photos are visible only when
-- (a) the viewer has finished onboarding (so the 18+ check has happened),
-- (b) the target has finished onboarding, and (c) neither has blocked the
-- other. Exact locations are never readable by anyone but the owner.
-- Matches are created only by a trigger, never directly by clients.

-- ---------------------------------------------------------------------------
-- Interests (sports and fitness tags)
-- ---------------------------------------------------------------------------
create table public.interests (
  id smallint generated always as identity primary key,
  slug text not null unique,
  label text not null,
  emoji text not null,
  sort_order smallint not null default 0
);

insert into public.interests (slug, label, emoji, sort_order) values
  ('running', 'Running', '👟', 1),
  ('cycling', 'Cycling', '🚴', 2),
  ('climbing', 'Climbing', '🧗', 3),
  ('bouldering', 'Bouldering', '🪨', 4),
  ('gym', 'Gym', '🏋️', 5),
  ('team-sports', 'Team sports', '🤝', 6),
  ('football', 'Football', '⚽', 7),
  ('basketball', 'Basketball', '🏀', 8),
  ('volleyball', 'Volleyball', '🏐', 9),
  ('swimming', 'Swimming', '🏊', 10),
  ('yoga', 'Yoga', '🧘', 11),
  ('pilates', 'Pilates', '🤸', 12),
  ('hiking', 'Hiking', '🥾', 13),
  ('tennis', 'Tennis', '🎾', 14),
  ('squash', 'Squash', '🟢', 15),
  ('padel', 'Padel', '🏓', 16),
  ('surfing', 'Surfing', '🏄', 17),
  ('skiing', 'Skiing', '🎿', 18),
  ('martial-arts', 'Martial arts', '🥋', 19),
  ('hyrox', 'Hyrox / CrossFit', '⛓️', 20),
  ('dance', 'Dance', '💃', 21),
  ('rowing', 'Rowing', '🚣', 22),
  ('triathlon', 'Triathlon', '🏅', 23);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  birthdate date not null,
  city text not null check (char_length(btrim(city)) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 300),
  -- Consent is copied from the signup metadata by a trigger, never trusted from the client.
  terms_accepted_at timestamptz not null,
  privacy_accepted_at timestamptz not null,
  consent_version text not null,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exact (already rounded) location. Owner-only; distance is exposed via RPC in km.
create table public.profile_locations (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  updated_at timestamptz not null default now()
);

create table public.profile_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  interest_id smallint not null references public.interests (id) on delete cascade,
  primary key (user_id, interest_id)
);

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  position smallint not null default 0 check (position between 0 and 5),
  created_at timestamptz not null default now(),
  -- Paths must live in the owner's own storage folder.
  check (storage_path like (user_id::text || '/%'))
);
create index profile_photos_user_idx on public.profile_photos (user_id, position);

-- ---------------------------------------------------------------------------
-- Swipes, matches, messages
-- ---------------------------------------------------------------------------
create table public.swipes (
  actor uuid not null references public.profiles (id) on delete cascade,
  target uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('like', 'pass')),
  created_at timestamptz not null default now(),
  primary key (actor, target),
  check (actor <> target)
);
create index swipes_target_idx on public.swipes (target, kind);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
create index matches_user_b_idx on public.matches (user_b);

create table public.match_reads (
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_match_idx on public.messages (match_id, created_at);

-- ---------------------------------------------------------------------------
-- Safety: blocks and reports
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker uuid not null references public.profiles (id) on delete cascade,
  blocked uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
create index blocks_blocked_idx on public.blocks (blocked);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  -- Reports survive account deletion so moderators keep the evidence.
  reporter uuid references public.profiles (id) on delete set null,
  reported uuid references public.profiles (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  message_body text, -- snapshot, filled by trigger
  reason text not null check (
    reason in ('fake_profile', 'harassment', 'inappropriate_photos', 'underage', 'spam', 'other')
  ),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so RLS policies can call them without
-- recursing into each other's policies)
-- ---------------------------------------------------------------------------
create function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker = a and blocked = b) or (blocker = b and blocked = a)
  );
$$;

create function public.is_onboarded(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = uid and onboarded_at is not null
  );
$$;

-- Can the current user see this person's profile, interests and photos?
create function public.can_view_profile(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and (
    target = auth.uid()
    or (
      public.is_onboarded(auth.uid())
      and public.is_onboarded(target)
      and not public.is_blocked(auth.uid(), target)
    )
  );
$$;

-- Is the current user a participant in this match, with no block between them?
create function public.is_match_participant(m uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.matches
    where id = m
      and auth.uid() in (user_a, user_b)
      and not public.is_blocked(user_a, user_b)
  );
$$;

revoke execute on function public.is_blocked(uuid, uuid) from public, anon;
revoke execute on function public.is_onboarded(uuid) from public, anon;
revoke execute on function public.can_view_profile(uuid) from public, anon;
revoke execute on function public.is_match_participant(uuid) from public, anon;
grant execute on function public.is_blocked(uuid, uuid) to authenticated;
grant execute on function public.is_onboarded(uuid) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;
grant execute on function public.is_match_participant(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Profiles: 18+ rule, consent copied from signup metadata, immutable fields,
-- and onboarding can only complete with at least one photo and one interest.
create function public.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb;
begin
  if new.birthdate > (current_date - interval '18 years')::date then
    raise exception 'You must be at least 18 years old to use Melt.'
      using errcode = '23514', hint = 'must_be_18';
  end if;
  if new.birthdate < date '1900-01-01' then
    raise exception 'Please enter a valid birthdate.' using errcode = '23514';
  end if;

  if tg_op = 'INSERT' then
    select raw_user_meta_data -> 'consent' into meta from auth.users where id = new.id;
    if meta is null
      or coalesce((meta ->> 'terms')::boolean, false) is not true
      or coalesce((meta ->> 'privacy')::boolean, false) is not true
      or coalesce((meta ->> 'adult')::boolean, false) is not true then
      raise exception 'Consent to the terms and privacy policy is required.'
        using errcode = '23514', hint = 'consent_required';
    end if;
    new.terms_accepted_at := coalesce((meta ->> 'accepted_at')::timestamptz, now());
    new.privacy_accepted_at := new.terms_accepted_at;
    new.consent_version := coalesce(meta ->> 'version', 'unknown');
    new.onboarded_at := null;
  else
    -- Consent records and creation time can't be rewritten by the client.
    new.terms_accepted_at := old.terms_accepted_at;
    new.privacy_accepted_at := old.privacy_accepted_at;
    new.consent_version := old.consent_version;
    new.created_at := old.created_at;
    -- Birthdate is fixed once onboarding is complete.
    if old.onboarded_at is not null and new.birthdate <> old.birthdate then
      raise exception 'Birthdate can''t be changed after signup.' using errcode = '23514';
    end if;
    if old.onboarded_at is not null and new.onboarded_at is distinct from old.onboarded_at then
      new.onboarded_at := old.onboarded_at;
    end if;
    if old.onboarded_at is null and new.onboarded_at is not null then
      if not exists (select 1 from public.profile_photos where user_id = new.id) then
        raise exception 'Add at least one photo.' using errcode = '23514', hint = 'photo_required';
      end if;
      if not exists (select 1 from public.profile_interests where user_id = new.id) then
        raise exception 'Pick at least one interest.' using errcode = '23514', hint = 'interest_required';
      end if;
      new.onboarded_at := now();
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_guard
before insert or update on public.profiles
for each row execute function public.profiles_guard();

-- Max 6 photos per profile.
create function public.profile_photos_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.profile_photos where user_id = new.user_id) >= 6 then
    raise exception 'You can add up to 6 photos.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger profile_photos_limit
before insert on public.profile_photos
for each row execute function public.profile_photos_limit();

-- Mutual like => match.
create function public.create_match_on_mutual_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.kind = 'like' and exists (
    select 1 from public.swipes
    where actor = new.target and target = new.actor and kind = 'like'
  ) and not public.is_blocked(new.actor, new.target) then
    insert into public.matches (user_a, user_b)
    values (least(new.actor, new.target), greatest(new.actor, new.target))
    on conflict (user_a, user_b) do nothing;
  end if;
  return new;
end;
$$;

create trigger swipes_create_match
after insert on public.swipes
for each row execute function public.create_match_on_mutual_like();

-- Reports: validate a reported message belongs to the reporter's match and
-- snapshot its text so moderators can still read it if it is deleted later.
create function public.reports_prepare()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  msg record;
begin
  new.status := 'open';
  new.created_at := now();
  if new.message_id is not null then
    select m.body, m.sender_id, m.match_id into msg
    from public.messages m
    join public.matches x on x.id = m.match_id
    where m.id = new.message_id and new.reporter in (x.user_a, x.user_b);
    if not found then
      raise exception 'Message not found.' using errcode = '23514';
    end if;
    new.message_body := msg.body;
    new.reported := msg.sender_id;
  else
    new.message_body := null;
  end if;
  if new.reported is null or new.reported = new.reporter then
    raise exception 'Invalid report.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger reports_prepare
before insert on public.reports
for each row execute function public.reports_prepare();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.interests enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_locations enable row level security;
alter table public.profile_interests enable row level security;
alter table public.profile_photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.match_reads enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- Nothing is readable without signing in.
revoke all on all tables in schema public from anon;

-- interests: read-only catalogue
create policy "interests readable" on public.interests
  for select to authenticated using (true);

-- profiles
create policy "profiles visible" on public.profiles
  for select to authenticated using (public.can_view_profile(id));
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- No delete policy: accounts are deleted via delete_my_account(), which cascades.

-- profile_locations: owner only
create policy "location owner select" on public.profile_locations
  for select to authenticated using (user_id = auth.uid());
create policy "location owner insert" on public.profile_locations
  for insert to authenticated with check (user_id = auth.uid());
create policy "location owner update" on public.profile_locations
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "location owner delete" on public.profile_locations
  for delete to authenticated using (user_id = auth.uid());

-- profile_interests
create policy "interests visible" on public.profile_interests
  for select to authenticated using (public.can_view_profile(user_id));
create policy "interests insert own" on public.profile_interests
  for insert to authenticated with check (user_id = auth.uid());
create policy "interests delete own" on public.profile_interests
  for delete to authenticated using (user_id = auth.uid());

-- profile_photos
create policy "photos visible" on public.profile_photos
  for select to authenticated using (public.can_view_profile(user_id));
create policy "photos insert own" on public.profile_photos
  for insert to authenticated with check (user_id = auth.uid());
create policy "photos update own" on public.profile_photos
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "photos delete own" on public.profile_photos
  for delete to authenticated using (user_id = auth.uid());

-- swipes: private to the actor. You can only swipe people you're allowed to see.
create policy "swipes select own" on public.swipes
  for select to authenticated using (actor = auth.uid());
create policy "swipes insert own" on public.swipes
  for insert to authenticated
  with check (actor = auth.uid() and target <> auth.uid() and public.can_view_profile(target));

-- matches: participants only, hidden once either side blocks. No client writes.
create policy "matches participants" on public.matches
  for select to authenticated
  using (auth.uid() in (user_a, user_b) and not public.is_blocked(user_a, user_b));

-- match_reads: own rows in own matches
create policy "reads select own" on public.match_reads
  for select to authenticated using (user_id = auth.uid());
create policy "reads insert own" on public.match_reads
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_match_participant(match_id));
create policy "reads update own" on public.match_reads
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_match_participant(match_id));

-- messages: only between matched, non-blocked users
create policy "messages participants select" on public.messages
  for select to authenticated using (public.is_match_participant(match_id));
create policy "messages participants insert" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_match_participant(match_id));

-- blocks: own rows only
create policy "blocks select own" on public.blocks
  for select to authenticated using (blocker = auth.uid());
create policy "blocks insert own" on public.blocks
  for insert to authenticated with check (blocker = auth.uid());
create policy "blocks delete own" on public.blocks
  for delete to authenticated using (blocker = auth.uid());

-- reports: insert as yourself, never readable through the API
create policy "reports insert own" on public.reports
  for insert to authenticated with check (reporter = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: private bucket for profile photos, one folder per user
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create function public.storage_owner(object_name text)
returns uuid
language sql
stable
set search_path = ''
as $$
  select case
    when (storage.foldername(object_name))[1] ~ '^[0-9a-f-]{36}$'
      then ((storage.foldername(object_name))[1])::uuid
    else null
  end;
$$;

create policy "photo files visible" on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-photos' and public.can_view_profile(public.storage_owner(name)));
create policy "photo files upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and public.storage_owner(name) = auth.uid());
create policy "photo files update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos' and public.storage_owner(name) = auth.uid());
create policy "photo files delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-photos' and public.storage_owner(name) = auth.uid());

-- ---------------------------------------------------------------------------
-- Realtime: new chat messages (Realtime applies the RLS policies above)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
