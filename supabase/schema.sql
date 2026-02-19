-- 냉장고를 부탁해 - Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  created_at timestamptz default now()
);

-- Fridges
create table public.fridges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  type text not null check (type in ('refrigerator', 'freezer', 'kimchi')),
  created_at timestamptz default now()
);

-- Ingredients
create table public.ingredients (
  id uuid default uuid_generate_v4() primary key,
  fridge_id uuid references public.fridges on delete cascade not null,
  name text not null,
  category text not null,
  quantity decimal not null default 1,
  unit text not null default '개',
  purchase_date date default current_date,
  expiry_date date not null,
  barcode text,
  memo text,
  created_at timestamptz default now()
);

-- Saved Recipes
create table public.saved_recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  source text not null default 'manual',
  source_id text,
  content jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Shopping Items
create table public.shopping_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  quantity decimal not null default 1,
  unit text not null default '개',
  checked boolean not null default false,
  recipe_id uuid references public.saved_recipes on delete set null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_fridges_user on public.fridges(user_id);
create index idx_ingredients_fridge on public.ingredients(fridge_id);
create index idx_ingredients_expiry on public.ingredients(expiry_date);
create index idx_shopping_user on public.shopping_items(user_id);
create index idx_saved_recipes_user on public.saved_recipes(user_id);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.fridges enable row level security;
alter table public.ingredients enable row level security;
alter table public.saved_recipes enable row level security;
alter table public.shopping_items enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can CRUD own fridges"
  on public.fridges for all using (auth.uid() = user_id);

create policy "Users can CRUD own ingredients"
  on public.ingredients for all
  using (fridge_id in (select id from public.fridges where user_id = auth.uid()));

create policy "Users can CRUD own recipes"
  on public.saved_recipes for all using (auth.uid() = user_id);

create policy "Users can CRUD own shopping items"
  on public.shopping_items for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data->>'nickname');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create default fridges for new profile
create or replace function public.create_default_fridges()
returns trigger as $$
begin
  insert into public.fridges (user_id, name, type) values
    (new.id, '냉장실', 'refrigerator'),
    (new.id, '냉동실', 'freezer'),
    (new.id, '김치냉장고', 'kimchi');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_default_fridges();
