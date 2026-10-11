import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/95 text-emerald-950',
    error: 'border-rose-200 bg-rose-50/95 text-rose-950',
    info: 'border-blue-200 bg-blue-50/95 text-blue-950',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-200 ${borders[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div>
          <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
          {toast.message && <p className="text-xs mt-1 text-slate-700 opacity-90">{toast.message}</p>}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
