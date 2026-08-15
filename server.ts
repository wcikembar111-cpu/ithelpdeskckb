import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const currentDir = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Configuration & Initialization
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aaslnmbthwztvbzoestc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc2xubWJ0aHd6dHZiem9lc3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDcyNzIsImV4cCI6MjEwMDkyMzI3Mn0.cm5YVmorg9X64U40KG_XKc3bSgPy3Mav6bamU7ICopc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Persistent database file path
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Types
interface User {
  Id: string;
  Username: string;
  Password: string;
  Nama: string;
  Role: 'Administrator' | 'Petugas IT' | 'User Biasa' | 'User Public';
  MustChangePassword?: boolean;
  Status: string;
}

interface Ticket {
  Id: string;
  Ejob: string;
  Tanggal: string;
  Nama: string;
  NoWa: string;
  Departement: string;
  Lokasi: string;
  Kategori: string;
  TypeTicket: string;
  Subject: string;
  Description: string;
  Status: 'Open' | 'On Progress' | 'Pending Part' | 'Closed';
  TanggalSelesai?: string;
  Action?: string;
  Keterangan?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  Creator?: string;
}

interface Settings {
  Departments: string[];
  Categories: string[];
  LoginBgUrl: string;
  ItPhone: string;
}

interface Database {
  users: User[];
  tickets: Ticket[];
  settings: Settings;
  sessions: Record<string, { username: string; expiresAt: number }>;
  ejobCounter: number;
}

// Initial Default Database
const defaultDb: Database = {
  users: [
    {
      Id: 'usr_admin_default',
      Username: 'admin',
      Password: 'Kino.2026',
      Nama: 'Administrator Utama',
      Role: 'Administrator',
      MustChangePassword: false,
      Status: 'Active'
    },
    {
      Id: 'usr_it_01',
      Username: 'it_support',
      Password: 'it123',
      Nama: 'Budi Support IT',
      Role: 'Petugas IT',
      MustChangePassword: false,
      Status: 'Active'
    },
    {
      Id: 'usr_user_01',
      Username: 'user_kino',
      Password: 'kino123',
      Nama: 'Siti Rahma',
      Role: 'User Biasa',
      MustChangePassword: false,
      Status: 'Active'
    },
    {
      Id: 'usr_public_01',
      Username: 'public',
      Password: 'public123',
      Nama: 'User Public Kino',
      Role: 'User Public',
      MustChangePassword: false,
      Status: 'Active'
    }
  ],
  tickets: [
    {
      Id: 'tkt_001',
      Ejob: 'EJOB/2026/07/001',
      Tanggal: new Date().toISOString().split('T')[0],
      Nama: 'Siti Rahma',
      NoWa: '08123456789',
      Departement: 'Produksi',
      Lokasi: 'Gedung B Lt.2 Area QC',
      Kategori: 'Printer',
      TypeTicket: 'Incident',
      Subject: 'Printer thermal barcode label macet / error paper jam',
      Description: 'Printer label barcode cetak tidak jelas dan kertas sering tersangkut saat pemindaian kemasan.',
      Status: 'Open',
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Creator: 'user_kino'
    },
    {
      Id: 'tkt_002',
      Ejob: 'EJOB/2026/07/002',
      Tanggal: new Date().toISOString().split('T')[0],
      Nama: 'Ahmad Fauzi',
      NoWa: '08987654321',
      Departement: 'Logistik',
      Lokasi: 'Warehouse Cikembar Gate 3',
      Kategori: 'Network',
      TypeTicket: 'Request',
      Subject: 'Pemasangan Access Point WiFi tambahan di Loading Dock',
      Description: 'Koneksi sinyal WiFi sering terputus saat petugas scan barcode barang masuk.',
      Status: 'On Progress',
      Action: 'Sudah dilakukan survey lokasi dan penarikan kabel LAN UTP.',
      Keterangan: 'Menunggu pemasangan unit Access Point Mikrotik.',
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Creator: 'admin'
    }
  ],
  settings: {
    Departments: ['IT', 'HRD', 'Finance', 'Produksi', 'Warehouse', 'QA/QC', 'Logistik', 'Purchasing'],
    Categories: ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'ERP/System', 'Lainnya'],
    LoginBgUrl: 'https://res.cloudinary.com/dedtb3vnj/image/upload/v1785044494/header-brands0526_co10uq.jpg',
    ItPhone: '6281234567890'
  },
  sessions: {},
  ejobCounter: 3
};

