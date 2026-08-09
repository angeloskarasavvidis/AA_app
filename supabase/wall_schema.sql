-- Couplebook — Wall feature schema
-- Run once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: uses "if not exists" / "or replace" throughout and never
-- drops wall_notes, so your notes are never wiped by re-running this
-- (unlike schema.sql, which intentionally resets `months` every time).

create extension if not exists pgcrypto;

create table if not exists public.wall_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  content text not null,
  color text not null default 'pink',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.wall_notes enable row level security;

-- No public/anon access at all — only a signed-in session (i.e. one of
-- your two real accounts) can see or touch the wall.

drop policy if exists "Authenticated read" on public.wall_notes;
create policy "Authenticated read"
  on public.wall_notes for select
  to authenticated
  using (true);

-- You can only ever post a note as yourself (can't impersonate the other
-- person), enforced server-side regardless of what the client sends.
drop policy if exists "Authenticated insert own" on public.wall_notes;
create policy "Authenticated insert own"
  on public.wall_notes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Either of you can pin/unpin or edit/delete ANY note, not just your own.
-- Deliberately permissive since it's just the two of you and a shared
-- corkboard should let either of you tidy it up. Tell me if you'd rather
-- lock edits/deletes to the original author only — it's a one-line policy
-- change (`using (auth.uid() = user_id)` instead of `using (true)`).
drop policy if exists "Authenticated update" on public.wall_notes;
create policy "Authenticated update"
  on public.wall_notes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated delete" on public.wall_notes;
create policy "Authenticated delete"
  on public.wall_notes for delete
  to authenticated
  using (true);

-- Optional but recommended: live updates. Without this, you only see a
-- new note after switching tabs / reloading. With it, if you're both on
-- the Wall tab at once, a new note from one of you appears instantly for
-- the other. Wrapped so re-running this script doesn't error if it's
-- already enabled.
do $$
begin
  alter publication supabase_realtime add table public.wall_notes;
exception
  when duplicate_object then null;
end $$;
