import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners: Set<() => void> = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb());
  });
}

export const triggerPWAInstall = async (onIOSClick?: () => void) => {
  if (globalDeferredPrompt) {
    globalDeferredPrompt.prompt();
    const { outcome } = await globalDeferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User installed the app');
      globalDeferredPrompt = null;
      listeners.forEach((cb) => cb());
    }
  } else {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice && onIOSClick) {
      onIOSClick();
    } else {
      alert('Aplikasi siap diinstall. Jika opsi install tidak muncul, buka menu browser (titik tiga / opsi) lalu pilih "Tambahkan ke Layar Utama" (Add to Home Screen).');
    }
  }
};

export const PWAInstallButton: React.FC<{ variant?: 'topbar' | 'sidebar' | 'inline' }> = ({ variant = 'sidebar' }) => {
  const [hasPrompt, setHasPrompt] = useState(!!globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isInStandaloneMode);
    };

    checkStandalone();

    const handleChange = () => setHasPrompt(!!globalDeferredPrompt);
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  if (isStandalone) {
    if (variant === 'topbar') {
      return (
        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>PWA Active</span>
        </span>
      );
    }
    return (
      <div className="mx-3 my-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-emerald-800 text-xs font-extrabold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="truncate">Terinstall di Perangkat</span>
      </div>
    );
  }

  const handleClick = () => {
    triggerPWAInstall(() => setShowIOSModal(true));
  };

  if (variant === 'topbar') {
    return (
      <>
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-sm hover:shadow-md transition cursor-pointer active:scale-95 shrink-0"
          title="Install Aplikasi IT Helpdesk di HP / Komputer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install PWA</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSModal && <IOSModal onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md border border-orange-400/50 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h5 className="text-xs font-black leading-tight">Install Aplikasi PWA</h5>
            <p className="text-[10px] text-orange-100 font-medium">Akses cepat & tanpa browser</p>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-orange-50 active:scale-98 text-orange-700 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-orange-600" />
          <span>Install Sekarang</span>
        </button>
      </div>

      {showIOSModal && <IOSModal onClose={() => setShowIOSModal(false)} />}
    </>
  );
};

const IOSModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl animate-scale-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-extrabold text-white">Cara Install di iPhone / iPad</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        Untuk menginstal aplikasi Kino IT Helpdesk ke layar utama iPhone/iPad Anda:
      </p>

      <div className="space-y-3 mb-6 text-xs text-slate-200">
        <div className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-2xl">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
          <div>
            Ketuk tombol <span className="font-bold text-orange-400 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Bagikan (Share)</span> di Safari.
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-2xl">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
          <div>
            Pilih <span className="font-bold text-white">"Tambahkan ke Layar Utama" (Add to Home Screen)</span>.
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-2xl">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
          <div>
            Ketuk <span className="font-bold text-emerald-400">"Tambah" (Add)</span> di pojok kanan atas.
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs rounded-2xl text-white transition cursor-pointer"
      >
        Saya Mengerti
      </button>
    </div>
  </div>
);

export const PWAInstallPrompt: React.FC = () => {
  return null;
};

