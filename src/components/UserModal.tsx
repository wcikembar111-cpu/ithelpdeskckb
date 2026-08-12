import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('User Biasa');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNama('');
      setUsername('');
      setPassword('');
      setRole('User Biasa');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        Nama: nama,
        Username: username,
        Password: password,
        Role: role
      });
      setNama('');
      setUsername('');
      setPassword('');
      setRole('User Biasa');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Tambah Pengguna Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              required
              placeholder="Username login unik"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Password Awal *
            </label>
            <input
              type="text"
              required
              placeholder="Password awal pengguna"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Role Hak Akses *
            </label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="User Biasa">User Biasa (Lapor & Monitoring Tiket Sendiri)</option>
              <option value="User Public">User Public / Tamu (Akses Bersama Lapor & Cek Semua Tiket)</option>
              <option value="Petugas IT">Petugas IT (Update Resolusi & Tindakan Perbaikan Tiket)</option>
              <option value="Administrator">Administrator (Akses Penuh Kelola Sistem)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer shadow-md shadow-indigo-200/50 text-xs disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan User'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
