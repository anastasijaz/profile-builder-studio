-- Blocking, reporting, data export and account deletion.
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}');
insert into public.profiles (id, display_name, birthdate, city) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ann', '1990-01-01', 'Erlangen'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ben', '1990-01-01', 'Erlangen');
insert into public.profile_interests values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1), ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1);
insert into public.profile_photos (user_id, storage_path) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/a.jpg'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/b.jpg');
update public.profiles set onboarded_at = now();
insert into public.swipes (actor, target, kind) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'like'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'like');
insert into public.messages (match_id, sender_id, body)
  select id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'rude message' from public.matches;

-- ---- Ann reports Ben's message, then blocks him -------------------------------
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$insert into public.reports (reporter, reported, message_id, reason)
    select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', id, 'harassment' from public.messages$$,
  'a user can report a message they received'
);
select throws_like(
  $$insert into public.reports (reporter, reported, reason)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'spam')$$,
  '%row-level security%',
  'nobody can file a report in someone else''s name'
);
select is((select count(*)::int from public.reports), 0, 'reports are not readable through the API');
select lives_ok(
  $$insert into public.blocks (blocker, blocked) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')$$,
  'a user can block someone'
);
select is((select count(*)::int from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'the blocker no longer sees the blocked profile');
select is((select count(*)::int from public.matches), 0, 'the match is hidden after a block');
select is((select count(*)::int from public.my_matches()), 0, 'the chat disappears from the chat list');
select is((select display_name from public.my_blocks()), 'Ben', 'the blocked person is listed in Settings');
select is(
  (select jsonb_array_length(public.export_my_data() -> 'reports_filed')),
  1,
  'the export includes reports the user filed'
);
select ok(
  (select (d -> 'account' ->> 'email') = 'a@test.de'
      and (d -> 'interests' ->> 0) = 'Running'
      and jsonb_array_length(d -> 'matches' -> 0 -> 'messages') = 1
     from (select public.export_my_data() d) x),
  'the export contains account, interests and messages'
);
reset role;

select ok(
  (select reported = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' and message_body = 'rude message' from public.reports),
  'the report keeps a snapshot of the reported message'
);

-- ---- Ben is blocked --------------------------------------------------------------
-- Ben can't see the match any more, so hand him its id to try posting anyway.
create temporary table _m on commit drop as select id from public.matches;
grant select on _m to authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*)::int from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0, 'the blocked user no longer sees the blocker');
select is((select count(*)::int from public.discover_candidates(20)), 0, 'neither appears in the other''s discovery');
select is((select count(*)::int from public.messages), 0, 'the blocked user can no longer read the chat');
select throws_like(
  $$insert into public.messages (match_id, sender_id, body)
    select id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'still there?' from _m$$,
  '%row-level security%',
  'the blocked user can no longer send messages'
);
delete from public.blocks;
select is(
  (select count(*)::int from public.blocks), 0, 'the blocked user cannot remove the block (sees none)'
);
select lives_ok($$select public.delete_my_account()$$, 'a user can delete their own account');
reset role;

select is((select count(*)::int from auth.users where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'the auth user is deleted');
select is((select count(*)::int from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'the profile is deleted');
select is((select count(*)::int from public.profile_photos where user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 0, 'photo records are deleted');
select is((select count(*)::int from public.matches), 0, 'matches are deleted');
select is((select count(*)::int from public.messages), 0, 'messages are deleted');
select is((select count(*)::int from public.blocks), 0, 'blocks are deleted');
select ok(
  (select reported is null and message_body = 'rude message' from public.reports),
  'the report survives, without the deleted user''s id'
);
select is((select count(*)::int from auth.users where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 1, 'other accounts are untouched');

select * from finish();
rollback;
