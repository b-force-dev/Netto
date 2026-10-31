-- Netto: 1–3 November 2026, London midnight release (existing timezone rules).
-- Run in Supabase SQL Editor. Existing dates and previous plays are preserved.
begin;
insert into public.puzzles (id, scheduled_date, operator, question_1, question_2, question_3, true_answer_1, true_answer_2, true_answer_3, status, daily_edition, image_path, image_alt, image_caption, image_credit, image_source_url)
select v.* from (values
  ('d62b5040-d3be-4f89-a719-53d3f2f33b07', '2026-11-01', '÷', 'How many wingbeats per second can a hummingbird reach?', 'How many rings are in the Olympic symbol?', 'How many pieces does each player start with in chess?', 80, 5, 16, 'scheduled', 'daily-curated-20260927', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Trinidad_and_Tobago_hummingbirds_composite.jpg/330px-Trinidad_and_Tobago_hummingbirds_composite.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'How many wingbeats per second can a hummingbird reach?', 'With question 1', 'Charles J. Sharp · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Trinidad_and_Tobago_hummingbirds_composite.jpg'),
  ('7cad85a5-af14-4c9f-a4c1-6fef64f46d93', '2026-11-02', '−', 'In what year was the first digital camera developed?', 'How many rooms does Buckingham Palace have?', 'How many kilograms does an adult giraffe weigh?', 1975, 775, 1200, 'scheduled', 'daily-curated-20260927', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Buckingham_Palace%2C_London_-_April_2009.jpg/330px-Buckingham_Palace%2C_London_-_April_2009.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'How many rooms does Buckingham Palace have?', 'With question 2', 'Diliff · CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Buckingham_Palace,_London_-_April_2009.jpg'),
  ('f660ca3d-da29-4bf6-a743-3959a1ffaa5e', '2026-11-03', '×', 'What percentage of the human body is water?', 'How many horizontal stripes are on the flag of the Netherlands?', 'About how many kilograms does a blue whale''s heart weigh?', 60, 3, 180, 'scheduled', 'daily-curated-20260927', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg/330px-Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'About how many kilograms does a blue whale''s heart weigh?', 'With question 3', 'NOAA Photo Library · Public domain', 'https://commons.wikimedia.org/wiki/File:Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg')
) as input(id, scheduled_date, operator, question_1, question_2, question_3, true_answer_1, true_answer_2, true_answer_3, status, daily_edition, image_path, image_alt, image_caption, image_credit, image_source_url)
cross join lateral (select input.id::uuid as id, input.scheduled_date::date as scheduled_date,
input.operator, input.question_1, input.question_2, input.question_3, input.true_answer_1, input.true_answer_2, input.true_answer_3, input.status, input.daily_edition, input.image_path, input.image_alt, input.image_caption, input.image_credit, input.image_source_url) v
where not exists (select 1 from public.puzzles p where p.scheduled_date = v.scheduled_date)
on conflict (id) do nothing;
do $$ begin
  if (select count(*) from public.puzzles where status='scheduled' and daily_edition='daily-curated-20260927'
      and scheduled_date between date '2026-11-01' and date '2026-11-03') <> 3 then
    raise exception 'Daily schedule is incomplete or a date is already occupied by another edition. No changes saved.';
  end if;
end $$;
commit;
select scheduled_date, question_1, question_2, question_3, image_path, image_credit
from public.puzzles where scheduled_date between date '2026-11-01' and date '2026-11-03'
order by scheduled_date;
