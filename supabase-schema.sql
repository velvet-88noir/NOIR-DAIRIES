
-- NOIR DAIRIES DATABASE
-- Replace the email below with your exact owner login email.

create table if not exists public.noir_submissions (
  id uuid primary key default gen_random_uuid(),

  nickname text not null
    check (char_length(btrim(nickname)) between 1 and 24),

  answers jsonb not null
    check (jsonb_typeof(answers) = 'object'),

  written_answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(written_answers) = 'object'),

  score smallint not null
    check (score between 0 and 23),

  total_questions smallint not null default 23
    check (total_questions = 23),

  created_at timestamptz not null default now()
);

alter table public.noir_submissions enable row level security;

-- Remove broad table access.
revoke all on table public.noir_submissions from anon, authenticated;

-- Friends can submit quiz entries.
grant insert (
  nickname,
  answers,
  written_answers,
  score,
  total_questions
)
on public.noir_submissions to anon;

-- Signed-in owner can read entries.
grant select (
  id,
  nickname,
  answers,
  written_answers,
  score,
  total_questions,
  created_at
)
on public.noir_submissions to authenticated;

-- Allow public submissions, but not public reading.
drop policy if exists "Anyone can submit a quiz entry"
on public.noir_submissions;

create policy "Anyone can submit a quiz entry"
on public.noir_submissions
for insert
to anon
with check (true);

-- Only the owner email can read submissions.
drop policy if exists "Only the owner can view quiz entries"
on public.noir_submissions;

create policy "Only the owner can view quiz entries"
on public.noir_submissions
for select
to authenticated
using (
  lower((select auth.jwt() ->> 'email')) =
  lower('REPLACE_WITH_OWNER_EMAIL')
);

-- No public update or delete permissions are granted.
