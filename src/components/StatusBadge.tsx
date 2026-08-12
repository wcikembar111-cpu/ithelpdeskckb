import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketStatus } from '../types';
import { AlertCircle, Clock, PackageX, CheckCircle2, ChevronDown, Loader2, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus;
  canEdit?: boolean;
  onStatusChange?: (newStatus: TicketStatus) => Promise<void> | void;
  size?: 'sm' | 'md' | 'lg';
  showDropdownArrow?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  canEdit = false,
  onStatusChange,
  size = 'md',
  showDropdownArrow = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trigger visual flash feedback whenever status changes
  useEffect(() => {
    setFlashKey((prev) => prev + 1);
  }, [status]);

  // Close dropdown on outside click
  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectStatus = async (newStatus: TicketStatus) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    if (onStatusChange) {
      setLoading(true);
      try {
        await onStatusChange(newStatus);
      } catch (err) {
        console.error('Failed to change status', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusConfig = (st: TicketStatus) => {
    switch (st) {
      case 'Open':
        return {
          label: 'Open',
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/90',
          ring: 'ring-rose-400',
          dot: 'bg-rose-500',
          ping: 'bg-rose-400',
          Icon: AlertCircle,
          glow: 'shadow-rose-100',
        };
      case 'On Progress':
        return {
          label: 'On Progress',
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/90',
          ring: 'ring-amber-400',
          dot: 'bg-amber-500',
          ping: 'bg-amber-400',
          Icon: Clock,
          glow: 'shadow-amber-100',
        };
      case 'Pending Part':
        return {
          label: 'Pending Part',
          bg: 'bg-purple-50 text-purple-800 border-purple-200/80 hover:bg-purple-100/90',
          ring: 'ring-purple-400',
          dot: 'bg-purple-500',
          ping: 'bg-purple-400',
          Icon: PackageX,
          glow: 'shadow-purple-100',
        };
      case 'Closed':
        return {
          label: 'Closed',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/90',
          ring: 'ring-emerald-400',
          dot: 'bg-emerald-500',
          ping: 'bg-emerald-400',
          Icon: CheckCircle2,
          glow: 'shadow-emerald-100',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          ring: 'ring-slate-300',
          dot: 'bg-slate-400',
          ping: 'bg-slate-300',
          Icon: AlertCircle,
          glow: 'shadow-slate-100',
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.Icon;

  const statusOptions: TicketStatus[] = ['Open', 'On Progress', 'Pending Part', 'Closed'];

  const paddingClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-black'
      : 'px-2.5 py-1 text-[11px] font-extrabold';

  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Status Badge Button / Element */}
      <motion.div
        key={`badge-${status}-${flashKey}`}
        initial={{ scale: 0.88, opacity: 0, y: -2 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="relative inline-flex items-center"
      >
        {/* Animated Flash Wave Outer Ring on Status Change */}
        <AnimatePresence>
          <motion.span
            key={`flash-${flashKey}`}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`absolute inset-0 rounded-full border-2 ${config.ring} pointer-events-none`}
          />
        </AnimatePresence>

        <button
          type="button"
          disabled={!canEdit || loading}
          onClick={() => canEdit && setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-all duration-200 select-none ${
            config.bg
          } ${paddingClass} ${
            canEdit ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95' : 'cursor-default'
          }`}
          title={canEdit ? 'Klik untuk mengubah status tiket secara cepat' : `Status Tiket: ${status}`}
        >
          {/* Animated Status Indicator Dot / Pulse */}
          <span className="relative flex h-2 w-2 items-center justify-center">
            {status !== 'Closed' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.ping}`} />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
          </span>

          {/* Animated Icon & Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1"
            >
              {loading ? (
                <Loader2 className={`${iconSizeClass} animate-spin text-current`} />
              ) : (
                <StatusIcon className={`${iconSizeClass} shrink-0`} />
              )}
              <span className="tracking-tight whitespace-nowrap">{status}</span>
            </motion.div>
          </AnimatePresence>

          {/* Optional Dropdown Arrow Indicator for Editables */}
          {canEdit && showDropdownArrow && (
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 opacity-60 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
      </motion.div>

      {/* Quick Status Selector Dropdown Modal / Popup */}
      <AnimatePresence>
        {isOpen && canEdit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute left-0 z-50 mt-1 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-1 backdrop-blur-md"
          >
            <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 flex items-center justify-between">
              <span>Ubah Status</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>

            <div className="py-0.5 space-y-0.5">
              {statusOptions.map((st) => {
                const optionConfig = getStatusConfig(st);
                const OptionIcon = optionConfig.Icon;
                const isCurrent = st === status;

                return (
                  <button
                    key={st}
                    onClick={() => handleSelectStatus(st)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isCurrent
                        ? `${optionConfig.bg} shadow-2xs border font-extrabold`
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <OptionIcon className={`w-3.5 h-3.5 ${optionConfig.dot.replace('bg-', 'text-')}`} />
                      <span>{st}</span>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] bg-slate-900 text-white font-extrabold px-1.5 py-0.2 rounded-md">
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
