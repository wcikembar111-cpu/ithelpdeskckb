import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Ticket, Settings, PageView, TicketStatus } from './types';
import { api, getAuthToken, setAuthToken } from './lib/api';

import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileNav } from './components/MobileNav';
import { TicketModal } from './components/TicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { UserModal } from './components/UserModal';
import { PasswordModal } from './components/PasswordModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

import { LoginView } from './views/LoginView';
import { KinoProfileView } from './views/KinoProfileView';
import { DashboardView } from './views/DashboardView';
import { TicketsView } from './views/TicketsView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>({
    Departments: ['IT', 'HRD', 'Finance', 'Produksi', 'Warehouse', 'QA/QC', 'Logistik', 'Purchasing'],
    Categories: ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'ERP/System', 'Lainnya'],
    LoginBgUrl: '',
    ItPhone: '6281234567890'
  });

  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success', linkUrl?: string, linkLabel?: string) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type, linkUrl, linkLabel }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({ isOpen: false });

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirmAction: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText = 'Ya, Lanjutkan'
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: () => {
        setConfirmConfig({ isOpen: false });
        onConfirmAction();
      }
    });
  }, []);

  // Modals state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailTicket, setSelectedDetailTicket] = useState<Ticket | null>(null);

  const handleViewDetailTicket = (ticket: Ticket) => {
    setSelectedDetailTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Ensure clean bright light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  const currentUserRef = useRef(currentUser);
  const ticketsRef = useRef(tickets);
  const usersRef = useRef(users);
  const settingsRef = useRef(settings);

  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { ticketsRef.current = tickets; }, [tickets]);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Fetch initial data with optional silent background refresh for real-time multi-device sync
  const loadInitialData = useCallback(async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setLoading(true);
    try {
      const res = await api.getInitialData();
      if (res.success && res.data) {
        if (JSON.stringify(res.data.currentUser) !== JSON.stringify(currentUserRef.current)) {
          setCurrentUser(res.data.currentUser || null);
        }
        if (JSON.stringify(res.data.tickets) !== JSON.stringify(ticketsRef.current)) {
          setTickets(res.data.tickets || []);
        }
        if (JSON.stringify(res.data.users) !== JSON.stringify(usersRef.current)) {
          setUsers(res.data.users || []);
        }
        if (res.data.settings && JSON.stringify(res.data.settings) !== JSON.stringify(settingsRef.current)) {
          setSettings(res.data.settings);
        }

        if (!isSilent && res.data.currentUser?.MustChangePassword) {
          setIsPasswordModalOpen(true);
        }
      } else {
        if (!isSilent) {
          addToast(res.message || 'Sesi tidak valid, silakan login kembali.', 'warning');
          handleLogoutDirect();
        }
      }
    } catch (err) {
      console.error(err);
      if (!isSilent) {
        addToast('Gagal memuat data dari server.', 'danger');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token, addToast]);

  useEffect(() => {
    if (token) {
      loadInitialData(false);

      // Real-time synchronization across all devices every 3 seconds
      const intervalId = setInterval(() => {
        loadInitialData(true);
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [token, loadInitialData]);

  // Ensure non-admin users cannot stay on settings or users page
  useEffect(() => {
    if (currentUser && currentUser.Role !== 'Administrator') {
      if (currentPage === 'settings' || currentPage === 'users') {
        setCurrentPage('home');
      }
    }
  }, [currentUser, currentPage]);

  // Auth actions
  const handleLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      const res = await api.login(u, p);
      if (res.success && res.data) {
        setToken(res.data.token);
        setAuthToken(res.data.token);
        setCurrentUser(res.data.user);
        if (res.data.user?.Role !== 'Administrator' && (currentPage === 'settings' || currentPage === 'users')) {
          setCurrentPage('home');
        }
        addToast(res.message || 'Login Berhasil!', 'success');
      } else {
        addToast(res.message || 'Login Gagal.', 'danger');
      }
    } catch (err) {
      addToast('Terjadi kesalahan saat login.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutDirect = () => {
    api.logout();
    setAuthToken(null);
    setToken(null);
    setCurrentUser(null);
    setTickets([]);
    setUsers([]);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    showConfirm(
      'Konfirmasi Keluar Sesi',
      'Apakah Anda yakin ingin keluar dari sistem Kino IT Helpdesk?',
      handleLogoutDirect,
      'warning',
      'Ya, Keluar'
    );
  };

  const handleChangePassword = async (newPassword: string) => {
    const res = await api.changePassword(newPassword);
    if (res.success) {
      addToast(res.message || 'Password berhasil diperbarui.', 'success');
      setIsPasswordModalOpen(false);
      loadInitialData();
    } else {
      addToast(res.message || 'Gagal mengubah password.', 'danger');
    }
  };

  // Ticket actions
  const handleOpenTicketModal = (ticketId?: string) => {
    setSelectedTicketId(ticketId);
    setIsTicketModalOpen(true);
  };

  const handleSaveTicket = async (payload: any) => {
    const res = await api.saveTicket(payload);
    if (res.success) {
      addToast(res.message || 'Tiket berhasil disimpan!', 'success');
      if (res.data && res.data.isNew && res.data.ejob) {
        // Generate WhatsApp Hotline notification & redirect automatically
        let rawPhone = String(settings.ItPhone || '6281234567890').replace(/[^0-9]/g, '');
        if (rawPhone.startsWith('0')) rawPhone = '62' + rawPhone.slice(1);

        const waText = 
`🔔 *LAPORAN TIKET IT HELPDESK BARU*
━━━━━━━━━━━━━━━━━━━━
📌 *No E-Job:* ${res.data.ejob}
👤 *Nama Pemohon:* ${payload.Nama || '-'}
🏢 *Departemen:* ${payload.Departement || '-'}
📱 *No. WA Pemohon:* ${payload.NoWa || '-'}
📍 *Lokasi:* ${payload.Lokasi || '-'}
📁 *Kategori:* ${payload.Kategori || '-'}
🏷️ *Tipe:* ${payload.TypeTicket || '-'}
📅 *Tanggal:* ${payload.Tanggal || '-'}
📋 *Subjek:* ${payload.Subject || '-'}

📝 *Deskripsi Kendala:*
${payload.Description || '-'}
━━━━━━━━━━━━━━━━━━━━
_Pesan ini dikirim otomatis dari Aplikasi Kino IT Helpdesk_`;

        const waUrl = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(waText)}`;

        // Otomatis buka aplikasi WhatsApp
        setTimeout(() => {
          const win = window.open(waUrl, '_blank');
          if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = waUrl;
          }
        }, 300);

        addToast(
          `Tiket ${res.data.ejob} berhasil dibuat! Membuka WhatsApp Hotline...`,
          'success',
          waUrl,
          'Buka WhatsApp Hotline'
        );
      }
      loadInitialData();
    } else {
      addToast(res.message || 'Gagal menyimpan tiket.', 'danger');
    }
  };

  const handleQuickStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    // Optimistic local state update for instant UI animation
    setTickets((prev) =>
      prev.map((t) => (t.Id === ticketId ? { ...t, Status: newStatus, UpdatedAt: new Date().toISOString() } : t))
    );

    const targetTicket = tickets.find((t) => t.Id === ticketId);
    if (!targetTicket) return;

    const payload: any = {
      Id: ticketId,
      Status: newStatus,
    };
    if (newStatus === 'Closed' && !targetTicket.TanggalSelesai) {
      payload.TanggalSelesai = new Date().toISOString().split('T')[0];
    }

    const res = await api.saveTicket(payload);
    if (res.success) {
      addToast(`Status tiket ${targetTicket.Ejob} diubah ke "${newStatus}"`, 'success');
      loadInitialData();
    } else {
      addToast(res.message || 'Gagal memperbarui status tiket.', 'danger');
      loadInitialData();
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    showConfirm(
      'Hapus Tiket',
      'Apakah Anda yakin ingin menghapus tiket ini secara permanen?',
      async () => {
        const res = await api.deleteTicket(ticketId);
        if (res.success) {
          addToast(res.message || 'Tiket berhasil dihapus.', 'success');
          loadInitialData();
        } else {
          addToast(res.message || 'Gagal menghapus tiket.', 'danger');
        }
      },
      'danger',
      'Ya, Hapus'
    );
  };

  const handleResetTickets = () => {
    showConfirm(
      'Reset Seluruh Tiket',
      'PERINGATAN: Semua data tiket dan penomoran E-Job akan dihapus bersih! Lanjutkan?',
      async () => {
        const res = await api.resetTickets();
        if (res.success) {
          addToast(res.message || 'Seluruh tiket telah di-reset.', 'success');
          loadInitialData();
        } else {
          addToast(res.message || 'Gagal mereset tiket.', 'danger');
        }
      },
      'danger',
      'Ya, Reset Semua'
    );
  };

  // User actions
  const handleSaveUser = async (payload: any) => {
    const res = await api.saveUser(payload);
    if (res.success) {
      addToast(res.message || 'User berhasil ditambahkan!', 'success');
      loadInitialData();
    } else {
      addToast(res.message || 'Gagal menambahkan user.', 'danger');
    }
  };

  const handleDeleteUser = (userId: string) => {
    showConfirm(
      'Hapus User',
      'Apakah Anda yakin ingin menghapus akun user ini?',
      async () => {
        const res = await api.deleteUser(userId);
        if (res.success) {
          addToast(res.message || 'User berhasil dihapus.', 'success');
          loadInitialData();
        } else {
          addToast(res.message || 'Gagal menghapus user.', 'danger');
        }
      },
      'danger',
      'Ya, Hapus User'
    );
  };

  // Settings actions
  const handleSaveSettings = async (payload: any) => {
    const res = await api.saveSettings(payload);
    if (res.success) {
      addToast(res.message || 'Pengaturan berhasil disimpan!', 'success');
      loadInitialData();
    } else {
      addToast(res.message || 'Gagal menyimpan pengaturan.', 'danger');
    }
  };

  const selectedTicket = tickets.find((t) => t.Id === selectedTicketId) || null;

  // Render Login View if not authenticated
  if (!token) {
    return (
      <>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <LoginView onLogin={handleLogin} loading={loading} bgUrl={settings.LoginBgUrl} />
        <PWAInstallPrompt />
      </>
    );
  }

  const pendingTickets = tickets.filter((t) => t.Status !== 'Closed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-blue-50/20 text-slate-900 flex flex-col font-sans antialiased">
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <PWAInstallPrompt />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        onConfirm={confirmConfig.onConfirm || (() => {})}
        onCancel={() => setConfirmConfig({ isOpen: false })}
      />

      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen pb-20 lg:pb-8">
        
        <Topbar
          currentPage={currentPage}
          currentUser={currentUser}
          pendingTickets={pendingTickets}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          onViewDetailTicket={handleViewDetailTicket}
          onNavigate={setCurrentPage}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentPage === 'home' && (
            <KinoProfileView />
          )}

          {currentPage === 'dashboard' && (
            <DashboardView
              tickets={tickets}
              currentUser={currentUser}
              itPhone={settings.ItPhone}
              onNavigate={setCurrentPage}
              onOpenTicket={handleOpenTicketModal}
              onViewDetailTicket={handleViewDetailTicket}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}

          {currentPage === 'tickets' && (
            <TicketsView
              tickets={tickets}
              currentUser={currentUser}
              itPhone={settings.ItPhone}
              onOpenModal={handleOpenTicketModal}
              onViewDetailTicket={handleViewDetailTicket}
              onDeleteTicket={handleDeleteTicket}
              onResetTickets={handleResetTickets}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}

          {(currentPage === 'settings' || currentPage === 'users') && (
            currentUser?.Role === 'Administrator' ? (
              <SettingsView
                settings={settings}
                users={users}
                onSaveSettings={handleSaveSettings}
                onOpenAddUserModal={() => setIsUserModalOpen(true)}
                onDeleteUser={handleDeleteUser}
                initialTab={currentPage === 'users' ? 'users' : 'system'}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-lg mx-auto my-12">
                <h3 className="text-base font-extrabold text-slate-800 mb-1">Akses Terbatas</h3>
                <p className="text-xs text-slate-500">
                  Menu ini khusus untuk Administrator. Silakan login menggunakan akun Administrator.
                </p>
              </div>
            )
          )}
        </main>

        {/* Footer with Developer Copyright */}
        <footer className="px-4 sm:px-6 lg:px-8 py-4 mt-auto text-center border-t border-slate-200/60 text-xs text-slate-500 font-medium bg-white/40 backdrop-blur-xs">
          &copy; {new Date().getFullYear()} Kino IT Helpdesk Cikembar. Developer: <span className="font-bold text-slate-700">ddsuparman84</span>. All rights reserved.
        </footer>

      </div>

      <MobileNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
      />

      {/* Modals */}
      <TicketDetailModal
        isOpen={isDetailModalOpen}
        ticket={selectedDetailTicket}
        itPhone={settings.ItPhone}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={selectedTicket}
        departments={settings.Departments}
        categories={settings.Categories}
        currentUser={currentUser}
        onSave={handleSaveTicket}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onSave={handleChangePassword}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        onConfirm={() => {
          setConfirmConfig({ isOpen: false });
          confirmConfig.onConfirm?.();
        }}
        onCancel={() => setConfirmConfig({ isOpen: false })}
      />

    </div>
  );
}