function readDb(): Database {
  let db = defaultDb;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = {
        ...defaultDb,
        ...parsed,
        settings: {
          ...defaultDb.settings,
          ...(parsed.settings || {})
        }
      };
    }
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
  }

  // Ensure default public user exists
  if (db.users && !db.users.some(u => u.Username === 'public')) {
    db.users.push({
      Id: 'usr_public_01',
      Username: 'public',
      Password: 'public123',
      Nama: 'User Public Kino',
      Role: 'User Public',
      MustChangePassword: false,
      Status: 'Active'
    });
  }

  return db;
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
  }
}

// Generate unique E-Job number
function generateEjob(db: Database): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const counterStr = String(db.ejobCounter).padStart(3, '0');
  db.ejobCounter += 1;
  return `EJOB/${year}/${month}/${counterStr}`;
}

// Helper auth from token
function getUserByToken(req: express.Request, db: Database): User | null {
  const token = (req.headers['x-access-token'] as string) || (req.body && req.body.token);
  if (!token) return null;
  const session = db.sessions[token];
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    delete db.sessions[token];
    writeDb(db);
    return null;
  }
  return db.users.find(u => u.Username === session.username) || null;
}

// ==========================================
// SUPABASE DATABASE HELPERS
// ==========================================

async function syncSupabaseToLocal() {
  try {
    const db = readDb();

    // Fetch users, tickets, settings from Supabase PostgreSQL tables
    const [usersRes, ticketsRes, settingsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 1).maybeSingle()
    ]);

    let updated = false;

    // Users Sync
    if (usersRes.data && usersRes.data.length > 0) {
      db.users = usersRes.data.map((u: any) => ({
        Id: u.id,
        Username: u.username,
        Password: u.password,
        Nama: u.nama,
        Role: u.role,
        MustChangePassword: u.must_change_password ?? false,
        Status: u.status || 'Active'
      }));
      updated = true;
    } else if (!usersRes.error) {
      console.log('[Supabase] Database users kosong. Melakukan seeding data awal...');
      for (const u of db.users) {
        await supabase.from('users').upsert({
          id: u.Id,
          username: u.Username,
          password: u.Password,
          nama: u.Nama,
          role: u.Role,
          must_change_password: u.MustChangePassword ?? false,
          status: u.Status
        });
      }
    }

    // Tickets Sync
    if (ticketsRes.data && ticketsRes.data.length > 0) {
      db.tickets = ticketsRes.data.map((t: any) => ({
        Id: t.id,
        Ejob: t.ejob,
        Tanggal: t.tanggal,
        Nama: t.nama,
        NoWa: t.no_wa || '',
        Departement: t.departement || 'IT',
        Lokasi: t.lokasi || '',
        Kategori: t.kategori || 'Lainnya',
        TypeTicket: t.type_ticket || 'Incident',
        Subject: t.subject || '',
        Description: t.description || '',
        Status: t.status || 'Open',
        TanggalSelesai: t.tanggal_selesai || undefined,
        Action: t.action || undefined,
        Keterangan: t.keterangan || undefined,
        Creator: t.creator || '',
        CreatedAt: t.created_at,
        UpdatedAt: t.updated_at
      }));
      updated = true;
    } else if (!ticketsRes.error && db.tickets.length > 0) {
      for (const t of db.tickets) {
        await supabase.from('tickets').upsert({
          id: t.Id,
          ejob: t.Ejob,
          tanggal: t.Tanggal,
          nama: t.Nama,
          no_wa: t.NoWa || '',
          departement: t.Departement || 'IT',
          lokasi: t.Lokasi || '',
          kategori: t.Kategori || 'Lainnya',
          type_ticket: t.TypeTicket || 'Incident',
          subject: t.Subject || '',
          description: t.Description || '',
          status: t.Status || 'Open',
          tanggal_selesai: t.TanggalSelesai || null,
          action: t.Action || null,
          keterangan: t.Keterangan || null,
          creator: t.Creator || ''
        });
      }
    }

    // Settings Sync
    if (settingsRes.data) {
      db.settings = {
        Departments: settingsRes.data.departments || defaultDb.settings.Departments,
        Categories: settingsRes.data.categories || defaultDb.settings.Categories,
        LoginBgUrl: settingsRes.data.login_bg_url || defaultDb.settings.LoginBgUrl,
        ItPhone: settingsRes.data.it_phone || defaultDb.settings.ItPhone
      };
      updated = true;
    } else if (!settingsRes.error) {
      await supabase.from('settings').upsert({
        id: 1,
        departments: db.settings.Departments,
        categories: db.settings.Categories,
        login_bg_url: db.settings.LoginBgUrl,
        it_phone: db.settings.ItPhone
      });
    }

    if (updated) {
      writeDb(db);
    }

    return { success: true, countUsers: db.users.length, countTickets: db.tickets.length };
  } catch (err: any) {
    console.error('[Supabase] Database sync error:', err?.message || err);
    return { success: false, error: String(err?.message || err) };
  }
}

