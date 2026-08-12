import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
  bgUrl?: string;
}

const DEFAULT_BG_IMAGE = 'https://res.cloudinary.com/dedtb3vnj/image/upload/v1785044494/header-brands0526_co10uq.jpg';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, loading, bgUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const activeBg = bgUrl || DEFAULT_BG_IMAGE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onLogin(username.trim(), password.trim());
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900 overflow-hidden">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 scale-100"
        style={{
          backgroundImage: `url('${activeBg}')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-blue-950/60 to-orange-950/70 backdrop-blur-[2px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-orange-200/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 rounded-2xl bg-white border border-orange-200 shadow-sm inline-flex items-center justify-center">
              <img 
                src="https://res.cloudinary.com/dedtb3vnj/image/upload/v1782568576/kino_yrhkmc.png" 
                alt="Kino Logo" 
                className="h-10 w-auto object-contain max-w-[160px]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight text-blue-950">
            Kino <span className="text-orange-500 font-extrabold">IT Helpdesk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sistem Layanan Mandiri & Support IT Cikembar Plant
          </p>
        </div>

        {/* Quick Public Guest Login Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onLogin('public', 'public123')}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl font-extrabold text-xs text-blue-900 bg-blue-50 hover:bg-blue-100 transition flex items-center justify-center gap-2.5 border border-blue-200/80 cursor-pointer disabled:opacity-60 shadow-xs"
          >
            <User className="w-4 h-4 text-orange-500" />
            <span>Akses Cepat sebagai User Public (Tamu)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-wider">
            <span className="bg-white px-3 text-slate-400">Atau Login Akun</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-2xl font-extrabold text-white bg-orange-500 hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-xs"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
          &copy; Kino IT Helpdesk Cikembar. All rights reserved.
        </div>

      </div>
    </div>
  );
};
