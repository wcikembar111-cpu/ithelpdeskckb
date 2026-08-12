import React from 'react';
import { PageView, User } from '../types';
import { LayoutDashboard, Ticket, Settings, Building2 } from 'lucide-react';

interface MobileNavProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  currentUser: User | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  currentUser
}) => {
  const isAdmin = currentUser?.Role === 'Administrator';

  const items = [
    { id: 'home' as PageView, label: 'Profil', icon: Building2, adminOnly: false },
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'tickets' as PageView, label: 'Tiket', icon: Ticket, adminOnly: false },
    { id: 'settings' as PageView, label: 'Setelan', icon: Settings, adminOnly: true }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-orange-100 flex items-center justify-around lg:hidden shadow-lg">
      {items.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-bold transition cursor-pointer ${
              isActive
                ? 'text-orange-600 font-extrabold'
                : 'text-slate-500 hover:text-blue-700'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
