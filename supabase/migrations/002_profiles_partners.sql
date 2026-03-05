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
