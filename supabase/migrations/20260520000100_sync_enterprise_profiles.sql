-- Sync Cherry Chess enterprise profile, feedback, and avatar storage schema.
-- Apply this in Supabase SQL Editor or via `supabase db push`.

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

create index if not exists profiles_elo_rating_idx on public.profiles (elo_rating desc);
create index if not exists profiles_city_elo_rating_idx on public.profiles (city, elo_rating desc);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
