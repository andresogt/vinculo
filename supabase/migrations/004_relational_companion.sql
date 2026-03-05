-- Add relationship_level and last_interaction
alter table relationship_state
  add column if not exists relationship_level int default 1 check (relationship_level >= 1 and relationship_level <= 5),
  add column if not exists last_interaction timestamptz default now();

-- Allow emotional_weight 1-10 for memories
alter table memories drop constraint if exists memories_emotional_weight_check;
alter table memories add constraint memories_emotional_weight_check check (emotional_weight >= 1 and emotional_weight <= 10);
