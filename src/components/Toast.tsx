import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Fixed Toast Container */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 ${
              t.type === 'error'
                ? 'bg-rose-900 text-[#FFFFFF] border-rose-700'
                : 'bg-[#2D5016] text-[#FFFFFF] border-[#2D5016]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'error' ? (
                <AlertTriangle className="w-4.5 h-4.5 text-rose-300 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4.5 h-4.5 text-[#D97706] shrink-0" />
              )}
              <span>{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-[#FFFFFF]/80 hover:text-[#FFFFFF] p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
