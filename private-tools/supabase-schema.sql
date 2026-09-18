-- The Dojo — Supabase schema. Paste this whole file into the Supabase SQL Editor and run it once.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).

-- ── PROGRESS: one row per user per course, a JSON blob of passed exercises ───────────────
create table if not exists public.progress (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  course     text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, course)
);
alter table public.progress enable row level security;
drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
create policy "progress_select_own" on public.progress for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress for update using (auth.uid() = user_id);

-- ── ENTITLEMENTS: which courses a user owns (granted only via redeem_code) ────────────────
create table if not exists public.entitlements (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  course     text        not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, course)
);
alter table public.entitlements enable row level security;
drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements for select using (auth.uid() = user_id);
-- no insert/update/delete policy on purpose: only the redeem_code() function can grant access.

-- ── CODES: one-time redemption codes (clients can NOT read this table directly) ───────────
create table if not exists public.codes (
  code        text        primary key,
  course      text        not null,
  label       text,
  redeemed_by uuid        references auth.users(id),
  redeemed_at timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.codes enable row level security;
-- no policies at all: RLS denies every direct client read/write. Only SECURITY DEFINER functions touch it.

-- ── REDEEM: a student redeems a code -> their account owns that course ────────────────────
create or replace function public.redeem_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course   text;
  v_redeemed uuid;
begin
  if auth.uid() is null then
    raise exception 'not_logged_in';
  end if;

  select course, redeemed_by into v_course, v_redeemed
  from public.codes where code = p_code;

  if v_course is null then
    raise exception 'invalid_code';
  end if;

  -- already redeemed by someone else -> reject; by the same user -> idempotent success
  if v_redeemed is not null and v_redeemed <> auth.uid() then
    raise exception 'already_redeemed';
  end if;

  if v_redeemed is null then
    update public.codes
      set redeemed_by = auth.uid(), redeemed_at = now()
      where code = p_code;
  end if;

  insert into public.entitlements(user_id, course)
    values (auth.uid(), v_course)
    on conflict (user_id, course) do nothing;

  return v_course;
end;
$$;
grant execute on function public.redeem_code(text) to authenticated;

-- ── OPTIONAL: manually grant a course to a user by email (run as project owner in SQL editor)
-- select id from auth.users where email = 'student@example.com';
-- insert into public.entitlements(user_id, course) values ('<that-uuid>', 'python') on conflict do nothing;

-- ── ADD A CODE (you run this to create a code for a student who paid) ─────────────────────
-- insert into public.codes(code, course, label) values ('K7XQ-9F3M-4WYT', 'python', 'Nguyen Van A');
