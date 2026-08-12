import React from 'react';
import { PageView, User } from '../types';
import { LayoutDashboard, Ticket, Settings, LogOut, Building2 } from 'lucide-react';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  currentUser: User | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const isAdmin = currentUser?.Role === 'Administrator';

  const navItems = [
    { id: 'home' as PageView, label: 'Profil Kino', icon: Building2, adminOnly: false },
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'tickets' as PageView, label: 'Data Request', icon: Ticket, adminOnly: false },
    { id: 'settings' as PageView, label: 'Pengaturan', icon: Settings, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 flex items-center justify-center">
            <img 
              src="https://res.cloudinary.com/dedtb3vnj/image/upload/v1782568576/kino_yrhkmc.png" 
              alt="Kino Logo" 
              className="h-8 w-auto max-w-[100px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight truncate">
              Kino <span className="text-orange-600 font-extrabold">IT Helpdesk</span>
            </h1>
            <span className="text-[10px] font-bold text-orange-600/80 uppercase tracking-wider block">
              Cikembar Plant
            </span>
          </div>
        </div>

        {/* User Profile Info Badge */}
        <div className="m-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-600 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0">
            {(currentUser?.Nama || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-slate-900 text-xs truncate leading-snug">
              {currentUser?.Nama || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              @{currentUser?.Username || 'user'}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-orange-100/80 text-orange-700 border border-orange-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              {currentUser?.Role || 'User Biasa'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs btn-fast active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-300/40'
                    : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
};
