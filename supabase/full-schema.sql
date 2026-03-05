-- Vinculo: ejecuta este archivo en Supabase SQL Editor si prefieres hacerlo todo de una vez
-- (O usa las migraciones individuales en orden: 001, 002, 003, 004)

-- 001
create extension if not exists "uuid-ossp";
create table if not exists relationship_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  attachment int default 40 check (attachment >= 0 and attachment <= 100),
  trust int default 50 check (trust >= 0 and trust <= 100),
  tension int default 20 check (tension >= 0 and tension <= 100),
  emotional_state text default 'connected' check (emotional_state in ('connected', 'distant', 'jealous', 'vulnerable', 'passionate')),
  updated_at timestamptz default now()
);
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  created_at timestamptz default now()
);
create table if not exists memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  emotional_weight int default 1 check (emotional_weight >= 1 and emotional_weight <= 10),
  created_at timestamptz default now()
);
create index if not exists messages_user_id_idx on messages(user_id);
create index if not exists messages_created_at_idx on messages(user_id, created_at desc);
create index if not exists memories_user_id_idx on memories(user_id);
alter table relationship_state enable row level security;
alter table messages enable row level security;
alter table memories enable row level security;
create policy "Users own relationship" on relationship_state for all using (auth.uid() = user_id);
create policy "Users own messages" on messages for all using (auth.uid() = user_id);
create policy "Users own memories" on memories for all using (auth.uid() = user_id);

-- 002
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
create table if not exists partners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  partner_name text not null default 'Vinculo',
  partner_gender text default 'neutral' check (partner_gender in ('masculine', 'feminine', 'neutral')),
  personality_type text default 'romantic' check (personality_type in ('romantic', 'passionate', 'playful', 'deep', 'mysterious')),
  intensity_level text default 'medium' check (intensity_level in ('low', 'medium', 'high')),
  created_at timestamptz default now()
);
create index if not exists profiles_user_id_idx on profiles(user_id);
create index if not exists partners_user_id_idx on partners(user_id);
alter table profiles enable row level security;
alter table partners enable row level security;
create policy "Users own profile" on profiles for all using (auth.uid() = user_id);
create policy "Users own partner" on partners for all using (auth.uid() = user_id);

-- 003
alter table relationship_state
  add column if not exists affection int default 50 check (affection >= 0 and affection <= 100),
  add column if not exists jealousy int default 10 check (jealousy >= 0 and jealousy <= 100),
  add column if not exists distance int default 20 check (distance >= 0 and distance <= 100),
  add column if not exists playfulness int default 40 check (playfulness >= 0 and playfulness <= 100);

-- 004
alter table relationship_state
  add column if not exists relationship_level int default 1 check (relationship_level >= 1 and relationship_level <= 5),
  add column if not exists last_interaction timestamptz default now();
alter table memories drop constraint if exists memories_emotional_weight_check;
alter table memories add constraint memories_emotional_weight_check check (emotional_weight >= 1 and emotional_weight <= 10);
