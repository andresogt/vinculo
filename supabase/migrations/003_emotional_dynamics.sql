alter table relationship_state
  add column if not exists affection int default 50 check (affection >= 0 and affection <= 100),
  add column if not exists jealousy int default 10 check (jealousy >= 0 and jealousy <= 100),
  add column if not exists distance int default 20 check (distance >= 0 and distance <= 100),
  add column if not exists playfulness int default 40 check (playfulness >= 0 and playfulness <= 100);
