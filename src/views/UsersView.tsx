import React from 'react';
import { User } from '../types';
import { UserPlus, Shield, UserCheck, Trash2 } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  onOpenAddUserModal: () => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onOpenAddUserModal,
  onDeleteUser
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Daftar Pengguna Sistem
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola akun administrator, petugas IT, dan pengguna biasa (Khusus Administrator).
          </p>
        </div>

        <button
          onClick={onOpenAddUserModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-extrabold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-200/50 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-5">Nama Lengkap</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5">Role Akses</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {users.map((u) => {
                const isDefaultAdmin = u.Username.toLowerCase() === 'admin';

                return (
                  <tr key={u.Id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100">
                      {u.Nama}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      @{u.Username}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          u.Role === 'Administrator'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : u.Role === 'Petugas IT'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                            : u.Role === 'User Public'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.Role}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                        <UserCheck className="w-3 h-3" /> Aktif
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      {!isDefaultAdmin ? (
                        <button
                          onClick={() => onDeleteUser(u.Id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 italic">
                          System Default
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
