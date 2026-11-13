-- Melt: blocked list, GDPR data export (Art. 15/20) and account deletion (Art. 17).

-- People you've blocked (their profiles are otherwise hidden from you by RLS).
create function public.my_blocks()
returns table (blocked uuid, display_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select b.blocked, coalesce(p.display_name, 'Deleted user'), b.created_at
  from public.blocks b
  left join public.profiles p on p.id = b.blocked
  where b.blocker = auth.uid()
  order by b.created_at desc;
$$;

-- Everything Melt stores about the caller, as one JSON document.
create function public.export_my_data()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'exported_at', now(),
    'account', (
      select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at)
      from auth.users u where u.id = auth.uid()
    ),
    'profile', (
      select to_jsonb(p) from public.profiles p where p.id = auth.uid()
    ),
    'approximate_location', (
      select jsonb_build_object('lat', l.lat, 'lng', l.lng, 'updated_at', l.updated_at)
      from public.profile_locations l where l.user_id = auth.uid()
    ),
    'interests', coalesce((
      select jsonb_agg(i.label order by i.sort_order)
      from public.profile_interests pi join public.interests i on i.id = pi.interest_id
      where pi.user_id = auth.uid()
    ), '[]'::jsonb),
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object('storage_path', ph.storage_path, 'position', ph.position, 'created_at', ph.created_at) order by ph.position)
      from public.profile_photos ph where ph.user_id = auth.uid()
    ), '[]'::jsonb),
    'swipes', coalesce((
      select jsonb_agg(jsonb_build_object('target', s.target, 'kind', s.kind, 'created_at', s.created_at) order by s.created_at)
      from public.swipes s where s.actor = auth.uid()
    ), '[]'::jsonb),
    'matches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'match_id', m.id,
        'matched_at', m.created_at,
        'other_user', case when m.user_a = auth.uid() then m.user_b else m.user_a end,
        'messages', coalesce((
          select jsonb_agg(jsonb_build_object(
            'from', case when x.sender_id = auth.uid() then 'me' else 'them' end,
            'body', x.body,
            'sent_at', x.created_at
          ) order by x.created_at)
          from public.messages x where x.match_id = m.id
        ), '[]'::jsonb)
      ) order by m.created_at)
      from public.matches m where auth.uid() in (m.user_a, m.user_b)
    ), '[]'::jsonb),
    'blocks', coalesce((
      select jsonb_agg(jsonb_build_object('blocked', b.blocked, 'created_at', b.created_at))
      from public.blocks b where b.blocker = auth.uid()
    ), '[]'::jsonb),
    'reports_filed', coalesce((
      select jsonb_agg(jsonb_build_object(
        'reported', r.reported, 'reason', r.reason, 'details', r.details,
        'status', r.status, 'created_at', r.created_at
      ) order by r.created_at)
      from public.reports r where r.reporter = auth.uid()
    ), '[]'::jsonb)
  );
$$;

-- Permanently deletes the caller's account. Everything that references the
-- profile cascades; reports they filed or received keep only the report text.
-- The client removes the caller's photo files from Storage first (Storage
-- objects can't be deleted from SQL).
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.my_blocks() from public, anon;
revoke execute on function public.export_my_data() from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.my_blocks() to authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
