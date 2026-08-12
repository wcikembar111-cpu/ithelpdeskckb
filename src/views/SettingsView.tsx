import React, { useState, useEffect } from 'react';
import { Settings, User } from '../types';
import { Sliders, Save, Phone, Tags, Network, ShieldCheck, Users } from 'lucide-react';
import { UsersView } from './UsersView';

interface SettingsViewProps {
  settings: Settings;
  users: User[];
  onSaveSettings: (payload: any) => Promise<void>;
  onOpenAddUserModal: () => void;
  onDeleteUser: (userId: string) => void;
  initialTab?: 'system' | 'users';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  users,
  onSaveSettings,
  onOpenAddUserModal,
  onDeleteUser,
  initialTab = 'system'
}) => {
  const [activeTab, setActiveTab] = useState<'system' | 'users'>(initialTab);
  const [deptText, setDeptText] = useState('');
  const [catText, setCatText] = useState('');
  const [itPhone, setItPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDeptText((settings.Departments || []).join(', '));
    setCatText((settings.Categories || []).join(', '));
    setItPhone(settings.ItPhone || '');
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const departments = deptText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const categories = catText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSaveSettings({
        departments,
        categories,
        itPhone: itPhone.trim()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fast-in">
      
      {/* Settings Navigation Tabs */}
      <div className="p-1.5 bg-slate-200/60 rounded-2xl flex items-center gap-1 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs btn-fast cursor-pointer ${
            activeTab === 'system'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Pengaturan Sistem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs btn-fast cursor-pointer ${
            activeTab === 'users'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen User</span>
        </button>
      </div>

      {activeTab === 'system' ? (
        <>
          {/* Main Settings Form */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-600" />
                  Pengaturan Sistem IT Helpdesk
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Atur opsi departemen, kategori kendala, dan kontak hotline WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Departments */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-orange-600" />
                    Daftar Departemen
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Pisahkan nama departemen dengan koma ( , )
                  </p>
                  <textarea
                    rows={5}
                    value={deptText}
                    onChange={(e) => setDeptText(e.target.value)}
                    placeholder="IT, HRD, Finance, Produksi, Warehouse, QA/QC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none resize-none font-medium"
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Tags className="w-4 h-4 text-orange-600" />
                    Kategori Request
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Pisahkan nama kategori dengan koma ( , )
                  </p>
                  <textarea
                    rows={5}
                    value={catText}
                    onChange={(e) => setCatText(e.target.value)}
                    placeholder="Hardware, Software, Network, Printer, Email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none resize-none font-medium"
                  />
                </div>

                {/* IT Hotline WhatsApp Phone Number */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Nomor Kontak Hotline IT WhatsApp
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Nomor WhatsApp yang akan menerima ringkasan pemberitahuan tiket baru (Gunakan kode negara, contoh: 6281234567890).
                  </p>
                  <input
                    type="text"
                    value={itPhone}
                    onChange={(e) => setItPhone(e.target.value)}
                    placeholder="6281234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition btn-fast cursor-pointer shadow-2xs text-xs disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                </button>
              </div>

            </form>
          </div>
        </>
      ) : (
        /* Tab 2: User Management */
        <UsersView
          users={users}
          onOpenAddUserModal={onOpenAddUserModal}
          onDeleteUser={onDeleteUser}
        />
      )}

    </div>
  );
};

