import React, { useEffect } from 'react';
import { useStore } from '../store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useStore();

  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast?.visible, toast?.message, hideToast]);

  if (!toast || !toast.visible) return null;

  return (
    <div 
      className="fixed bottom-24 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-50 bg-white dark:bg-white text-slate-900 rounded-xl shadow-2xl border-l-[5px] border-emerald-500 px-4 py-3.5 max-w-sm flex items-center justify-between gap-3 animate-slide-up border border-slate-200/50"
      style={{ boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)' }}
    >
      <div className="flex items-center gap-3">
        {toast.type === 'success' && (
          <div className="text-emerald-500 shrink-0">
            <CheckCircle2 size={20} className="stroke-[2.5]" />
          </div>
        )}
        {toast.type === 'error' && (
          <div className="text-rose-500 shrink-0">
            <AlertCircle size={20} className="stroke-[2.5]" />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="text-cyan-500 shrink-0">
            <Info size={20} className="stroke-[2.5]" />
          </div>
        )}
        <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-800 antialiased select-text">
          {toast.message}
        </span>
      </div>

      <button
        onClick={hideToast}
        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all shrink-0 cursor-pointer"
        title="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
};
