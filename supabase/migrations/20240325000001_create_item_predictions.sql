create table if not exists public.item_predictions (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  predicted_expiry date,
  confidence_score numeric not null check (confidence_score >= 0 and confidence_score <= 1),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  contributing_factors text[] not null default '{}',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.item_predictions enable row level security;

-- Create policy to allow authenticated users to read all predictions
create policy "Allow authenticated users to read predictions"
  on public.item_predictions
  for select
  to authenticated
  using (true);

-- Create policy to allow authenticated users to insert their own predictions
create policy "Allow authenticated users to insert predictions"
  on public.item_predictions
  for insert
  to authenticated
  with check (true);

-- Set up updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_predictions_updated_at
  before update on public.item_predictions
  for each row
  execute function public.handle_updated_at(); 