async function syncTicketToSupabase(ticket: Ticket) {
  try {
    await supabase.from('tickets').upsert({
      id: ticket.Id,
      ejob: ticket.Ejob,
      tanggal: ticket.Tanggal,
      nama: ticket.Nama,
      no_wa: ticket.NoWa || '',
      departement: ticket.Departement || 'IT',
      lokasi: ticket.Lokasi || '',
      kategori: ticket.Kategori || 'Lainnya',
      type_ticket: ticket.TypeTicket || 'Incident',
      subject: ticket.Subject || '',
      description: ticket.Description || '',
      status: ticket.Status || 'Open',
      tanggal_selesai: ticket.TanggalSelesai || null,
      action: ticket.Action || null,
      keterangan: ticket.Keterangan || null,
      creator: ticket.Creator || '',
      updated_at: new Date().toISOString()
    });
  } catch (e: any) {
    console.error('Error syncing ticket to Supabase:', e?.message || e);
  }
}

async function deleteTicketFromSupabase(id: string) {
  try {
    await supabase.from('tickets').delete().eq('id', id);
  } catch (e: any) {
    console.error('Error deleting ticket from Supabase:', e?.message || e);
  }
}

async function syncUserToSupabase(user: User) {
  try {
    await supabase.from('users').upsert({
      id: user.Id,
      username: user.Username,
      password: user.Password,
      nama: user.Nama,
      role: user.Role,
      must_change_password: user.MustChangePassword ?? false,
      status: user.Status
    });
  } catch (e: any) {
    console.error('Error syncing user to Supabase:', e?.message || e);
  }
}

async function deleteUserFromSupabase(id: string) {
  try {
    await supabase.from('users').delete().eq('id', id);
  } catch (e: any) {
    console.error('Error deleting user from Supabase:', e?.message || e);
  }
}

async function syncSettingsToSupabase(settings: Settings) {
  try {
    await supabase.from('settings').upsert({
      id: 1,
      departments: settings.Departments,
      categories: settings.Categories,
      login_bg_url: settings.LoginBgUrl,
      it_phone: settings.ItPhone
    });
  } catch (e: any) {
    console.error('Error syncing settings to Supabase:', e?.message || e);
  }
}

// Initial auto sync on server start
syncSupabaseToLocal().catch(() => {});

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/supabase/status', async (req, res) => {
  try {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (error) {
      return res.json({
        success: false,
        connected: false,
        message: `Gagal terhubung ke Supabase: ${error.message}`
      });
    }
    return res.json({
      success: true,
      connected: true,
      url: supabaseUrl,
      message: `Sistem terhubung ke Supabase Database PostgreSQL (${supabaseUrl})`
    });
  } catch (err: any) {
    res.json({
      success: false,
      connected: false,
      message: err?.message || 'Gagal terhubung ke Supabase.'
    });
  }
});

app.post('/api/supabase/sync', async (req, res) => {
  const result = await syncSupabaseToLocal();
  res.json(result);
});

