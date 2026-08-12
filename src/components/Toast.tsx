import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  linkUrl?: string;
  linkLabel?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 animate-in slide-in-from-top-5 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : toast.type === 'danger'
              ? 'bg-red-600 text-white border-red-500'
              : toast.type === 'warning'
              ? 'bg-amber-500 text-slate-900 border-amber-400 font-semibold'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-white" />}
            {toast.type === 'danger' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-white" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-slate-900" />}
            {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />}

            <div className="flex-1">
              <span>{toast.text}</span>
              {toast.linkUrl && (
                <a
                  href={toast.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
                >
                  {toast.linkLabel || 'Buka WA Hotline'}
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => onClose(toast.id)}
            className="p-1 rounded-lg hover:bg-black/10 transition shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
