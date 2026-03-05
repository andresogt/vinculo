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
  emotional_weight int default 1 check (emotional_weight >= 1 and emotional_weight <= 5),
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
