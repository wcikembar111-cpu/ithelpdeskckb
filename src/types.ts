export type UserRole = 'Administrator' | 'Petugas IT' | 'User Biasa' | 'User Public';
export type TicketStatus = 'Open' | 'On Progress' | 'Pending Part' | 'Closed';
export type TicketType = 'Request' | 'Incident';

export interface User {
  Id: string;
  Username: string;
  Nama: string;
  Role: UserRole;
  MustChangePassword?: boolean;
  Status: string;
}

export interface Ticket {
  Id: string;
  Ejob: string;
  Tanggal: string;
  Nama: string;
  NoWa: string;
  Departement: string;
  Lokasi: string;
  Kategori: string;
  TypeTicket: TicketType | string;
  Subject: string;
  Description: string;
  Status: TicketStatus;
  TanggalSelesai?: string;
  Action?: string;
  Keterangan?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  Creator?: string;
}

export interface Settings {
  Departments: string[];
  Categories: string[];
  LoginBgUrl: string;
  ItPhone: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export type PageView = 'home' | 'dashboard' | 'tickets' | 'users' | 'settings';
