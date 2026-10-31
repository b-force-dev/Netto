-- Stage 2: only after the new frontend is published. Keep admin inserts under
-- existing admin RLS. Public and signed-in scores must use the guarded RPC.
begin;
revoke select, truncate on public.puzzles from public, anon, authenticated;
revoke all on public.puzzles_public from public, anon, authenticated;
revoke insert, update, delete, truncate on public.user_plays from public, anon, authenticated;
-- Remove any historical column grants as well as table grants.
do $$ declare column_record record; begin
  for column_record in select column_name from information_schema.columns
    where table_schema='public' and table_name='puzzles' loop
    execute format('revoke select (%I) on public.puzzles from public, anon, authenticated', column_record.column_name);
  end loop;
end $$;
commit;
