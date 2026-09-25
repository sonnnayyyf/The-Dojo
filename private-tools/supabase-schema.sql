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

  -- Atomically claim an unredeemed code in one statement (no read-then-write race).
  -- Two concurrent callers can't both win: only one UPDATE matches redeemed_by IS NULL.
  update public.codes
    set redeemed_by = auth.uid(), redeemed_at = now()
    where code = p_code and redeemed_by is null
    returning course into v_course;

  if v_course is null then
    -- either the code doesn't exist, or it's already redeemed (possibly by this same user)
    select course, redeemed_by into v_course, v_redeemed
    from public.codes where code = p_code;

    if v_course is null then
      raise exception 'invalid_code';
    elsif v_redeemed is distinct from auth.uid() then
      raise exception 'already_redeemed';
    end if;
    -- else: already redeemed by this same user -> idempotent success, fall through
  end if;

  insert into public.entitlements(user_id, course)
    values (auth.uid(), v_course)
    on conflict (user_id, course) do nothing;

  return v_course;
end;
$$;
grant execute on function public.redeem_code(text) to authenticated;
revoke execute on function public.redeem_code(text) from public, anon;

-- ── OPTIONAL: manually grant a course to a user by email (run as project owner in SQL editor)
-- select id from auth.users where email = 'student@example.com';
-- insert into public.entitlements(user_id, course) values ('<that-uuid>', 'python') on conflict do nothing;

-- ── PROFILES: student info collected after sign-up (proof of sale + who the student is) ───
create table if not exists public.profiles (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  phone      text,
  birth_year text,
  goal       text,
  experience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ── ADMINS: user_ids that may read every student's data (edit only here in the SQL editor) ─
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
-- RLS on: no client can read/write this table; only the SQL editor (owner) can.
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.is_admin() from public, anon;

-- profiles: a user reads/writes their own row; an admin may read all
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_upsert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = user_id or public.is_admin());
create policy "profiles_upsert_own" on public.profiles for insert
  with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = user_id);

-- let admins also read everyone's entitlements and progress (for the admin dashboard)
drop policy if exists "entitlements_select_admin" on public.entitlements;
create policy "entitlements_select_admin" on public.entitlements for select using (public.is_admin());
drop policy if exists "progress_select_admin" on public.progress;
create policy "progress_select_admin" on public.progress for select using (public.is_admin());

-- auto-create an empty profile row on sign-up (so admins see every signup immediately)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(user_id, email)
    values (new.id, new.email)
    on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── MAKE YOURSELF AN ADMIN (run once, after you have signed up with your own account) ─────
-- select id, email from auth.users where email = 'YOUR-LOGIN-EMAIL';
-- insert into public.admins(user_id) values ('<your-uuid-from-above>') on conflict do nothing;

-- ── PROFILE AVATARS + PUBLIC PROFILE VIEW (added later — re-run this section) ──────────────
alter table public.profiles add column if not exists avatar_url text;

-- admins may also UPDATE any profile (edit a student's info from the dashboard)
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());

-- read ONLY the non-sensitive fields of any profile (public profile pages; no email/phone/birth year)
-- dropped first because the return type changed (an earlier version returned birth_year)
drop function if exists public.get_profile_public(uuid);
create or replace function public.get_profile_public(p_user uuid)
returns table (user_id uuid, full_name text, avatar_url text, experience text, goal text)
language sql
security definer
set search_path = public
stable
as $$
  select user_id, full_name, avatar_url, experience, goal
  from public.profiles where user_id = p_user;
$$;
revoke execute on function public.get_profile_public(uuid) from public, anon;
grant execute on function public.get_profile_public(uuid) to authenticated;

-- avatars storage bucket (public read); each user manages only their own folder (<uid>/…)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
drop policy if exists "avatars_read"       on storage.objects;
drop policy if exists "avatars_write_own"  on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_write_own" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── CONTENT LOCK: per-course decryption key, delivered ONLY to entitled accounts ─────────
-- Lessons are AES-GCM encrypted (see private-tools/lock-course.mjs). The raw content key lives
-- here; clients can't read the table directly (RLS denies all), only the gated rpc returns it.
create table if not exists public.course_keys (
  course      text        primary key,
  content_key text        not null,      -- base64 of the raw AES-GCM key (from keys/<course>.ck)
  updated_at  timestamptz not null default now()
);
alter table public.course_keys enable row level security;
-- no policies: RLS denies every direct client read/write. Only the SECURITY DEFINER rpc reads it.

create or replace function public.get_course_key(p_course text)
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare v_key text;
begin
  if auth.uid() is null then
    return null;
  end if;
  -- only a student who owns this course gets the key
  if not exists (
    select 1 from public.entitlements
    where user_id = auth.uid() and course = p_course
  ) then
    return null;
  end if;
  select content_key into v_key from public.course_keys where course = p_course;
  return v_key;
end;
$$;
grant execute on function public.get_course_key(text) to authenticated;
revoke execute on function public.get_course_key(text) from public, anon;

-- ── STORE A COURSE KEY (run after locking a course; paste the base64 from keys/<course>.ck) ─
-- insert into public.course_keys(course, content_key) values ('python', '<base64-key>')
--   on conflict (course) do update set content_key = excluded.content_key, updated_at = now();

-- ── ADD A CODE (you run this to create a code for a student who paid) ─────────────────────
-- insert into public.codes(code, course, label) values ('K7XQ-9F3M-4WYT', 'python', 'Nguyen Van A');
