-- Melt: sport prompts (from the original Lovable design) and "melted on" likes.

create table public.profile_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question text not null check (question in (
    'My current PR is…',
    'Currently training for…',
    'How to approach me at the gym…',
    'Favourite snack bar…',
    'Post-workout ritual…',
    'My sport origin story…',
    'Race I''d do with a stranger…',
    'My simple pleasures…'
  )),
  answer text not null check (char_length(btrim(answer)) between 1 and 150),
  position smallint not null default 0 check (position between 0 and 2),
  created_at timestamptz not null default now(),
  unique (user_id, question)
);
create index profile_prompts_user_idx on public.profile_prompts (user_id, position);

-- Max 3 prompts per profile.
create function public.profile_prompts_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.profile_prompts where user_id = new.user_id) >= 3 then
    raise exception 'You can answer up to 3 prompts.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger profile_prompts_limit
before insert on public.profile_prompts
for each row execute function public.profile_prompts_limit();

alter table public.profile_prompts enable row level security;
revoke all on public.profile_prompts from anon;
create policy "prompts visible" on public.profile_prompts
  for select to authenticated using (public.can_view_profile(user_id));
create policy "prompts insert own" on public.profile_prompts
  for insert to authenticated with check (user_id = auth.uid());
create policy "prompts update own" on public.profile_prompts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "prompts delete own" on public.profile_prompts
  for delete to authenticated using (user_id = auth.uid());

-- Which prompt a like was for (optional).
alter table public.swipes
  add column prompt_id uuid references public.profile_prompts (id) on delete set null;

-- Profile cards now carry prompts, and (in likes_received) the prompt you were liked on.
alter type public.profile_card add attribute prompts jsonb;
alter type public.profile_card add attribute liked_prompt text;

create or replace function public._profile_cards(viewer uuid)
returns setof public.profile_card
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select l.lat, l.lng from public.profile_locations l where l.user_id = viewer
  ),
  my_interests as (
    select interest_id from public.profile_interests where user_id = viewer
  )
  select
    p.id,
    p.display_name,
    extract(year from age(current_date, p.birthdate))::int,
    p.city,
    p.bio,
    case
      when me.lat is null or loc.lat is null then null
      else round(
        6371 * 2 * asin(sqrt(
          power(sin(radians(loc.lat - me.lat) / 2), 2)
          + cos(radians(me.lat)) * cos(radians(loc.lat)) * power(sin(radians(loc.lng - me.lng) / 2), 2)
        ))
      )::int
    end,
    coalesce((
      select array_agg(pi.interest_id order by pi.interest_id)
      from public.profile_interests pi
      where pi.user_id = p.id and pi.interest_id in (select interest_id from my_interests)
    ), '{}'),
    coalesce((
      select array_agg(pi.interest_id order by pi.interest_id)
      from public.profile_interests pi where pi.user_id = p.id
    ), '{}'),
    coalesce((
      select array_agg(ph.storage_path order by ph.position, ph.created_at)
      from public.profile_photos ph where ph.user_id = p.id
    ), '{}'),
    p.created_at,
    coalesce((
      select jsonb_agg(jsonb_build_object('id', pr.id, 'question', pr.question, 'answer', pr.answer)
                       order by pr.position, pr.created_at)
      from public.profile_prompts pr where pr.user_id = p.id
    ), '[]'::jsonb),
    null::text
  from public.profiles p
  left join me on true
  left join public.profile_locations loc on loc.user_id = p.id
  where p.onboarded_at is not null
    and p.id <> viewer
    and not public.is_blocked(viewer, p.id);
$$;
revoke execute on function public._profile_cards(uuid) from public, anon, authenticated;

create or replace function public.likes_received()
returns setof public.profile_card
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.display_name, c.age, c.city, c.bio, c.distance_km, c.shared_interest_ids,
         c.interest_ids, c.photo_paths, c.created_at, c.prompts,
         (select pr.question from public.profile_prompts pr where pr.id = s.prompt_id)
  from public._profile_cards(auth.uid()) c
  join public.swipes s on s.actor = c.id and s.target = auth.uid() and s.kind = 'like'
  where public.is_onboarded(auth.uid())
    and not exists (
      select 1 from public.swipes mine where mine.actor = auth.uid() and mine.target = c.id
    )
  order by s.created_at desc;
$$;

-- swipe() gains an optional prompt: the like is attached to that prompt card.
drop function public.swipe(uuid, text);
create function public.swipe(p_target uuid, p_kind text, p_prompt uuid default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  mid uuid;
  pid uuid;
begin
  if p_kind = 'like' and p_prompt is not null then
    select id into pid from public.profile_prompts where id = p_prompt and user_id = p_target;
  end if;

  insert into public.swipes (actor, target, kind, prompt_id)
  values (auth.uid(), p_target, p_kind, pid)
  on conflict (actor, target) do nothing;

  select id into mid
  from public.matches
  where user_a = least(auth.uid(), p_target) and user_b = greatest(auth.uid(), p_target);
  return mid;
end;
$$;
revoke execute on function public.swipe(uuid, text, uuid) from public, anon;
grant execute on function public.swipe(uuid, text, uuid) to authenticated;

-- Include prompts in the GDPR export.
create or replace function public.export_my_data_v2()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.export_my_data() || jsonb_build_object(
    'prompts', coalesce((
      select jsonb_agg(jsonb_build_object('question', pr.question, 'answer', pr.answer) order by pr.position)
      from public.profile_prompts pr where pr.user_id = auth.uid()
    ), '[]'::jsonb)
  );
$$;
revoke execute on function public.export_my_data_v2() from public, anon;
grant execute on function public.export_my_data_v2() to authenticated;
