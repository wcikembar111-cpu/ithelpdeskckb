import React from 'react';
import { TicketType } from '../types';
import { Zap, AlertTriangle, FileText, ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  type?: TicketType | string;
  priority?: 'High' | 'Medium' | 'Low' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  type = 'Request',
  priority,
  size = 'md'
}) => {
  // Determine if high priority based on type or priority parameter
  const isHigh = priority === 'High' || type?.toLowerCase() === 'incident';
  const isMedium = priority === 'Medium' || (!isHigh && type?.toLowerCase() === 'request');

  const paddingClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3 py-1 text-xs font-black'
      : 'px-2.5 py-0.5 text-[11px] font-extrabold';

  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  if (isHigh) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-rose-100/90 text-rose-800 border border-rose-300/80 font-bold tracking-tight shadow-2xs ${paddingClass}`}
        title="Prioritas Tinggi / Incident"
      >
        <Flame className={`${iconSizeClass} text-rose-600 animate-pulse shrink-0`} />
        <span>Incident (Tinggi)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 font-bold tracking-tight shadow-2xs ${paddingClass}`}
      title="Prioritas Normal / Request"
    >
      <FileText className={`${iconSizeClass} text-blue-600 shrink-0`} />
      <span>Request (Normal)</span>
    </span>
  );
};
