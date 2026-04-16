-- ============================================================
-- Thai Learner — Supabase schema
-- Idempotent: safe to re-run any number of times.
-- Paste into the Supabase SQL editor and run.
-- ============================================================

-- pgcrypto is usually already available on Supabase; keep this idempotent.
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. user_profiles
-- ------------------------------------------------------------
create table if not exists public.user_profiles (
  user_id         uuid primary key references auth.users on delete cascade,
  display_name    text not null default '',
  account_tier    text not null default 'free'
                    check (account_tier in ('free', 'premium')),
  tier_expires_at timestamptz,
  created_at      timestamptz not null default now(),
  settings_json   jsonb not null default '{}'::jsonb
);

-- ------------------------------------------------------------
-- 2. users_progress
-- ------------------------------------------------------------
create table if not exists public.users_progress (
  user_id     uuid primary key references auth.users on delete cascade,
  xp          integer not null default 0,
  level       integer not null default 0,
  streak      integer not null default 0,
  last_played timestamptz,
  badges      jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. card_history
-- ------------------------------------------------------------
create table if not exists public.card_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  card_id    text not null,
  correct    integer not null default 0,
  incorrect  integer not null default 0,
  last_seen  timestamptz,
  constraint card_history_user_card_uq unique (user_id, card_id)
);

create index if not exists card_history_user_idx on public.card_history (user_id);

-- ------------------------------------------------------------
-- 4. topic_progress
-- ------------------------------------------------------------
create table if not exists public.topic_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  topic_id    text not null,
  played      integer not null default 0,
  correct     integer not null default 0,
  total       integer not null default 0,
  last_played timestamptz,
  constraint topic_progress_user_topic_uq unique (user_id, topic_id)
);

create index if not exists topic_progress_user_idx on public.topic_progress (user_id);

-- ------------------------------------------------------------
-- 5. user_game_stats
-- ------------------------------------------------------------
create table if not exists public.user_game_stats (
  user_id         uuid primary key references auth.users on delete cascade,
  flashcard_stats jsonb not null default '{}'::jsonb,
  speed_bests     jsonb not null default '{}'::jsonb,
  alphabet_stats  jsonb not null default '{}'::jsonb,
  tutorials_seen  jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Row-level security
-- ============================================================
alter table public.user_profiles    enable row level security;
alter table public.users_progress   enable row level security;
alter table public.card_history     enable row level security;
alter table public.topic_progress   enable row level security;
alter table public.user_game_stats  enable row level security;

-- ------------------------------------------------------------
-- Policies — user can only access their own rows.
-- Drop-then-create so re-runs are idempotent.
-- ------------------------------------------------------------

-- user_profiles
drop policy if exists "profiles_select" on public.user_profiles;
drop policy if exists "profiles_insert" on public.user_profiles;
drop policy if exists "profiles_update" on public.user_profiles;
drop policy if exists "profiles_delete" on public.user_profiles;
create policy "profiles_select" on public.user_profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert" on public.user_profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update" on public.user_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete" on public.user_profiles
  for delete using (auth.uid() = user_id);

-- users_progress
drop policy if exists "progress_select" on public.users_progress;
drop policy if exists "progress_insert" on public.users_progress;
drop policy if exists "progress_update" on public.users_progress;
drop policy if exists "progress_delete" on public.users_progress;
create policy "progress_select" on public.users_progress
  for select using (auth.uid() = user_id);
create policy "progress_insert" on public.users_progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update" on public.users_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete" on public.users_progress
  for delete using (auth.uid() = user_id);

-- card_history
drop policy if exists "cards_select" on public.card_history;
drop policy if exists "cards_insert" on public.card_history;
drop policy if exists "cards_update" on public.card_history;
drop policy if exists "cards_delete" on public.card_history;
create policy "cards_select" on public.card_history
  for select using (auth.uid() = user_id);
create policy "cards_insert" on public.card_history
  for insert with check (auth.uid() = user_id);
create policy "cards_update" on public.card_history
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cards_delete" on public.card_history
  for delete using (auth.uid() = user_id);

-- topic_progress
drop policy if exists "topics_select" on public.topic_progress;
drop policy if exists "topics_insert" on public.topic_progress;
drop policy if exists "topics_update" on public.topic_progress;
drop policy if exists "topics_delete" on public.topic_progress;
create policy "topics_select" on public.topic_progress
  for select using (auth.uid() = user_id);
create policy "topics_insert" on public.topic_progress
  for insert with check (auth.uid() = user_id);
create policy "topics_update" on public.topic_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "topics_delete" on public.topic_progress
  for delete using (auth.uid() = user_id);

-- user_game_stats
drop policy if exists "stats_select" on public.user_game_stats;
drop policy if exists "stats_insert" on public.user_game_stats;
drop policy if exists "stats_update" on public.user_game_stats;
drop policy if exists "stats_delete" on public.user_game_stats;
create policy "stats_select" on public.user_game_stats
  for select using (auth.uid() = user_id);
create policy "stats_insert" on public.user_game_stats
  for insert with check (auth.uid() = user_id);
create policy "stats_update" on public.user_game_stats
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stats_delete" on public.user_game_stats
  for delete using (auth.uid() = user_id);

-- ============================================================
-- handle_new_user — auto-create profile + progress + stats rows
-- when a new auth.users row is inserted.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (user_id) do nothing;

  insert into public.users_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_game_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
