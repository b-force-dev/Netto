-- Preserve plays and existing function permissions. Only same-day server
-- submissions count toward an active streak, using the game's London timezone.
create or replace function public.leaderboard_streaks(p_datum date)
returns table(naam text, streak integer)
language sql stable security definer set search_path = public
as $$
  with cutoff as (
    select least(coalesce(p_datum, (now() at time zone 'Europe/London')::date),
                 (now() at time zone 'Europe/London')::date) as day
  ), eligible as (
    select distinct up.user_id, up.puzzle_date
    from public.user_plays up cross join cutoff c
    where up.puzzle_date <= c.day
      and (up.created_at at time zone 'Europe/London')::date = up.puzzle_date
  ), numbered as (
    select user_id, puzzle_date,
      puzzle_date - (row_number() over (partition by user_id order by puzzle_date))::int as group_id
    from eligible
  ), runs as (
    select user_id, count(*)::int as length, max(puzzle_date) as last_day
    from numbered group by user_id, group_id
  ), active as (
    select user_id, max(length)::int as length
    from runs cross join cutoff
    where last_day >= cutoff.day - 1
    group by user_id
  )
  select p.username, a.length
  from active a join public.profiles p on p.id = a.user_id
  where coalesce(p.leaderboard_zichtbaar, true)
  order by a.length desc, p.username asc limit 50;
$$;
