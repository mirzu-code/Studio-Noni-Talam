create table if not exists public.game_recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon text not null default '🍰',
  layers jsonb not null default '["green", "white"]'::jsonb
    check (jsonb_typeof(layers) = 'array'),
  steps jsonb not null
    check (jsonb_typeof(steps) = 'array'),
  created_at timestamptz not null default now()
);

alter table public.game_recipes enable row level security;

grant select on public.game_recipes to anon, authenticated;
grant insert, delete on public.game_recipes to authenticated;

create policy "Game recipes are readable by everyone"
  on public.game_recipes
  for select
  using (true);

create policy "Admins can add game recipes"
  on public.game_recipes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Admins can delete game recipes"
  on public.game_recipes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );
