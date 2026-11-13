-- Discovery ranking, likes, matches, messages and unread counts.
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

-- Users: 1 = me (Erlangen, interests 1,2,3), others vary by shared interests and distance.
insert into auth.users (id, email, raw_user_meta_data)
select ('00000000-0000-0000-0000-00000000000' || n)::uuid, 'u' || n || '@test.de',
       '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}'::jsonb
from generate_series(1, 7) n;

insert into public.profiles (id, display_name, birthdate, city)
select ('00000000-0000-0000-0000-00000000000' || n)::uuid, 'U' || n, '1994-03-03', 'Erlangen'
from generate_series(1, 7) n;

insert into public.profile_photos (user_id, storage_path)
select ('00000000-0000-0000-0000-00000000000' || n)::uuid, '00000000-0000-0000-0000-00000000000' || n || '/a.jpg'
from generate_series(1, 7) n;

insert into public.profile_interests (user_id, interest_id) values
  ('00000000-0000-0000-0000-000000000001', 1), ('00000000-0000-0000-0000-000000000001', 2), ('00000000-0000-0000-0000-000000000001', 3),
  ('00000000-0000-0000-0000-000000000002', 1), ('00000000-0000-0000-0000-000000000002', 2), ('00000000-0000-0000-0000-000000000002', 3),
  ('00000000-0000-0000-0000-000000000003', 1),
  ('00000000-0000-0000-0000-000000000004', 1), ('00000000-0000-0000-0000-000000000004', 2), ('00000000-0000-0000-0000-000000000004', 3), ('00000000-0000-0000-0000-000000000004', 4),
  ('00000000-0000-0000-0000-000000000005', 2), ('00000000-0000-0000-0000-000000000005', 3),
  ('00000000-0000-0000-0000-000000000006', 10),
  ('00000000-0000-0000-0000-000000000007', 1);

insert into public.profile_locations (user_id, lat, lng) values
  ('00000000-0000-0000-0000-000000000001', 49.6, 11.0),   -- me, Erlangen
  ('00000000-0000-0000-0000-000000000002', 52.5, 13.4),   -- Berlin, 3 shared
  ('00000000-0000-0000-0000-000000000003', 49.45, 11.1),  -- Nürnberg, 1 shared
  ('00000000-0000-0000-0000-000000000004', 49.6, 11.05),  -- Erlangen, 3 shared
  ('00000000-0000-0000-0000-000000000006', 49.6, 11.0);   -- nearest, 0 shared
  -- 5 has no location (2 shared)

update public.profiles set onboarded_at = now()
where id <> '00000000-0000-0000-0000-000000000007';  -- 7 never finishes onboarding

-- ---- as me -----------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select is(
  (select array_agg(right(id::text, 1) order by ord)
     from public.discover_candidates(20) with ordinality as t(id, display_name, age, city, bio, distance_km, shared_interest_ids, interest_ids, photo_paths, created_at, ord)),
  array['4', '2', '5', '3', '6'],
  'discovery ranks by shared interests, then distance, unknown distance last; skips non-onboarded'
);
select ok(
  (select distance_km between 340 and 380 from public.discover_candidates(20) where id = '00000000-0000-0000-0000-000000000002'),
  'distance is returned in km (Erlangen to Berlin)'
);
select is(
  public.swipe('00000000-0000-0000-0000-000000000004', 'like'),
  null::uuid,
  'a one-sided like does not create a match'
);
select lives_ok($$select public.swipe('00000000-0000-0000-0000-000000000006', 'pass')$$, 'passing works');
select is(
  (select count(*)::int from public.discover_candidates(20)
    where id in ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006')),
  0,
  'swiped people leave the discovery queue'
);
select throws_like(
  $$insert into public.matches (user_a, user_b) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003')$$,
  '%row-level security%',
  'clients cannot create matches directly'
);
select throws_like(
  $$insert into public.swipes (actor, target, kind) values ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'like')$$,
  '%row-level security%',
  'nobody can like on someone else''s behalf'
);
reset role;

-- ---- as 4 ------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
set local role authenticated;
select is(
  (select count(*)::int from public.swipes),
  0,
  'other people''s likes are not readable directly'
);
select is(
  (select array_agg(id) from public.likes_received()),
  array['00000000-0000-0000-0000-000000000001'::uuid],
  'likes_received shows who liked you'
);
select isnt(
  public.swipe('00000000-0000-0000-0000-000000000001', 'like'),
  null::uuid,
  'liking back creates a match and returns its id'
);
select is((select count(*)::int from public.likes_received()), 0, 'answered likes leave the likes list');
select lives_ok(
  $$insert into public.messages (match_id, sender_id, body)
    select id, '00000000-0000-0000-0000-000000000004', 'hey' from public.matches$$,
  'matched users can message each other'
);
select throws_like(
  $$insert into public.messages (match_id, sender_id, body)
    select id, '00000000-0000-0000-0000-000000000001', 'spoofed' from public.matches$$,
  '%row-level security%',
  'nobody can send a message as someone else'
);
reset role;

-- ---- as 3 (not matched with anyone) ---------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*)::int from public.messages), 0, 'non-participants cannot read a match''s messages');
select is((select count(*)::int from public.matches), 0, 'non-participants cannot see the match');
reset role;
-- 3 can't see the match, so hand them its id to try posting into it anyway.
create temporary table _m on commit drop as select id from public.matches;
grant select on _m to authenticated;
set local role authenticated;
select throws_like(
  $$insert into public.messages (match_id, sender_id, body)
    select id, '00000000-0000-0000-0000-000000000003', 'hi' from _m$$,
  '%row-level security%',
  'users who are not in a match cannot message into it'
);
reset role;

-- ---- as me: chat list and unread ------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;
select ok(
  (select unread = 1 and last_body = 'hey' and display_name = 'U4' from public.my_matches()),
  'my_matches shows the last message and unread count'
);
select lives_ok(
  $$insert into public.match_reads (match_id, user_id, last_read_at)
    select id, '00000000-0000-0000-0000-000000000001', now() + interval '1 second' from public.matches$$,
  'marking a chat as read works'
);
select is((select unread from public.my_matches()), 0, 'reading a chat clears its unread count');
reset role;

select * from finish();
rollback;
