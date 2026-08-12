import React, { useState, useEffect } from 'react';
import { Ticket, User, TicketStatus, TicketType } from '../types';
import { X, Wrench, UserCog, AlertCircle, Eye, Save } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  departments: string[];
  categories: string[];
  currentUser: User | null;
  onSave: (payload: any) => Promise<void>;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  departments,
  categories,
  currentUser,
  onSave
}) => {
  const isEdit = !!ticket;
  const isAdminOrIT = currentUser?.Role === 'Administrator' || currentUser?.Role === 'Petugas IT';

  const creatorUser = String(ticket?.Creator || '').trim().toLowerCase();
  const creatorNama = String(ticket?.Nama || '').trim().toLowerCase();
  const myUsername = String(currentUser?.Username || '').trim().toLowerCase();
  const myNama = String(currentUser?.Nama || '').trim().toLowerCase();

  const isCreator = (creatorUser && creatorUser === myUsername) || (creatorNama && creatorNama === myNama) || (currentUser?.Role === 'User Public' && ticket?.Creator === 'public');
  const canEdit = !isEdit || isAdminOrIT || (isCreator && ticket?.Status === 'Open');

  // Form states
  const [tanggal, setTanggal] = useState('');
  const [nama, setNama] = useState('');
  const [noWa, setNoWa] = useState('');
  const [departement, setDepartement] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kategori, setKategori] = useState('');
  const [typeTicket, setTypeTicket] = useState<TicketType>('Request');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // IT Resolution states
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [action, setAction] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [initializedId, setInitializedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const targetId = ticket ? ticket.Id : 'NEW_TICKET';
      if (initializedId !== targetId) {
        setInitializedId(targetId);
        if (ticket) {
          setTanggal(ticket.Tanggal || new Date().toISOString().split('T')[0]);
          setNama(ticket.Nama || '');
          setNoWa(ticket.NoWa || '');
          setDepartement(ticket.Departement || departments[0] || 'IT');
          setLokasi(ticket.Lokasi || '');
          setKategori(ticket.Kategori || categories[0] || 'Hardware');
          setTypeTicket((ticket.TypeTicket as TicketType) || 'Request');
          setSubject(ticket.Subject || '');
          setDescription(ticket.Description || '');

          setStatus(ticket.Status || 'Open');
          setTanggalSelesai(ticket.TanggalSelesai || '');
          setAction(ticket.Action || '');
          setKeterangan(ticket.Keterangan || '');
        } else {
          setTanggal(new Date().toISOString().split('T')[0]);
          setNama(currentUser?.Role === 'User Public' ? '' : (currentUser?.Nama || ''));
          setNoWa('');
          setDepartement(departments[0] || 'IT');
          setLokasi('');
          setKategori(categories[0] || 'Hardware');
          setTypeTicket('Request');
          setSubject('');
          setDescription('');

          setStatus('Open');
          setTanggalSelesai('');
          setAction('');
          setKeterangan('');
        }
      }
    } else if (initializedId !== null) {
      setInitializedId(null);
    }
  }, [isOpen, ticket, initializedId, currentUser, departments, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSubmitting(true);
    try {
      const payload: any = {
        Id: ticket?.Id || null,
        Tanggal: tanggal,
        Nama: nama,
        NoWa: noWa,
        Departement: departement,
        Lokasi: lokasi,
        Kategori: kategori,
        TypeTicket: typeTicket,
        Subject: subject,
        Description: description
      };

      if (isAdminOrIT) {
        payload.Status = status;
        payload.TanggalSelesai = tanggalSelesai;
        payload.Action = action;
        payload.Keterangan = keterangan;
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fast-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {isEdit ? (canEdit ? 'Edit Request Tiket IT' : 'Rincian Request Tiket') : 'Buat Request Tiket Baru'}
              {!canEdit && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Read-Only
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Isi data detail laporan kendala perbaikan IT Kino Cikembar.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* E-Job display banner if editing */}
          {isEdit && ticket && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Nomor E-Job Tiket
                </span>
                <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {ticket.Ejob}
                </span>
              </div>
              <StatusBadge
                status={status}
                canEdit={isAdminOrIT}
                onStatusChange={(newSt) => setStatus(newSt)}
                size="lg"
              />
            </div>
          )}

          {/* Pemohon Section */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 mb-4">
              <UserCog className="w-4 h-4" /> Informasi Pemohon
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tanggal Request *</span>
                  <span className="text-[10px] text-orange-600 font-bold">Pilih di kalender</span>
                </label>
                <input
                  type="date"
                  required
                  disabled={!canEdit}
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  onClick={(e) => {
                    if (canEdit && 'showPicker' in e.currentTarget) {
                      try { (e.currentTarget as any).showPicker(); } catch {}
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none disabled:opacity-60 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pemohon *
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  placeholder="Nama lengkap pemohon"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  No WhatsApp / HP
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  placeholder="08xxxxxxxxxx"
                  value={noWa}
                  onChange={(e) => setNoWa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Departemen *
                </label>
                <select
                  required
                  disabled={!canEdit}
                  value={departement}
                  onChange={(e) => setDepartement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasi / Area
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  placeholder="Contoh: Gedung A Lt.2 Area QC"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Kendala Section */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" /> Detail Kendala & Perbaikan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Request *
                </label>
                <select
                  required
                  disabled={!canEdit}
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Tiket *
                </label>
                <select
                  required
                  disabled={!canEdit}
                  value={typeTicket}
                  onChange={(e) => setTypeTicket(e.target.value as TicketType)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                >
                  <option value="Request">Request (Permintaan Layanan/Sistem)</option>
                  <option value="Incident">Incident (Kendala / Kerusakan / Gangguan)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Subjek Ringkas *
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  placeholder="Ringkasan singkat kendala yang dihadapi"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Detail *
                </label>
                <textarea
                  required
                  rows={3}
                  disabled={!canEdit}
                  placeholder="Jelaskan kronologi, error pesan, atau spesifikasi detail permintaan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 resize-none"
                />
              </div>
            </div>
          </div>

          {/* IT Resolution Section (Visible & Editable for IT/Admin or when details exist) */}
          {(isAdminOrIT || (isEdit && (action || keterangan || tanggalSelesai))) && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 mb-4">
                <Wrench className="w-4 h-4" /> Resolusi & Tindakan IT Support
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                    Status Tiket *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Open', 'On Progress', 'Pending Part', 'Closed'] as TicketStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={!isAdminOrIT}
                        onClick={() => setStatus(st)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer border ${
                          status === st
                            ? st === 'Open'
                              ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200'
                              : st === 'On Progress'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200'
                              : st === 'Pending Part'
                              ? 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-200'
                              : 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className={`w-2 h-2 rounded-full ${status === st ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                        <span>{st}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tanggal Selesai</span>
                    <span className="text-[10px] text-orange-600 font-bold">Pilih di kalender</span>
                  </label>
                  <input
                    type="date"
                    disabled={!isAdminOrIT}
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    onClick={(e) => {
                      if (isAdminOrIT && 'showPicker' in e.currentTarget) {
                        try { (e.currentTarget as any).showPicker(); } catch {}
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-60 cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Tindakan Perbaikan IT
                  </label>
                  <textarea
                    rows={2}
                    disabled={!isAdminOrIT}
                    placeholder="Langkah tindakan teknis perbaikan yang sudah / sedang dikerjakan"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan / Sparepart
                  </label>
                  <textarea
                    rows={2}
                    disabled={!isAdminOrIT}
                    placeholder="Catatan penggantian komponen sparepart, vendor, atau garansi"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
            >
              {canEdit ? 'Batal' : 'Tutup'}
            </button>

            {canEdit && (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer shadow-md shadow-indigo-200/50 text-xs disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Tiket'}</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
