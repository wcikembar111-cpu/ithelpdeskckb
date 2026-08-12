import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onSave: (newPassword: string) => Promise<void>;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onSave
}) => {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setP1('');
      setP2('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (p1 !== p2) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave(p1);
    } catch (err) {
      setError('Gagal mengubah password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-300 dark:border-amber-800/80 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-amber-500 text-slate-900 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base">Ganti Password Wajib</h3>
            <p className="text-xs text-amber-950 font-medium">
              Sistem mengharuskan Anda memperbarui password default sebelum melanjutkan.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password Baru *
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Konfirmasi Password Baru *
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Ketik ulang password baru"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 transition cursor-pointer shadow-md text-sm disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Memproses...' : 'Simpan Password Baru'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
