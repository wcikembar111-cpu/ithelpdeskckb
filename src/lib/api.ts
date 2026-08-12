import { ApiResponse } from '../types';

const TOKEN_KEY = 'kino_it_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Local Browser Fallback DB for Static Hosting (e.g., Cloudflare Pages / Vercel Static)
const LOCAL_DB_KEY = 'kino_it_local_db';

const defaultLocalDb = {
  users: [
    { Id: 'usr_admin_default', Username: 'admin', Password: 'Kino.2026', Nama: 'Administrator Utama', Role: 'Administrator', MustChangePassword: false, Status: 'Active' },
    { Id: 'usr_it_01', Username: 'it_support', Password: 'it123', Nama: 'Budi Support IT', Role: 'Petugas IT', MustChangePassword: false, Status: 'Active' },
    { Id: 'usr_user_01', Username: 'user_kino', Password: 'kino123', Nama: 'Siti Rahma', Role: 'User Biasa', MustChangePassword: false, Status: 'Active' },
    { Id: 'usr_public_01', Username: 'public', Password: 'public123', Nama: 'User Public Kino', Role: 'User Public', MustChangePassword: false, Status: 'Active' }
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
    }
  ],
  settings: {
    Departments: ['IT', 'HRD', 'Finance', 'Produksi', 'Warehouse', 'QA/QC', 'Logistik', 'Purchasing'],
    Categories: ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'ERP/System', 'Lainnya'],
    LoginBgUrl: 'https://res.cloudinary.com/dedtb3vnj/image/upload/v1785044494/header-brands0526_co10uq.jpg',
    ItPhone: '6281234567890'
  },
  ejobCounter: 2
};

function getLocalDb() {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(defaultLocalDb));
  return defaultLocalDb;
}

function saveLocalDb(db: any) {
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  } catch (e) {}
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['x-access-token'] = token;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    // Handle Static Server rejection (405 Method Not Allowed / 404 Not Found) on static hosts like Cloudflare Pages
    if (res.status === 405 || res.status === 404) {
      console.warn(`[API Fallback] Server mengembalikan ${res.status} pada ${endpoint}. Mengaktifkan mode Lokal Browser (Cloudflare Pages Static Mode).`);
      return handleLocalFallback<T>(endpoint, options);
    }

    const text = await res.text();

    if (!text || !text.trim()) {
      return {
        success: false,
        message: `Server mengembalikan respon kosong (${res.status} ${res.statusText}).`
      };
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (jsonErr) {
      console.warn(`Respon dari ${endpoint} bukan format JSON valid (${res.status}):`, text.substring(0, 150));
      return {
        success: false,
        message: `API Endpoint ${endpoint} mengembalikan format non-JSON (${res.status} ${res.statusText}).`
      };
    }
  } catch (err: any) {
    console.warn(`[API Network Fallback] Error pada ${endpoint}:`, err?.message);
    return handleLocalFallback<T>(endpoint, options);
  }
}

