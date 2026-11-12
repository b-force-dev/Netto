-- Additive, one-time migration. No existing objects are replaced or changed.
-- Requires the existing netto_private schema and public.is_admin().
begin;
create table netto_private.usage_events (
  id bigint generated always as identity primary key,
  day date not null default (now() at time zone 'Europe/London')::date,
  created_at timestamptz not null default now(),
  event_name text not null,
  mode text not null,
  language text not null,
  device_class text not null,
  referrer_host text not null,
  visitor_id uuid not null,
  first_visit boolean not null,
  kind text not null
);
alter table netto_private.usage_events enable row level security;
revoke all on netto_private.usage_events from public, anon, authenticated;
revoke all on sequence netto_private.usage_events_id_seq from public, anon, authenticated;
create index usage_events_visitor_day on netto_private.usage_events(visitor_id, day);
create index usage_events_day on netto_private.usage_events(day);

create function public.netto_track(
  p_event text, p_visitor_id uuid, p_mode text default '',
  p_language text default 'nl', p_device text default 'desktop',
  p_referrer text default '', p_first_visit boolean default false,
  p_kind text default ''
) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_day date := (now() at time zone 'Europe/London')::date;
begin
  if p_event is null or p_event not in ('visit','daily_start','daily_finish',
      'puzzle_start','puzzle_finish','race_start','race_finish','share','tutorial_done','install')
    or p_visitor_id is null or p_visitor_id = '00000000-0000-0000-0000-000000000000'::uuid
    or p_mode is null or p_mode not in ('','daily','archive','library','catalogus','connection','race')
    or p_language is null or p_language not in ('nl','en')
    or p_device is null or p_device not in ('mobile','desktop')
    or p_referrer is null or length(p_referrer) > 253
    or (p_referrer <> '' and p_referrer !~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$')
    or p_kind is null or p_kind not in ('','score','stats') or p_first_visit is null
    or (p_event in ('daily_start','daily_finish') and p_mode not in ('daily','archive'))
    or (p_event in ('race_start','race_finish') and p_mode <> 'race')
    or (p_event in ('puzzle_start','puzzle_finish') and p_mode not in ('library','catalogus','connection'))
  then raise exception 'Invalid usage event' using errcode = '22023'; end if;
  -- Serialize limits for the same random identifier; no IP/header inspection.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_visitor_id::text, 8271));
  if (select count(*) from netto_private.usage_events
      where visitor_id = p_visitor_id and day = v_day) >= 200
    or (select count(*) from netto_private.usage_events
      where visitor_id = p_visitor_id and created_at > now() - interval '1 minute') >= 30
    then return; end if;
  -- One visit per browser/day, even with multiple tabs and reloads.
  if p_event = 'visit' and exists (select 1 from netto_private.usage_events
    where visitor_id = p_visitor_id and day = v_day and event_name = 'visit') then return; end if;
  insert into netto_private.usage_events(event_name, visitor_id, mode, language,
    device_class, referrer_host, first_visit, kind)
  values(p_event,p_visitor_id,p_mode,p_language,p_device,p_referrer,p_first_visit,p_kind);
end;
$$;
revoke all on function public.netto_track(text,uuid,text,text,text,text,boolean,text) from public;
grant execute on function public.netto_track(text,uuid,text,text,text,text,boolean,text) to anon, authenticated;

create function public.netto_admin_usage() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if not coalesce(public.is_admin(),false) then
    raise exception 'Admin only' using errcode = '42501';
  end if;
  with visits as (
    select distinct visitor_id, day from netto_private.usage_events where event_name = 'visit'
  ), cohorts as (
    select visitor_id, min(day) as first_day from visits group by visitor_id
  ), days as (
    select ((now() at time zone 'Europe/London')::date - n) as day from generate_series(0,29) n
  ), daily as (
    select d.day,
      (select count(*) from visits v where v.day = d.day) as visitors,
      (select count(*) from cohorts c where c.first_day = d.day) as new_visitors,
      (select count(*) from visits v join cohorts c using(visitor_id)
        where v.day = d.day and c.first_day < d.day) as returning_visitors,
      (select count(*) from netto_private.usage_events e where e.day=d.day and event_name='share') as shares,
      (select count(*) from netto_private.usage_events e where e.day=d.day and event_name='tutorial_done') as tutorials,
      (select count(*) from netto_private.usage_events e where e.day=d.day and event_name='install') as installs,
      case when d.day + 1 < (now() at time zone 'Europe/London')::date then
        (select count(*) from cohorts c join visits v using(visitor_id) where c.first_day=d.day and v.day=d.day+1) end as d1,
      case when d.day + 7 < (now() at time zone 'Europe/London')::date then
        (select count(*) from cohorts c join visits v using(visitor_id) where c.first_day=d.day and v.day=d.day+7) end as d7
    from days d
  ), modes as (
    select day, mode,
      count(*) filter (where event_name in ('daily_start','puzzle_start','race_start')) as started,
      count(*) filter (where event_name in ('daily_finish','puzzle_finish','race_finish')) as finished
    from netto_private.usage_events where day >= (now() at time zone 'Europe/London')::date-29
      and event_name in ('daily_start','puzzle_start','race_start','daily_finish','puzzle_finish','race_finish')
    group by day,mode
  ), referrers as (
    select referrer_host, count(distinct visitor_id) as visitors
    from netto_private.usage_events where event_name='visit'
      and day >= (now() at time zone 'Europe/London')::date-29
    group by referrer_host order by visitors desc, referrer_host limit 20
  ) select jsonb_build_object(
    'days', (select jsonb_agg(to_jsonb(d) order by day desc) from daily d),
    'modes', coalesce((select jsonb_agg(to_jsonb(m) order by day desc,mode) from modes m),'[]'::jsonb),
    'referrers',coalesce((select jsonb_agg(to_jsonb(r)) from referrers r),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.netto_admin_usage() from public, anon;
grant execute on function public.netto_admin_usage() to authenticated;
commit;
