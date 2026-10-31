-- Stage 1: deploy before the frontend. No existing permissions are removed here.
begin;
create schema if not exists netto_private;
revoke all on schema netto_private from public, anon, authenticated;
create table if not exists netto_private.daily_question_details (
  question_key text primary key,
  details jsonb not null
);
alter table netto_private.daily_question_details enable row level security;
revoke all on netto_private.daily_question_details from public, anon, authenticated;

create or replace function netto_private.question_key(label text)
returns text language sql immutable set search_path = '' as $$
  select trim(regexp_replace(regexp_replace(lower(replace(label, '’', '''')),
    '\m(about|approximately|roughly)\M', '', 'g'), '[^[:alnum:]]+', ' ', 'g'));
$$;
revoke all on function netto_private.question_key(text) from public, anon, authenticated;

create or replace function public.netto_daily_questions(p_edition text default null)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(item order by scheduled_date desc), '[]'::jsonb)
  from (
    select p.scheduled_date, jsonb_build_object(
      'id', p.id, 'scheduled_date', p.scheduled_date, 'daily_edition', p.daily_edition,
      'question_1', p.question_1, 'question_2', p.question_2, 'question_3', p.question_3,
      'operator', p.operator, 'image_path', p.image_path, 'image_alt', p.image_alt,
      'image_caption', p.image_caption, 'image_credit', p.image_credit, 'image_source_url', p.image_source_url,
      'question_details', (select coalesce(jsonb_agg(jsonb_build_object(
        'label', q.label, 'unit', d.details->>'unit', 'subtitle', d.details->>'subtitle',
        'original', d.details->>'original', 'id', d.details->>'id',
        'category', d.details->>'category', 'photo', d.details->'photo'
      ) order by q.position), '[]'::jsonb)
      from (values (1,p.question_1),(2,p.question_2),(3,p.question_3)) q(position,label)
      left join netto_private.daily_question_details d on d.question_key = netto_private.question_key(q.label))
    ) as item
    from public.puzzles p
    where p.status = 'scheduled' and p.scheduled_date <= (now() at time zone 'Europe/London')::date
      and (p_edition is null or p.daily_edition = p_edition)
  ) released;
$$;
revoke all on function public.netto_daily_questions(text) from public, anon, authenticated;
grant execute on function public.netto_daily_questions(text) to anon, authenticated;

create or replace function public.netto_submit_daily(p_puzzle_id uuid, p_g1 numeric, p_g2 numeric, p_g3 numeric)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  puzzle public.puzzles%rowtype;
  saved public.user_plays%rowtype;
  player uuid := auth.uid();
  today date := (now() at time zone 'Europe/London')::date;
  guesses numeric[] := array[p_g1,p_g2,p_g3];
  answers numeric[];
  factor numeric;
  i integer;
  submitted_at timestamptz := clock_timestamp();
  ranked boolean := false;
begin
  for i in 1..3 loop
    if guesses[i] is null or guesses[i] < 1 or guesses[i] > 9007199254740991
       or trunc(guesses[i]) <> guesses[i] then
      raise exception 'Enter three positive whole numbers.' using errcode='22023';
    end if;
  end loop;
  select * into puzzle from public.puzzles
    where id = p_puzzle_id and status='scheduled' and scheduled_date <= today;
  if not found then raise exception 'This Daily is not available.' using errcode='22023'; end if;
  answers := array[puzzle.true_answer_1,puzzle.true_answer_2,puzzle.true_answer_3];
  if answers[1] <= 0 or answers[2] <= 0 or answers[3] <= 0 then
    raise exception 'This Daily needs an editorial check.';
  end if;
  factor := (greatest(guesses[1]/answers[1],answers[1]/guesses[1])
           + greatest(guesses[2]/answers[2],answers[2]/guesses[2])
           + greatest(guesses[3]/answers[3],answers[3]/guesses[3])) / 3;
  if player is not null and puzzle.scheduled_date = today then
    -- Atomic first submission wins, including simultaneous browser tabs.
    insert into public.user_plays(user_id,puzzle_date,g1,g2,g3,factor)
    values(player,today,guesses[1],guesses[2],guesses[3],factor)
    on conflict(user_id,puzzle_date) do nothing;
    select * into saved from public.user_plays where user_id=player and puzzle_date=today;
    guesses := array[saved.g1,saved.g2,saved.g3];
    if guesses[1] <= 0 or guesses[2] <= 0 or guesses[3] <= 0 then raise exception 'Invalid saved Daily.'; end if;
    factor := (greatest(guesses[1]/answers[1],answers[1]/guesses[1])
             + greatest(guesses[2]/answers[2],answers[2]/guesses[2])
             + greatest(guesses[3]/answers[3],answers[3]/guesses[3])) / 3;
    submitted_at := saved.created_at;
    ranked := true;
  end if;
  return jsonb_build_object('puzzle_id',puzzle.id,'date',puzzle.scheduled_date,
    'guesses',guesses,'answers',answers,'factor',factor,'submitted_at',submitted_at,'ranked',ranked,
    'question_details',(select coalesce(jsonb_agg(jsonb_build_object('label',q.label)
      || coalesce(d.details,'{}'::jsonb) order by q.position),'[]'::jsonb)
      from (values (1,puzzle.question_1),(2,puzzle.question_2),(3,puzzle.question_3)) q(position,label)
      left join netto_private.daily_question_details d on d.question_key=netto_private.question_key(q.label)));
end;
$$;
revoke all on function public.netto_submit_daily(uuid,numeric,numeric,numeric) from public, anon, authenticated;
grant execute on function public.netto_submit_daily(uuid,numeric,numeric,numeric) to anon, authenticated;

-- The composer only needs scheduling metadata; it does not need raw answers.
create or replace function public.netto_admin_daily_schedule()
returns table(id uuid,scheduled_date date,status text,source_library_id text,question_1 text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin access required.' using errcode='42501'; end if;
  return query select p.id,p.scheduled_date,p.status,p.source_library_id,p.question_1
    from public.puzzles p order by p.scheduled_date desc limit 400;
end;
$$;
revoke all on function public.netto_admin_daily_schedule() from public, anon, authenticated;
grant execute on function public.netto_admin_daily_schedule() to authenticated;

-- Recompute from submitted guesses; never trust a client-provided factor,
-- including factors saved by older frontend versions.
create or replace function public.leaderboard_dag(p_datum date)
returns table(naam text, factor numeric)
language sql stable security definer set search_path = '' as $$
  select profile.username,
    (greatest(up.g1/p.true_answer_1,p.true_answer_1/up.g1)
     + greatest(up.g2/p.true_answer_2,p.true_answer_2/up.g2)
     + greatest(up.g3/p.true_answer_3,p.true_answer_3/up.g3))/3 as computed_factor
  from public.user_plays up
  join public.profiles profile on profile.id=up.user_id
  join lateral (select puzzle.* from public.puzzles puzzle
    where puzzle.scheduled_date=up.puzzle_date and puzzle.status='scheduled'
    order by puzzle.created_at desc limit 1) p on true
  where up.puzzle_date=p_datum and p_datum <= (now() at time zone 'Europe/London')::date
    and coalesce(profile.leaderboard_zichtbaar,true)
    and up.g1 > 0 and up.g2 > 0 and up.g3 > 0
    and p.true_answer_1 > 0 and p.true_answer_2 > 0 and p.true_answer_3 > 0
  order by computed_factor asc, profile.username asc limit 50;
$$;
commit;
