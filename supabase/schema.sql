-- profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'customer'
);

alter table profiles enable row level security;

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

-- menu_items table
create table menu_items (
  id serial primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text,
  image_url text,
  available boolean default true,
  created_at timestamp default now()
);

alter table menu_items enable row level security;

create policy "Menu items are viewable by everyone" on menu_items
  for select using (true);

-- orders table
create table orders (
  id serial primary key,
  user_id uuid references auth.users,
  items jsonb not null,
  total numeric(10,2) not null,
  status text default 'Pending',
  created_at timestamp default now()
);

alter table orders enable row level security;

create policy "Users see own orders" on orders
  for select using (auth.uid() = user_id);
  
create policy "Users insert own orders" on orders
  for insert with check (auth.uid() = user_id);
