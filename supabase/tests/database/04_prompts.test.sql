-- Sport prompts: ownership, limits, visibility and "melted on" likes.
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'a@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'b@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}');
insert into public.profiles (id, display_name, birthdate, city) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'Ann', '1990-01-01', 'Erlangen'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'Ben', '1990-01-01', 'Erlangen');
insert into public.profile_interests values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 1), ('bbbbbbbb-0000-0000-0000-00000000000b', 1);
insert into public.profile_photos (user_id, storage_path) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-00000000000a/a.jpg'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'bbbbbbbb-0000-0000-0000-00000000000b/b.jpg');
update public.profiles set onboarded_at = now();

-- ---- Ben writes prompts ----------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$insert into public.profile_prompts (user_id, question, answer, position) values
    ('bbbbbbbb-0000-0000-0000-00000000000b', 'Currently training for…', 'Berlin Marathon. Sub-3 or bust.', 0),
    ('bbbbbbbb-0000-0000-0000-00000000000b', 'Post-workout ritual…', 'Cold shower, flat white.', 1),
    ('bbbbbbbb-0000-0000-0000-00000000000b', 'Favourite snack bar…', 'Peanut butter anything.', 2),
    ('bbbbbbbb-0000-0000-0000-00000000000b', 'My current PR is…', '10k in 40:00', 3),
    ('bbbbbbbb-0000-0000-0000-00000000000b', 'My sport origin story…', 'School cross-country.', 4)$$,
  'a user can answer up to five prompts'
);
select throws_like(
  $$insert into public.profile_prompts (user_id, question, answer) values
    ('bbbbbbbb-0000-0000-0000-00000000000b', 'My simple pleasures…', 'Coffee.')$$,
  '%up to 5%',
  'a sixth prompt is rejected'
);
select throws_like(
  $$insert into public.profile_prompts (user_id, question, answer) values
    ('aaaaaaaa-0000-0000-0000-00000000000a', 'My current PR is…', 'fake')$$,
  '%row-level security%',
  'nobody can write prompts for someone else'
);
select throws_like(
  $$update public.profile_prompts set question = 'Something made up' where user_id = 'bbbbbbbb-0000-0000-0000-00000000000b' and position = 0$$,
  '%check constraint%',
  'only questions from the prompt library are allowed'
);
reset role;

-- ---- Ann sees and melts on a prompt ----------------------------------------------
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select is(
  (select jsonb_array_length(prompts) from public.discover_candidates(10) where id = 'bbbbbbbb-0000-0000-0000-00000000000b'),
  5,
  'discovery cards include the person''s prompts'
);
select is(
  (select prompts -> 0 ->> 'question' from public.get_profile_card('bbbbbbbb-0000-0000-0000-00000000000b')),
  'Currently training for…',
  'prompts come back in the chosen order'
);
select lives_ok(
  $$select public.swipe('bbbbbbbb-0000-0000-0000-00000000000b', 'like',
      (select id from public.profile_prompts where question = 'Post-workout ritual…'))$$,
  'a like can be attached to a prompt'
);
reset role;

-- ---- Ben sees which prompt Ann melted on ------------------------------------------
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
select is(
  (select liked_prompt from public.likes_received()),
  'Post-workout ritual…',
  'likes_received shows the prompt you were melted on'
);
select is(
  (select jsonb_array_length(public.export_my_data_v2() -> 'prompts')),
  5,
  'the data export includes your prompts'
);
reset role;

-- ---- A like can't point at someone else's prompt -----------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('cccccccc-0000-0000-0000-00000000000c', 'c@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}');
insert into public.profiles (id, display_name, birthdate, city) values ('cccccccc-0000-0000-0000-00000000000c', 'Cat', '1990-01-01', 'Erlangen');
insert into public.profile_interests values ('cccccccc-0000-0000-0000-00000000000c', 1);
insert into public.profile_photos (user_id, storage_path) values ('cccccccc-0000-0000-0000-00000000000c', 'cccccccc-0000-0000-0000-00000000000c/c.jpg');
update public.profiles set onboarded_at = now() where id = 'cccccccc-0000-0000-0000-00000000000c';

select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$select public.swipe('cccccccc-0000-0000-0000-00000000000c', 'like',
      (select id from public.profile_prompts where question = 'Favourite snack bar…'))$$,
  'liking with a mismatched prompt still works'
);
reset role;
select is(
  (select prompt_id from public.swipes where target = 'cccccccc-0000-0000-0000-00000000000c'),
  null::uuid,
  'but the mismatched prompt is dropped'
);

select * from finish();
rollback;
