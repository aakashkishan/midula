-- Midula DB Schema

create table public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.daily_trackers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null default CURRENT_DATE,
  water_ml int default 0,
  carbs_g int default 0,
  protein_g int default 0,
  fats_g int default 0,
  vitamins_logged boolean default false
);

create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null default CURRENT_DATE,
  routine_level text not null,
  completed boolean default false
);

create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  target_value int not null,
  current_value int default 0,
  deadline date
);

create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  ingredients text[] not null,
  instructions text not null,
  prep_time int,
  calories int,
  image_url text
);

-- Enable RLS and setup permissive policies for our prototype
alter table public.users enable row level security;
alter table public.daily_trackers enable row level security;
alter table public.workouts enable row level security;
alter table public.goals enable row level security;
alter table public.recipes enable row level security;

create policy "Allow all actions on users" on public.users for all using (true) with check (true);
create policy "Allow all actions on daily_trackers" on public.daily_trackers for all using (true) with check (true);
create policy "Allow all actions on workouts" on public.workouts for all using (true) with check (true);
create policy "Allow all actions on goals" on public.goals for all using (true) with check (true);
create policy "Allow all actions on recipes" on public.recipes for all using (true) with check (true);

-- Insert sample initial user
insert into public.users (name) values ('Default User');