function handleLocalFallback<T = any>(endpoint: string, options: RequestInit): ApiResponse<T> {
  const db = getLocalDb();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const token = getAuthToken();

  // 1. Auth Login
  if (endpoint === '/api/auth/login') {
    const { username, password } = body;
    const user = db.users.find(
      (u: any) => u.Username.toLowerCase() === String(username || '').trim().toLowerCase()
    );

    if (!user || user.Password !== password) {
      return { success: false, message: 'Username atau Password salah!' };
    }

    const newToken = 'local_token_' + Math.random().toString(36).substring(2);
    setAuthToken(newToken);
    localStorage.setItem('kino_local_current_user', JSON.stringify(user));

    const { Password, ...userClean } = user;
    return {
      success: true,
      message: 'Login Berhasil (Mode Offline / Static Deployment)',
      data: { token: newToken, user: userClean } as any
    };
  }

  // 2. Auth Logout
  if (endpoint === '/api/auth/logout') {
    setAuthToken(null);
    localStorage.removeItem('kino_local_current_user');
    return { success: true, message: 'Logout Berhasil' };
  }

  // 3. Initial Data
  if (endpoint === '/api/initial-data') {
    const storedUserRaw = localStorage.getItem('kino_local_current_user');
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : db.users[0];
    const { Password, ...cleanCurrentUser } = storedUser;

    return {
      success: true,
      data: {
        currentUser: cleanCurrentUser,
        tickets: db.tickets,
        users: cleanCurrentUser.Role === 'Administrator' ? db.users.map(({ Password, ...u }: any) => u) : [],
        settings: db.settings
      } as any
    };
  }

  // 4. Change Password
  if (endpoint === '/api/auth/change-password') {
    const { newPassword } = body;
    const storedUserRaw = localStorage.getItem('kino_local_current_user');
    if (storedUserRaw) {
      const storedUser = JSON.parse(storedUserRaw);
      const userIdx = db.users.findIndex((u: any) => u.Username === storedUser.Username);
      if (userIdx !== -1) {
        db.users[userIdx].Password = newPassword;
        db.users[userIdx].MustChangePassword = false;
        saveLocalDb(db);
        localStorage.setItem('kino_local_current_user', JSON.stringify(db.users[userIdx]));
      }
    }
    return { success: true, message: 'Password berhasil diperbarui!' };
  }

  // 5. Save Ticket
  if (endpoint === '/api/tickets') {
    const isEdit = !!body.Id;
    if (isEdit) {
      const idx = db.tickets.findIndex((t: any) => t.Id === body.Id);
      if (idx !== -1) {
        db.tickets[idx] = { ...db.tickets[idx], ...body, UpdatedAt: new Date().toISOString() };
        saveLocalDb(db);
        return { success: true, message: 'Tiket berhasil diperbarui!', data: { ticket: db.tickets[idx], isNew: false } as any };
      }
    } else {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const ejob = `EJOB/${year}/${month}/${String(db.ejobCounter).padStart(3, '0')}`;
      db.ejobCounter += 1;

      const newTicket = {
        ...body,
        Id: 'tkt_' + Math.random().toString(36).substring(2, 9),
        Ejob: ejob,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        Status: 'Open'
      };
      db.tickets.unshift(newTicket);
      saveLocalDb(db);
      return { success: true, message: `Tiket baru ${ejob} berhasil dibuat!`, data: { ticket: newTicket, ejob, isNew: true } as any };
    }
  }

  // 6. Delete Ticket
  if (endpoint.startsWith('/api/tickets/')) {
    const id = endpoint.replace('/api/tickets/', '');
    db.tickets = db.tickets.filter((t: any) => t.Id !== id);
    saveLocalDb(db);
    return { success: true, message: 'Tiket berhasil dihapus.' };
  }

  // 7. Save User
  if (endpoint === '/api/users') {
    const newUser = {
      Id: 'usr_' + Math.random().toString(36).substring(2, 9),
      ...body,
      MustChangePassword: true,
      Status: 'Active'
    };
    db.users.push(newUser);
    saveLocalDb(db);
    return { success: true, message: `User ${body.Nama} berhasil dibuat.` };
  }

  // 8. Delete User
  if (endpoint.startsWith('/api/users/')) {
    const id = endpoint.replace('/api/users/', '');
    db.users = db.users.filter((u: any) => u.Id !== id);
    saveLocalDb(db);
    return { success: true, message: 'User berhasil dihapus.' };
  }

  // 9. Save Settings
  if (endpoint === '/api/settings') {
    if (body.departments) db.settings.Departments = body.departments;
    if (body.categories) db.settings.Categories = body.categories;
    if (body.itPhone) db.settings.ItPhone = body.itPhone;
    if (body.loginBgUrl) db.settings.LoginBgUrl = body.loginBgUrl;
    saveLocalDb(db);
    return { success: true, message: 'Pengaturan berhasil disimpan.' };
  }

  return { success: true, message: 'Proses disimulasikan secara lokal.' };
}

export const api = {
  // Auth
  login: (username: string, password: string) => 
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  logout: () => 
    request('/api/auth/logout', { method: 'POST' }),

  getInitialData: () => 
    request('/api/initial-data', { method: 'GET' }),

  changePassword: (newPassword: string) => 
    request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    }),

  // Tickets
  saveTicket: (payload: any) => 
    request('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  deleteTicket: (id: string) => 
    request(`/api/tickets/${id}`, { method: 'DELETE' }),

  resetTickets: () => 
    request('/api/tickets/reset', { method: 'POST' }),

  // Users
  saveUser: (payload: any) => 
    request('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  deleteUser: (id: string) => 
    request(`/api/users/${id}`, { method: 'DELETE' }),

  // Settings
  saveSettings: (payload: any) => 
    request('/api/settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Supabase Integration
  getSupabaseStatus: () =>
    request<{ connected?: boolean; url?: string; message?: string; error?: string }>('/api/supabase/status', { method: 'GET' }),

  syncSupabase: () =>
    request<{ countUsers?: number; countTickets?: number }>('/api/supabase/sync', { method: 'POST' }),

  getSupabaseSchema: () =>
    request<{ sql?: string }>('/api/supabase-schema', { method: 'GET' })
};
