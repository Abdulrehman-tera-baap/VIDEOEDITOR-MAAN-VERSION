-- Run in Supabase SQL Editor. Supabase Auth stores password hashes securely.
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.user_profiles enable row level security;
create policy "Users read own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.user_profiles for update using (auth.uid() = id);
