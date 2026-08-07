-- The double A journey <3 — Supabase schema
-- Run this once in your project's SQL Editor (Supabase dashboard > SQL Editor > New query).
-- Safe to re-run: it drops and recreates the `months` table.

-- ---------------------------------------------------------------------
-- 1. Months table (titles / date ranges / descriptions)
-- ---------------------------------------------------------------------

drop table if exists public.months;

create table public.months (
  number int primary key,
  title text not null,
  range text not null,
  description text not null default '',
  current boolean not null default false
);

alter table public.months enable row level security;

-- Anyone with the public anon key can READ. Only you, editing via the
-- Supabase dashboard (which uses your own login, not the anon key), can
-- write — there is no insert/update/delete policy for anon.
create policy "Public read access on months"
  on public.months for select
  using (true);

insert into public.months (number, title, range, description, current) values
  (1,  'Where It All Began',      'Oct 28 – Nov 28, 2025',            'Write about this month here! What happened, how you felt, the little things worth remembering. 🥹', false),
  (2,  'Getting Closer',          'Nov 28 – Dec 28, 2025',            'Fill me in! ✨', false),
  (3,  'Falling Deeper',          'Dec 28, 2025 – Jan 28, 2026',      'Fill me in! ✨', false),
  (4,  'New Year, Us',            'Jan 28 – Feb 28, 2026',            'Fill me in! ✨', false),
  (5,  'Half a Year? Almost!',    'Feb 28 – Mar 28, 2026',            'Fill me in! ✨', false),
  (6,  'Six Months of Us',        'Mar 28 – Apr 28, 2026',            'Fill me in! ✨', false),
  (7,  'Lucky Number Seven',      'Apr 28 – May 28, 2026',            'Fill me in! ✨', false),
  (8,  'Still Going Strong',      'May 28 – Jun 28, 2026',            'Fill me in! ✨', false),
  (9,  'Nine and Counting',       'Jun 28 – Jul 28, 2026',            'Fill me in! ✨', false),
  (10, 'Double Digits, Baby',     'Jul 28 – Aug 28, 2026',            'Fill me in! ✨', true);

-- ---------------------------------------------------------------------
-- 2. Storage bucket for photos, public + listable
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- Lets the anon key list files in a folder (needed so the app can
-- auto-discover photos you drop into month-XX/ without editing any code)
-- and read them back.
drop policy if exists "Public read access on photos bucket" on storage.objects;
create policy "Public read access on photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ---------------------------------------------------------------------
-- After running this:
--   1. Go to Storage > photos bucket in the dashboard.
--   2. Create a folder per month: month-01, month-02, ... month-10.
--   3. Drag your photos into the matching folder. That's it — no code
--      edits needed, the app lists whatever's in each folder.
-- ---------------------------------------------------------------------
