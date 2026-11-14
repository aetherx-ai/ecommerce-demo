import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useBazarioToasts } from '../../contexts/BazarioContext';

export const ToastContainer: React.FC = React.memo(() => {
  const toasts = useBazarioToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-5 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto bg-[#172337] text-white px-4 py-2.5 rounded-lg shadow-lg border border-white/10 text-xs font-medium flex items-center gap-2 max-w-xs animate-[fadeIn_160ms_ease-out]"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-[#60A5FA] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';
