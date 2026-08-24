-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor (ครั้งเดียวตอนตั้งโปรเจกต์)

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  note text,
  date date not null,
  created_at timestamptz not null default now()
);

-- เปิดใช้งาน Row Level Security เพื่อให้แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง
alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ดัชนีช่วยให้ query ตามผู้ใช้และวันที่เร็วขึ้น
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);
