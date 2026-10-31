# Server-managed Dailies

The public build contains regular Puzzles, FTC and a race pool, but no Daily
schedule or Daily answers. The canonical schedule is `public.puzzles` in Supabase.
Previously published questions remain discoverable in Git history; this change
does not turn that old content into new secret content.

## Deployment order

1. Execute `supabase/daily_server_api.sql`. It adds restricted RPCs without
   taking away the old frontend's access.
2. Seed `netto_private.daily_question_details` using private editorial data.
   This table holds source explanations, units, subtitles and question photos.
   No editorial seed containing future answers belongs in the public repository.
3. Publish the updated frontend and verify `netto_daily_questions` and guest
   submission from a fresh browser session.
4. Execute `supabase/daily_server_lockdown.sql`. This closes raw puzzle reads,
   the legacy public view and direct ranked-score writes.

`tools/prepare_daily_server.cjs` performed the one-time conversion of the former
static set. Its content backup and upload payload are under ignored `.private/`.
The conversion also removes overlapping Daily questions from the public race
pool. The remaining multiplayer pool is unaffected by Daily scoring.

## API contract

- `netto_daily_questions(p_edition)` returns only released questions, their
  operator, photos and safe presentation metadata. Release is London midnight.
- `netto_submit_daily(p_puzzle_id,p_g1,p_g2,p_g3)` accepts positive safe integers.
  It rejects future/unpublished puzzles, calculates the symmetric factor and
  returns answers and source explanations after submission. Guests stay guests.
- For authenticated players the first submission for today's Daily wins, using
  an atomic insert. Subsequent submissions return that original result.
- Archive results never create a ranked submission or daily streak.
- `leaderboard_dag` recomputes factors from recorded guesses and server answers,
  including older records. Client-supplied factors are not authoritative.
- `netto_admin_daily_schedule` checks the admin identity and returns only what
  the existing composer needs. Scheduling writes retain existing admin RLS.

The frontend preserves input on a failed request and offers retry. It keeps
completed guest results on the device; signing in can post today's result, which
the server checks again. The UI distinguishes local results from ranked ones.

This is not comprehensive anti-cheat: guests can use another device and old
public questions can be researched. Abuse rate limits and first-party content
that has never been published are separate follow-up work.

## Verification

Run `node tests/daily-reliability.cjs`, `node tests/daily-server.cjs` and
`python tools/sync_website.py --check`. Test the RPCs as `anon` and
`authenticated`, including future dates, zero/fractional/NaN input, duplicate
submissions, direct table permissions and archived play. Account tests should
run in rolled-back transactions. Never use a service-role key in the frontend.