// View Supabase SQL Schema
app.get('/api/supabase-schema', (req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
      return res.json({ success: true, sql: sqlContent });
    }
  } catch (err) {
    console.error(err);
  }
  res.json({ success: false, message: 'File supabase_schema.sql tidak ditemukan.' });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const db = readDb();

  const user = db.users.find(
    u => u.Username.toLowerCase() === String(username || '').trim().toLowerCase()
  );

  if (!user || user.Password !== password) {
    return res.status(401).json({ success: false, message: 'Username atau Password salah!' });
  }

  if (user.Status !== 'Active') {
    return res.status(403).json({ success: false, message: 'Akun Anda nonaktif. Hubungi Admin IT.' });
  }

  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  db.sessions[token] = {
    username: user.Username,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  writeDb(db);

  const { Password, ...userWithoutPassword } = user;
  res.json({
    success: true,
    message: 'Login Berhasil',
    data: {
      token,
      user: userWithoutPassword
    }
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = (req.headers['x-access-token'] as string) || req.body?.token;
  const db = readDb();
  if (token && db.sessions[token]) {
    delete db.sessions[token];
    writeDb(db);
  }
  res.json({ success: true, message: 'Logout Berhasil' });
});

// Get Initial Data
app.get('/api/initial-data', async (req, res) => {
  await syncSupabaseToLocal().catch(() => {});
  const db = readDb();
  const user = getUserByToken(req, db);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Sesi berakhir atau tidak valid.' });
  }

  const { Password, ...userClean } = user;

  // Filter users: only Admin can see full user list
  const usersClean = user.Role === 'Administrator' 
    ? db.users.map(({ Password, ...u }) => u)
    : [];

  res.json({
    success: true,
    data: {
      currentUser: userClean,
      tickets: db.tickets,
      users: usersClean,
      settings: db.settings
    }
  });
});

// Change Password
app.post('/api/auth/change-password', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password minimal 6 karakter!' });
  }

  const userInDb = db.users.find(u => u.Username === user.Username);
  if (userInDb) {
    userInDb.Password = newPassword;
    userInDb.MustChangePassword = false;
    writeDb(db);
    await syncUserToSupabase(userInDb).catch(() => {});
  }

  res.json({ success: true, message: 'Password berhasil diperbarui!' });
});

// Create or Update Ticket
app.post('/api/tickets', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const payload = req.body || {};
  const isEdit = !!payload.Id;

  if (isEdit) {
    const existingIndex = db.tickets.findIndex(t => t.Id === payload.Id);
    if (existingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    }

    const t = db.tickets[existingIndex];
    const isAdminOrIT = user.Role === 'Administrator' || user.Role === 'Petugas IT';
    const isCreator = t.Creator === user.Username || t.Nama === user.Nama;

    if (!isAdminOrIT && (!isCreator || t.Status !== 'Open')) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak akses untuk mengedit tiket ini.' });
    }

    // Update fields
    const updatedTicket: Ticket = {
      ...t,
      Tanggal: payload.Tanggal || t.Tanggal,
      Nama: payload.Nama || t.Nama,
      NoWa: payload.NoWa ?? t.NoWa,
      Departement: payload.Departement || t.Departement,
      Lokasi: payload.Lokasi ?? t.Lokasi,
      Kategori: payload.Kategori || t.Kategori,
      TypeTicket: payload.TypeTicket || t.TypeTicket,
      Subject: payload.Subject || t.Subject,
      Description: payload.Description || t.Description,
      Status: isAdminOrIT ? (payload.Status || t.Status) : t.Status,
      TanggalSelesai: isAdminOrIT ? (payload.TanggalSelesai ?? t.TanggalSelesai) : t.TanggalSelesai,
      Action: isAdminOrIT ? (payload.Action ?? t.Action) : t.Action,
      Keterangan: isAdminOrIT ? (payload.Keterangan ?? t.Keterangan) : t.Keterangan,
      UpdatedAt: new Date().toISOString()
    };

    db.tickets[existingIndex] = updatedTicket;
    writeDb(db);
    await syncTicketToSupabase(updatedTicket).catch(() => {});

    return res.json({
      success: true,
      message: 'Data tiket berhasil diperbarui!',
      data: { ticket: updatedTicket, isNew: false }
    });
  } else {
    // New Ticket Creation
    const newEjob = generateEjob(db);
    const newTicket: Ticket = {
      Id: 'tkt_' + Math.random().toString(36).substring(2, 9),
      Ejob: newEjob,
      Tanggal: payload.Tanggal || new Date().toISOString().split('T')[0],
      Nama: payload.Nama || user.Nama,
      NoWa: payload.NoWa || '',
      Departement: payload.Departement || 'IT',
      Lokasi: payload.Lokasi || '',
      Kategori: payload.Kategori || 'Lainnya',
      TypeTicket: payload.TypeTicket || 'Request',
      Subject: payload.Subject || '',
      Description: payload.Description || '',
      Status: 'Open',
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Creator: user.Username
    };

    db.tickets.unshift(newTicket);
    writeDb(db);
    await syncTicketToSupabase(newTicket).catch(() => {});

    return res.json({
      success: true,
      message: `Tiket baru dengan E-Job ${newEjob} berhasil dibuat!`,
      data: { ticket: newTicket, ejob: newEjob, isNew: true }
    });
  }
});

