-- Reference schema for Cherry Chess (apply in Supabase SQL Editor if needed)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  country text,
  city text,
  avatar_url text,
  elo_rating integer not null default 1200,
  coins integer not null default 0,
  hearts integer not null default 5,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add column if not exists bio text;

alter table public.profiles
  add column if not exists country text;

alter table public.profiles
  add column if not exists city text;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists elo_rating integer not null default 1200;

alter table public.profiles
  add column if not exists coins integer not null default 0;

alter table public.profiles
  add column if not exists hearts integer not null default 5;

alter table public.profiles
  add column if not exists is_premium boolean not null default false;

alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  white_player_id uuid not null references public.profiles (id),
  black_player_id uuid references public.profiles (id),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  result text check (result in ('white', 'black', 'draw')),
  winner_id uuid references public.profiles (id),
  current_fen text not null,
  pgn text not null default '',
  move_count integer not null default 0,
  white_time_ms integer not null default 600000,
  black_time_ms integer not null default 600000,
  rematch_requested_by uuid references public.profiles (id),
  rematch_game_id uuid references public.games (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moves (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  move_number integer not null,
  notation text not null,
  fen text not null,
  player_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (game_id, move_number)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('bug', 'suggestion')),
  message text not null,
  path text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

create index if not exists games_white_player_id_idx on public.games (white_player_id);
create index if not exists games_black_player_id_idx on public.games (black_player_id);
create index if not exists moves_game_id_idx on public.moves (game_id);
create index if not exists profiles_elo_rating_idx on public.profiles (elo_rating desc);
create index if not exists profiles_city_elo_rating_idx on public.profiles (city, elo_rating desc);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
