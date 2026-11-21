import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (title: string, options?: { description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, options?: { description?: string; tone?: ToastTone }) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const tone = options?.tone ?? 'success';
      setToasts((prev) => [...prev.slice(-2), { id, title, description: options?.description, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon =
              toast.tone === 'error'
                ? AlertCircle
                : toast.tone === 'info'
                  ? Info
                  : CheckCircle2;
            const iconColor =
              toast.tone === 'error'
                ? 'text-rose-400'
                : toast.tone === 'info'
                  ? 'text-[#22D3EE]'
                  : 'text-emerald-400';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-violet-400/30 bg-[#161046]/95 px-4 py-3.5 shadow-[0_16px_40px_-12px_rgba(79,70,229,0.55)] backdrop-blur-xl"
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-0.5 text-xs text-[#C7CEEA] leading-relaxed">{toast.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