// Delete Ticket
app.delete('/api/tickets/:id', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user || user.Role !== 'Administrator') {
    return res.status(403).json({ success: false, message: 'Hanya Administrator yang dapat menghapus tiket.' });
  }

  const { id } = req.params;
  db.tickets = db.tickets.filter(t => t.Id !== id);
  writeDb(db);
  await deleteTicketFromSupabase(id).catch(() => {});

  res.json({ success: true, message: 'Tiket berhasil dihapus.' });
});

// Reset All Tickets
app.post('/api/tickets/reset', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user || user.Role !== 'Administrator') {
    return res.status(403).json({ success: false, message: 'Hanya Administrator yang dapat mereset seluruh tiket.' });
  }

  db.tickets = [];
  db.ejobCounter = 1;
  writeDb(db);

  try {
    await supabase.from('tickets').delete().neq('id', '___');
  } catch (e) {}

  res.json({ success: true, message: 'Seluruh data tiket dan counter E-Job telah di-reset!' });
});

// Manage Users (Admin only)
app.post('/api/users', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user || user.Role !== 'Administrator') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }

  const { Nama, Username, Password, Role } = req.body || {};
  if (!Nama || !Username || !Password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
  }

  const existing = db.users.find(u => u.Username.toLowerCase() === Username.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh user lain.' });
  }

  const newUser: User = {
    Id: 'usr_' + Math.random().toString(36).substring(2, 9),
    Username: Username.trim(),
    Password: Password.trim(),
    Nama: Nama.trim(),
    Role: Role || 'User Biasa',
    MustChangePassword: true,
    Status: 'Active'
  };

  db.users.push(newUser);
  writeDb(db);
  await syncUserToSupabase(newUser).catch(() => {});

  res.json({ success: true, message: `User ${Nama} berhasil ditambahkan.` });
});

app.delete('/api/users/:id', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user || user.Role !== 'Administrator') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }

  const { id } = req.params;
  const userToDelete = db.users.find(u => u.Id === id);
  if (userToDelete && userToDelete.Username.toLowerCase() === 'admin') {
    return res.status(400).json({ success: false, message: 'Akun Admin default tidak dapat dihapus!' });
  }

  db.users = db.users.filter(u => u.Id !== id);
  writeDb(db);
  await deleteUserFromSupabase(id).catch(() => {});

  res.json({ success: true, message: 'User berhasil dihapus.' });
});

// Save Settings (Admin only)
app.post('/api/settings', async (req, res) => {
  const db = readDb();
  const user = getUserByToken(req, db);
  if (!user || user.Role !== 'Administrator') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }

  const { departments, categories, itPhone, loginBgUrl } = req.body || {};

  if (Array.isArray(departments)) db.settings.Departments = departments;
  if (Array.isArray(categories)) db.settings.Categories = categories;
  if (typeof itPhone === 'string') db.settings.ItPhone = itPhone;
  if (typeof loginBgUrl === 'string') db.settings.LoginBgUrl = loginBgUrl;

  writeDb(db);
  await syncSettingsToSupabase(db.settings).catch(() => {});
  res.json({ success: true, message: 'Pengaturan sistem berhasil disimpan.' });
});

// Legacy GAS RPC Handler shim for backwards compatibility
app.post('/', (req, res) => {
  const action = req.body?.action;
  const token = req.body?.token;
  req.headers['x-access-token'] = token;

  if (action === 'login') {
    const { username, password } = req.body;
    req.body = { username, password };
    return app._router.handle(req, res, () => {});
  }
  
  res.json({ success: false, message: `Action ${action} handled.` });
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================

async function startServer() {
const httpServer = createHttpServer(app);

if (process.env.NODE_ENV !== 'production') {
const vite = await createViteServer({
server: {
middlewareMode: true,
hmr: { server: httpServer }
},
appType: 'spa'
});
app.use(vite.middlewares);
} else {
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
res.sendFile(path.join(distPath, 'index.html'));
});
}

httpServer.listen(PORT, '0.0.0.0', () => {
console.log(`Kino IT Helpdesk server running at http://0.0.0.0:${PORT}`);
});
}

startServer();
