-- Profiles, consent, 18+ rule, location privacy and photo storage RLS.
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.de', '{"consent":{"adult":true,"terms":true,"privacy":true,"version":"test"}}'),
  ('33333333-3333-3333-3333-333333333333', 'c@test.de', '{}');

-- ---- as A --------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
set local role authenticated;

select throws_like(
  $$insert into public.profiles (id, display_name, birthdate, city)
    values ('11111111-1111-1111-1111-111111111111', 'A', (current_date - interval '17 years')::date, 'Erlangen')$$,
  '%at least 18%',
  'an under-18 profile is rejected by the database'
);
select lives_ok(
  $$insert into public.profiles (id, display_name, birthdate, city)
    values ('11111111-1111-1111-1111-111111111111', 'A', '1995-05-05', 'Erlangen')$$,
  'an adult can create their own profile'
);
select throws_like(
  $$insert into public.profiles (id, display_name, birthdate, city)
    values ('22222222-2222-2222-2222-222222222222', 'Fake', '1990-01-01', 'Erlangen')$$,
  '%row-level security%',
  'nobody can create a profile for someone else'
);
select ok(
  (select terms_accepted_at is not null and consent_version = 'test' and onboarded_at is null
     from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'consent is copied from signup metadata, onboarding not yet complete'
);
select throws_like(
  $$update public.profiles set onboarded_at = now() where id = '11111111-1111-1111-1111-111111111111'$$,
  '%photo%',
  'onboarding cannot complete without a photo'
);
select lives_ok(
  $$insert into public.profile_interests (user_id, interest_id) values ('11111111-1111-1111-1111-111111111111', 1)$$,
  'a user can add their own interest'
);
select lives_ok(
  $$insert into public.profile_photos (user_id, storage_path) values ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111/a.jpg')$$,
  'a user can register a photo in their own folder'
);
select throws_like(
  $$insert into public.profile_photos (user_id, storage_path) values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222/x.jpg')$$,
  '%check constraint%',
  'photo paths must live in the owner''s folder'
);
select lives_ok(
  $$insert into public.profile_locations (user_id, lat, lng) values ('11111111-1111-1111-1111-111111111111', 49.6, 11.0)$$,
  'a user can save their own location'
);
select lives_ok(
  $$update public.profiles set onboarded_at = now() where id = '11111111-1111-1111-1111-111111111111'$$,
  'onboarding completes once a photo and an interest exist'
);
select throws_like(
  $$update public.profiles set birthdate = '1980-01-01' where id = '11111111-1111-1111-1111-111111111111'$$,
  '%Birthdate%',
  'the birthdate is locked after onboarding'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('profile-photos', '11111111-1111-1111-1111-111111111111/a.jpg')$$,
  'a user can upload into their own storage folder'
);
select throws_like(
  $$insert into storage.objects (bucket_id, name) values ('profile-photos', '22222222-2222-2222-2222-222222222222/evil.jpg')$$,
  '%row-level security%',
  'nobody can upload into another user''s storage folder'
);
reset role;

-- ---- C signed up without consent ------------------------------------------
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
set local role authenticated;
select throws_like(
  $$insert into public.profiles (id, display_name, birthdate, city)
    values ('33333333-3333-3333-3333-333333333333', 'C', '1990-01-01', 'Erlangen')$$,
  '%Consent%',
  'a profile cannot be created without signup consent'
);
select is(
  (select count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  0,
  'a user who has not finished onboarding cannot see other profiles'
);
reset role;

-- ---- B is fully onboarded (setup as postgres) ------------------------------
insert into public.profiles (id, display_name, birthdate, city)
  values ('22222222-2222-2222-2222-222222222222', 'B', '1992-02-02', 'Nürnberg');
insert into public.profile_interests values ('22222222-2222-2222-2222-222222222222', 1);
insert into public.profile_photos (user_id, storage_path)
  values ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222/b.jpg');
insert into public.profile_locations (user_id, lat, lng) values ('22222222-2222-2222-2222-222222222222', 49.45, 11.1);
update public.profiles set onboarded_at = now() where id = '22222222-2222-2222-2222-222222222222';

-- ---- as A again ------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
set local role authenticated;
select is(
  (select count(*)::int from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  1,
  'an onboarded user can see another onboarded profile'
);
select is(
  (select count(*)::int from public.profile_locations where user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'nobody can read another user''s location'
);
update public.profiles set display_name = 'Hacked' where id = '22222222-2222-2222-2222-222222222222';
reset role;
select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'B',
  'nobody can edit another user''s profile'
);

-- ---- anonymous -------------------------------------------------------------
select set_config('request.jwt.claims', '', true);
set local role anon;
select throws_like(
  $$select * from public.profiles$$,
  '%permission denied%',
  'signed-out visitors cannot read any profile data'
);
reset role;

select * from finish();
rollback;
