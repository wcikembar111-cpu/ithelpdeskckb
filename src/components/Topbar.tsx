import React from 'react';
import { PageView, User, Ticket } from '../types';
import { Menu } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallPrompt';
import { PendingNotificationDropdown } from './PendingNotificationDropdown';

interface TopbarProps {
  currentPage: PageView;
  currentUser: User | null;
  pendingTickets?: Ticket[];
  onToggleSidebarMobile: () => void;
  onViewDetailTicket?: (ticket: Ticket) => void;
  onNavigate?: (page: PageView) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  currentUser,
  pendingTickets = [],
  onToggleSidebarMobile,
  onViewDetailTicket,
  onNavigate
}) => {
  const pageTitles: Record<PageView, { title: string; subtitle: string }> = {
    home: {
      title: 'Profil Perusahaan Kino',
      subtitle: 'Sejarah, Visi, Misi & Inovasi PT Kino Indonesia Tbk'
    },
    dashboard: {
      title: 'Dashboard System',
      subtitle: 'Ringkasan Grafik & Status Permintaan Tiket IT'
    },
    tickets: {
      title: 'Data Request Tiket',
      subtitle: 'Manajemen Permintaan & Perbaikan IT Kino Cikembar'
    },
    users: {
      title: 'Manajemen User',
      subtitle: 'Kelola Hak Akses Pengguna & Petugas (Admin)'
    },
    settings: {
      title: 'Pengaturan Sistem',
      subtitle: 'Konfigurasi Departemen, Kategori & Hotline IT (Admin)'
    }
  };

  const currentInfo = pageTitles[currentPage] || {
    title: 'Kino IT Helpdesk',
    subtitle: 'Sistem Layanan Support IT'
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 lg:hidden btn-fast cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 text-orange-600" />
        </button>

        <div>
          <h2 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-2">
            <span>{currentInfo.title}</span>
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pending Request Bell Notification */}
        {onViewDetailTicket && (
          <PendingNotificationDropdown
            pendingTickets={pendingTickets}
            onViewDetailTicket={onViewDetailTicket}
            onNavigate={onNavigate}
          />
        )}

        {/* PWA Install Button after Login */}
        <PWAInstallButton variant="topbar" />
      </div>
    </header>
  );
};
