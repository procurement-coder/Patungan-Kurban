-- =========================================================
-- Skema database untuk "Patungan Qurban"
-- Jalankan seluruh isi file ini di Supabase SQL Editor
-- (Project kamu -> SQL Editor -> New query -> paste -> Run)
-- =========================================================

-- Tabel peserta
create table if not exists participants (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Tabel setoran/tabungan
create table if not exists contributions (
  id bigint generated always as identity primary key,
  participant_id bigint not null references participants(id) on delete cascade,
  amount numeric not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

-- Tabel pengaturan (target tabungan per orang, dsb)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- Target default per orang (silakan ubah lewat halaman web nanti)
insert into settings (key, value) values ('target_per_orang', '2600000')
on conflict (key) do nothing;

-- Isi 17 peserta awal
insert into participants (name) values
  ('Muchtar Hadist'),
  ('Reza Septiawan'),
  ('Totong Zaenal'),
  ('Erwin Nasution'),
  ('Asep Sukarna'),
  ('Juhana Nurjaman'),
  ('Nandang Suryana'),
  ('Ratno Saputra'),
  ('Supriadi'),
  ('Muhamad Sofyan'),
  ('Gunawan'),
  ('Budi Setia'),
  ('Lili Endin'),
  ('Ayi Suhendar'),
  ('Alvi Yudha'),
  ('Agus Mamun'),
  ('Wawan Nurdiansyah')
on conflict (name) do nothing;

-- =========================================================
-- Row Level Security (RLS)
-- Situs ini tidak pakai login (siapa saja yang punya link bisa
-- input & lihat data), jadi kita izinkan akses publik terbatas
-- hanya pada select/insert/delete di 3 tabel ini.
-- Kalau kamu ingin lebih aman, tambahkan Supabase Auth nanti.
-- =========================================================

alter table participants enable row level security;
alter table contributions enable row level security;
alter table settings enable row level security;

create policy "public read participants" on participants
  for select using (true);

create policy "public read contributions" on contributions
  for select using (true);

create policy "public insert contributions" on contributions
  for insert with check (true);

create policy "public delete contributions" on contributions
  for delete using (true);

create policy "public read settings" on settings
  for select using (true);

create policy "public update settings" on settings
  for update using (true);
