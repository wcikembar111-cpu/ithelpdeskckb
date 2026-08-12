import React, { useState } from 'react';
import { Ticket, User, TicketStatus } from '../types';
import { Search, Plus, FileSpreadsheet, Trash2, Edit3, Eye, RotateCcw, PhoneCall, User as UserIcon, Calendar, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

interface TicketsViewProps {
  tickets: Ticket[];
  currentUser: User | null;
  itPhone?: string;
  onOpenModal: (ticketId?: string) => void;
  onViewDetailTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onResetTickets: () => void;
  onQuickStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  currentUser,
  itPhone,
  onOpenModal,
  onViewDetailTicket,
  onDeleteTicket,
  onResetTickets,
  onQuickStatusChange
}) => {
  const isAdmin = currentUser?.Role === 'Administrator';
  const isIT = currentUser?.Role === 'Petugas IT';
  const canManage = isAdmin || isIT;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pemohonFilter, setPemohonFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.Status !== statusFilter) return false;

    if (dateFilter.trim()) {
      if (t.Tanggal !== dateFilter) return false;
    }

    if (pemohonFilter.trim()) {
      const pf = pemohonFilter.trim().toLowerCase();
      const namaPemohon = (t.Nama || '').toLowerCase();
      if (!namaPemohon.includes(pf)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ejob = (t.Ejob || '').toLowerCase();
      const subj = (t.Subject || '').toLowerCase();
      const desc = (t.Description || '').toLowerCase();
      const nama = (t.Nama || '').toLowerCase();
      const dept = (t.Departement || '').toLowerCase();
      return (
        ejob.includes(q) ||
        subj.includes(q) ||
        desc.includes(q) ||
        nama.includes(q) ||
        dept.includes(q)
      );
    }
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) return;

    const headers = ['No E-Job', 'Tanggal', 'Nama', 'Departemen', 'Kategori', 'Tipe', 'Subjek', 'Status', 'Tgl Selesai'];
    const rows = tickets.map((t) => [
      `"${t.Ejob || ''}"`,
      `"${t.Tanggal || ''}"`,
      `"${t.Nama || ''}"`,
      `"${t.Departement || ''}"`,
      `"${t.Kategori || ''}"`,
      `"${t.TypeTicket || ''}"`,
      `"${(t.Subject || '').replace(/"/g, '""')}"`,
      `"${t.Status || ''}"`,
      `"${t.TanggalSelesai || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tiket_Kino_Helpdesk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Link Generator for IT Hotline
  const getWhatsAppHotlineUrl = (t: Ticket) => {
    let rawPhone = String(itPhone || '6281234567890').replace(/[^0-9]/g, '');
    if (rawPhone.startsWith('0')) rawPhone = '62' + rawPhone.slice(1);

    const message = 
`🔔 *Laporan Tiket IT Helpdesk Kino Cikembar*
*No E-Job:* ${t.Ejob}
*Nama Pemohon:* ${t.Nama} (${t.Departement})
*Kategori:* ${t.Kategori}
*Subjek:* ${t.Subject}
*Status:* ${t.Status}

*Detail Kendala:*
${t.Description}`;

    return `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 animate-fast-in">
      
      {/* Controls & Filters Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Top Action Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'Open', 'On Progress', 'Pending Part', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {st === 'ALL' ? `Semua (${tickets.length})` : st}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={onResetTickets}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-blue-950 text-white hover:bg-blue-900 transition cursor-pointer"
                title="Reset seluruh data tiket"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All</span>
              </button>
            )}

            <button
              onClick={() => onOpenModal()}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 transition shadow-md shadow-orange-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tiket Baru</span>
            </button>
          </div>
        </div>

        {/* Search, Date Calendar & Pemohon Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Filter Pemohon
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={pemohonFilter}
                onChange={(e) => setPemohonFilter(e.target.value)}
                placeholder="Ketik huruf nama pemohon..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Filter Tanggal</span>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                onClick={(e) => {
                  if ('showPicker' in e.currentTarget) {
                    try { (e.currentTarget as any).showPicker(); } catch {}
                  }
                }}
                className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition cursor-pointer"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Pencarian Kata Kunci
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari E-Job, Subjek, Deskripsi, Pemohon, Departemen..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Tickets Table */}
      <div className="rounded-3xl bg-white border border-orange-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">No E-Job</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 max-w-[280px]">Subjek & Deskripsi</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Pemohon</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => {
                return (
                  <tr key={t.Id} className="hover:bg-orange-50/30 transition">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-blue-700">
                      {t.Ejob || 'Draft'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {t.Tanggal}
                    </td>

                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="font-extrabold text-slate-900 truncate">
                        {t.Subject}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">
                        {t.Description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge type={t.TypeTicket} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.Nama}</div>
                      <div className="text-slate-400 text-[11px]">{t.Departement}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 font-bold text-[11px]">
                        {t.Kategori || '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={t.Status}
                        canEdit={canManage}
                        onStatusChange={(newStatus) => onQuickStatusChange?.(t.Id, newStatus)}
                      />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* WA Hotline Button */}
                        <a
                          href={getWhatsAppHotlineUrl(t)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          title="Kirim Ringkasan WA Hotline IT"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </a>

                        {/* View Detail Modal Button (All users: Admin & User Public) */}
                        <button
                          onClick={() => onViewDetailTicket(t)}
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          title="Lihat Detail Tiket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Ticket Button (Admin / Petugas IT only) */}
                        {canManage && (
                          <button
                            onClick={() => onOpenModal(t.Id)}
                            className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition cursor-pointer"
                            title="Edit Tiket (Admin/IT)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Ticket Button (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteTicket(t.Id)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                            title="Hapus Tiket (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data tiket yang cocok dengan kriteria pencarian.
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

