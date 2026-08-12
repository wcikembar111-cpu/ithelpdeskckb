import React from 'react';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Konfirmasi Action',
  message = 'Apakah Anda yakin?',
  type = 'warning',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fast-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden p-6 text-center">
        
        <div className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center ${
          type === 'danger'
            ? 'bg-red-50 text-red-600 border border-red-100'
            : type === 'warning'
            ? 'bg-amber-50 text-amber-600 border border-amber-100'
            : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {type === 'danger' ? (
            <AlertTriangle className="w-7 h-7" />
          ) : type === 'warning' ? (
            <HelpCircle className="w-7 h-7" />
          ) : (
            <Info className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 btn-fast cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-xs btn-fast cursor-pointer ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
