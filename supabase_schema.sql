-- ================================================================
-- KINO IT HELPDESK CIKEMBAR - SUPABASE POSTGRESQL SCHEMA
-- File: supabase_schema.sql
-- ================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum untuk Role Pengguna
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('Administrator', 'Petugas IT', 'User Biasa', 'User Public');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum untuk Status Tiket
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('Open', 'On Progress', 'Pending Part', 'Closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum untuk Tipe Tiket
DO $$ BEGIN
  CREATE TYPE ticket_type AS ENUM ('Request', 'Incident');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- 2. TABEL PENGGUNA (users)
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  role user_role NOT NULL DEFAULT 'User Biasa',
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks performa query user
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);


-- 3. TABEL TIKET (tickets)
CREATE TABLE IF NOT EXISTS public.tickets (
  id VARCHAR(50) PRIMARY KEY,
  ejob VARCHAR(50) UNIQUE NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nama VARCHAR(150) NOT NULL,
  no_wa VARCHAR(30) DEFAULT '',
  departement VARCHAR(100) NOT NULL DEFAULT 'IT',
  lokasi VARCHAR(255) DEFAULT '',
  kategori VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  type_ticket VARCHAR(50) NOT NULL DEFAULT 'Incident',
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'Open',
  tanggal_selesai DATE,
  action TEXT,
  keterangan TEXT,
  creator VARCHAR(100) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks pencarian dan filter tiket
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ejob ON public.tickets(ejob);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_creator ON public.tickets(creator);


-- 4. TABEL PENGATURAN SISTEM (settings)
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  departments TEXT[] NOT NULL DEFAULT '{"IT","HRD","Finance","Produksi","Warehouse","QA/QC","Logistik","Purchasing"}',
  categories TEXT[] NOT NULL DEFAULT '{"Hardware","Software","Network","Printer","Email","ERP/System","Lainnya"}',
  login_bg_url TEXT DEFAULT 'https://res.cloudinary.com/dedtb3vnj/image/upload/v1785044494/header-brands0526_co10uq.jpg',
  it_phone VARCHAR(30) DEFAULT '6281234567890',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_settings_row CHECK (id = 1)
);


-- 5. COUNTER NOMOR E-JOB (ejob_counter)
CREATE TABLE IF NOT EXISTS public.ejob_counter (
  id INT PRIMARY KEY DEFAULT 1,
  counter INT NOT NULL DEFAULT 3,
  CONSTRAINT single_counter_row CHECK (id = 1)
);


-- 6. TRIGGER AUTOMATIC UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;
CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 7. SEED DATA AWAL (INITIAL SEEDING)

-- Seed User Default
INSERT INTO public.users (id, username, password, nama, role, must_change_password, status)
VALUES 
  ('usr_admin_default', 'admin', 'Kino.2026', 'Administrator Utama', 'Administrator', false, 'Active'),
  ('usr_it_01', 'it_support', 'it123', 'Budi Support IT', 'Petugas IT', false, 'Active'),
  ('usr_user_01', 'user_kino', 'kino123', 'Siti Rahma', 'User Biasa', false, 'Active'),
  ('usr_public_01', 'public', 'public123', 'User Public Kino', 'User Public', false, 'Active')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  must_change_password = EXCLUDED.must_change_password;

-- Seed Tiket Default
INSERT INTO public.tickets (
  id, ejob, tanggal, nama, no_wa, departement, lokasi, kategori, type_ticket, subject, description, status, action, keterangan, creator, created_at, updated_at
) VALUES 
  (
    'tkt_001',
    'EJOB/2026/07/001',
    CURRENT_DATE,
    'Siti Rahma',
    '08123456789',
    'Produksi',
    'Gedung B Lt.2 Area QC',
    'Printer',
    'Incident',
    'Printer thermal barcode label macet / error paper jam',
    'Printer label barcode cetak tidak jelas dan kertas sering tersangkut saat pemindaian kemasan.',
    'Open',
    NULL,
    NULL,
    'user_kino',
    NOW(),
    NOW()
  ),
  (
    'tkt_002',
    'EJOB/2026/07/002',
    CURRENT_DATE,
    'Ahmad Fauzi',
    '08987654321',
    'Logistik',
    'Warehouse Cikembar Gate 3',
    'Network',
    'Request',
    'Pemasangan Access Point WiFi tambahan di Loading Dock',
    'Koneksi sinyal WiFi sering terputus saat petugas scan barcode barang masuk.',
    'On Progress',
    'Sudah dilakukan survey lokasi dan penarikan kabel LAN UTP.',
    'Menunggu pemasangan unit Access Point Mikrotik.',
    'admin',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Pengaturan Sistem Default
INSERT INTO public.settings (id, departments, categories, login_bg_url, it_phone)
VALUES (
  1,
  ARRAY['IT', 'HRD', 'Finance', 'Produksi', 'Warehouse', 'QA/QC', 'Logistik', 'Purchasing'],
  ARRAY['Hardware', 'Software', 'Network', 'Printer', 'Email', 'ERP/System', 'Lainnya'],
  'https://res.cloudinary.com/dedtb3vnj/image/upload/v1785044494/header-brands0526_co10uq.jpg',
  '6281234567890'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Counter E-Job Default
INSERT INTO public.ejob_counter (id, counter)
VALUES (1, 3)
ON CONFLICT (id) DO NOTHING;


-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejob_counter ENABLE ROW LEVEL SECURITY;

-- Grant Full Access to anon & authenticated roles for client API queries
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on users" ON public.users FOR ALL USING (true);

CREATE POLICY "Allow public all access on tickets" ON public.tickets FOR ALL USING (true);
CREATE POLICY "Allow public select on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public update on settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Allow public all access on ejob_counter" ON public.ejob_counter FOR ALL USING (true);

-- Grant privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
