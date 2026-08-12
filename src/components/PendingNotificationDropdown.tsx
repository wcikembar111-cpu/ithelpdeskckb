import React, { useState, useRef, useEffect } from 'react';
import { Ticket, PageView } from '../types';
import { Bell, Clock, AlertCircle, ChevronRight, CheckCircle2, User, Tag } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface PendingNotificationDropdownProps {
  pendingTickets: Ticket[];
  onViewDetailTicket: (ticket: Ticket) => void;
  onNavigate?: (page: PageView) => void;
}

export const PendingNotificationDropdown: React.FC<PendingNotificationDropdownProps> = ({
  pendingTickets,
  onViewDetailTicket,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pendingCount = pendingTickets.length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-orange-100 text-orange-600 shadow-inner'
            : 'bg-slate-100/80 text-slate-700 hover:bg-orange-50 hover:text-orange-600'
        }`}
        title={`${pendingCount} Request Pending`}
        aria-label="Notifikasi Request Pending"
      >
        <Bell className={`w-5 h-5 ${pendingCount > 0 ? 'animate-bounce-short' : ''}`} />

        {/* Counter Badge */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white font-black text-[11px] flex items-center justify-center border-2 border-white shadow-xs">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden animate-fast-in">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs">Request Pending IT</h4>
                <p className="text-[10px] text-slate-300">
                  {pendingCount} laporan butuh penanganan
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-extrabold text-[10px]">
              {pendingCount} Pending
            </span>
          </div>

          {/* Pending Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {pendingTickets.length > 0 ? (
              pendingTickets.slice(0, 10).map((ticket) => (
                <div
                  key={ticket.Id}
                  onClick={() => {
                    setIsOpen(false);
                    onViewDetailTicket(ticket);
                  }}
                  className="p-3.5 hover:bg-orange-50/50 transition cursor-pointer flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-xl bg-orange-100/60 text-orange-600 font-mono font-bold text-[10px] shrink-0 mt-0.5 group-hover:bg-orange-500 group-hover:text-white transition">
                    {ticket.Ejob?.slice(-4) || 'TKT'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-extrabold text-[11px] text-blue-700 truncate">
                        {ticket.Ejob}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <PriorityBadge type={ticket.TypeTicket} size="sm" />
                        <StatusBadge status={ticket.Status} size="sm" />
                      </div>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-600 transition">
                      {ticket.Subject}
                    </h5>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium truncate">
                        <User className="w-3 h-3 text-slate-400" />
                        {ticket.Nama} ({ticket.Departement})
                      </span>
                      <span className="shrink-0 flex items-center gap-0.5 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {ticket.Tanggal}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="font-extrabold text-xs text-slate-800">
                  Tidak Ada Request Pending!
                </p>
                <p className="text-[11px] text-slate-500">
                  Semua laporan permintaan dan penanganan IT telah selesai dikerjakan.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {onNavigate && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('tickets');
                }}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-orange-600 hover:text-orange-700 transition cursor-pointer"
              >
                <span>Lihat Semua Request Tiket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
