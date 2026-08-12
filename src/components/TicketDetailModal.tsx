import React from 'react';
import { Ticket } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  X,
  Printer,
  PhoneCall,
  User,
  Building,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface TicketDetailModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  itPhone?: string;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  ticket,
  itPhone,
  onClose
}) => {
  if (!isOpen || !ticket) return null;

  // Format WhatsApp Hotline Link
  const getWaHotlineUrl = () => {
    let rawPhone = String(itPhone || '6281234567890').replace(/[^0-9]/g, '');
    if (rawPhone.startsWith('0')) rawPhone = '62' + rawPhone.slice(1);

    const message = 
`🔔 *Laporan Tiket IT Helpdesk Kino Cikembar*
*No E-Job:* ${ticket.Ejob || '-'}
*Nama Pemohon:* ${ticket.Nama || '-'} (${ticket.Departement || '-'})
*Kategori:* ${ticket.Kategori || '-'}
*Subjek:* ${ticket.Subject || '-'}
*Status:* ${ticket.Status || '-'}

*Detail Kendala:*
${ticket.Description || '-'}`;

    return `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(message)}`;
  };

  // Format WhatsApp Direct Pemohon Link
  const getWaPemohonUrl = () => {
    if (!ticket.NoWa) return '#';
    let raw = String(ticket.NoWa).replace(/[^0-9]/g, '');
    if (raw.startsWith('0')) raw = '62' + raw.slice(1);
    const msg = `Halo Bapak/Ibu ${ticket.Nama}, terkait tiket E-Job ${ticket.Ejob} (${ticket.Subject}) di Kino IT Helpdesk:`;
    return `https://api.whatsapp.com/send?phone=${raw}&text=${encodeURIComponent(msg)}`;
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fast-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 printable-modal">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white flex items-center justify-between shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-mono font-extrabold text-sm border border-white/20">
              {ticket.Ejob?.slice(-4) || 'TKT'}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Detail Request Tiket IT
              </h3>
              <p className="text-xs text-orange-100/90 font-medium">
                No E-Job: <span className="font-mono font-bold">{ticket.Ejob || 'Draft'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Header (Visible only when printing) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900">PT KINO INDONESIA TBK - CIKEMBAR</h1>
              <p className="text-sm text-slate-600">FORM PERMINTAAN TIKET PERBAIKAN & LAYANAN IT</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-orange-600">{ticket.Ejob}</span>
              <p className="text-xs text-slate-500">{ticket.Tanggal}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Top Key Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
              <span className="text-[10px] font-extrabold text-orange-600/80 uppercase tracking-wider block mb-1">
                Status Tiket
              </span>
              <StatusBadge status={ticket.Status} />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Tipe & Prioritas
              </span>
              <PriorityBadge type={ticket.TypeTicket} size="sm" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Tanggal Buat
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                {ticket.Tanggal || '-'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Tgl Selesai
              </span>
              <span className="font-extrabold text-emerald-900 text-xs">
                {ticket.TanggalSelesai || '-'}
              </span>
            </div>
          </div>

          {/* Section: Pemohon & Lokasi */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wide border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-orange-500" /> Informasi Pemohon Laporan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Nama Pemohon:</span>
                <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{ticket.Nama || '-'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Departemen / Unit:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {ticket.Departement || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Lokasi / Ruangan:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {ticket.Lokasi || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">No. WhatsApp Pemohon:</span>
                {ticket.NoWa ? (
                  <a
                    href={getWaPemohonUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 font-extrabold hover:underline mt-0.5"
                  >
                    <span>{ticket.NoWa}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-500" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic mt-0.5 block">- Tidak diisi -</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Subjek & Detail Kendala */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-orange-500" /> Subjek & Deskripsi Laporan
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-100 flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-500" /> Kategori: {ticket.Kategori || 'Lainnya'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold mb-1">Subjek Permintaan:</span>
              <div className="p-3 rounded-xl bg-orange-50/40 border border-orange-100/80 font-bold text-slate-900 text-sm">
                {ticket.Subject || '-'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold mb-1">Deskripsi Lengkap Kendala:</span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed font-normal min-h-[80px]">
                {ticket.Description || 'Tidak ada deskripsi rinci.'}
              </div>
            </div>
          </div>

          {/* Section: Penanganan & Tindak Lanjut IT */}
          <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
            <h4 className="font-extrabold text-blue-950 text-xs flex items-center gap-2 uppercase tracking-wide border-b border-blue-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Tindak Lanjut & Penanganan Petugas IT
            </h4>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium mb-1">Tindakan / Solusi IT (Action):</span>
                <div className="p-3 rounded-xl bg-white border border-blue-200/80 text-slate-800 font-medium whitespace-pre-wrap min-h-[60px]">
                  {ticket.Action || <span className="text-slate-400 italic">Belum ada catatan penanganan dari Petugas IT.</span>}
                </div>
              </div>

              {ticket.Keterangan && (
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium mb-1">Keterangan Tambahan:</span>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-blue-100 text-slate-700">
                    {ticket.Keterangan}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak Tiket</span>
            </button>

            <a
              href={getWaHotlineUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Hotline IT WA</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-900 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
