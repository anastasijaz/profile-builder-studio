-- Melt: discovery, likes, matches.
-- These functions return other people's data without ever exposing their
-- coordinates: distance is computed here and returned as whole kilometres.

create type public.profile_card as (
  id uuid,
  display_name text,
  age int,
  city text,
  bio text,
  distance_km int,
  shared_interest_ids smallint[],
  interest_ids smallint[],
  photo_paths text[],
  created_at timestamptz
);

-- Internal: every profile `viewer` may see, as cards. Not callable by clients.
create function public._profile_cards(viewer uuid)
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
    p.created_at
  from public.profiles p
  left join me on true
  left join public.profile_locations loc on loc.user_id = p.id
  where p.onboarded_at is not null
    and p.id <> viewer
    and not public.is_blocked(viewer, p.id);
$$;

revoke execute on function public._profile_cards(uuid) from public, anon, authenticated;

-- Discovery queue: people you haven't swiped yet, ranked by shared interests,
-- then distance (unknown last), then newest.
create function public.discover_candidates(p_limit int default 20)
returns setof public.profile_card
language sql
stable
security definer
set search_path = ''
as $$
  select c.*
  from public._profile_cards(auth.uid()) c
  where public.is_onboarded(auth.uid())
    and not exists (
      select 1 from public.swipes s where s.actor = auth.uid() and s.target = c.id
    )
  order by cardinality(c.shared_interest_ids) desc, c.distance_km asc nulls last, c.created_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

-- A single profile you're allowed to see (used for /people/$userId).
create function public.get_profile_card(p_target uuid)
returns setof public.profile_card
language sql
stable
security definer
set search_path = ''
as $$
  select c.*
  from public._profile_cards(auth.uid()) c
  where c.id = p_target and public.is_onboarded(auth.uid());
$$;

-- People who liked you and are still waiting for your answer.
create function public.likes_received()
returns setof public.profile_card
language sql
stable
security definer
set search_path = ''
as $$
  select c.*
  from public._profile_cards(auth.uid()) c
  join public.swipes s on s.actor = c.id and s.target = auth.uid() and s.kind = 'like'
  where public.is_onboarded(auth.uid())
    and not exists (
      select 1 from public.swipes mine where mine.actor = auth.uid() and mine.target = c.id
    )
  order by s.created_at desc;
$$;

-- Like or pass. Returns the match id when the like is mutual, otherwise null.
-- Runs as the caller, so the swipes RLS policy still applies.
create function public.swipe(p_target uuid, p_kind text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  mid uuid;
begin
  insert into public.swipes (actor, target, kind)
  values (auth.uid(), p_target, p_kind)
  on conflict (actor, target) do nothing;

  select id into mid
  from public.matches
  where user_a = least(auth.uid(), p_target) and user_b = greatest(auth.uid(), p_target);
  return mid;
end;
$$;

-- Your matches with the other person's name and first photo, the last message
-- and your unread count. Pass p_match to fetch one.
create function public.my_matches(p_match uuid default null)
returns table (
  match_id uuid,
  other_id uuid,
  display_name text,
  photo_path text,
  last_body text,
  last_at timestamptz,
  last_sender uuid,
  unread int,
  matched_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id,
    o.id,
    o.display_name,
    (select ph.storage_path from public.profile_photos ph
      where ph.user_id = o.id order by ph.position, ph.created_at limit 1),
    lm.body,
    lm.created_at,
    lm.sender_id,
    (select count(*) from public.messages x
      where x.match_id = m.id
        and x.sender_id <> auth.uid()
        and x.created_at > coalesce(r.last_read_at, '-infinity'::timestamptz))::int,
    m.created_at
  from public.matches m
  join public.profiles o
    on o.id = case when m.user_a = auth.uid() then m.user_b else m.user_a end
  left join lateral (
    select body, created_at, sender_id from public.messages
    where match_id = m.id order by created_at desc limit 1
  ) lm on true
  left join public.match_reads r on r.match_id = m.id and r.user_id = auth.uid()
  where auth.uid() in (m.user_a, m.user_b)
    and not public.is_blocked(m.user_a, m.user_b)
    and (p_match is null or m.id = p_match)
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

revoke execute on function public.discover_candidates(int) from public, anon;
revoke execute on function public.get_profile_card(uuid) from public, anon;
revoke execute on function public.likes_received() from public, anon;
revoke execute on function public.swipe(uuid, text) from public, anon;
revoke execute on function public.my_matches(uuid) from public, anon;
grant execute on function public.discover_candidates(int) to authenticated;
grant execute on function public.get_profile_card(uuid) to authenticated;
grant execute on function public.likes_received() to authenticated;
grant execute on function public.swipe(uuid, text) to authenticated;
grant execute on function public.my_matches(uuid) to authenticated;
