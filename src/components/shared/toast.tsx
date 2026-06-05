"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (opts: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
      timers.current.set(id, setTimeout(() => dismiss(id), 4000));
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 md:right-6">
        {toasts.map((t) => (
          <div
            className="pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
            key={t.id}
          >
            <ToastItem onDismiss={dismiss} toast={t} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const icons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const containerStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-stone-200 bg-white text-stone-900",
};

const iconStyles: Record<ToastVariant, string> = {
  success: "text-emerald-600",
  error: "text-red-500",
  info: "text-brand",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = icons[toast.variant];
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-md ${containerStyles[toast.variant]}`}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${iconStyles[toast.variant]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs opacity-70">{toast.description}</p>
        ) : null}
      </div>
      <button
        className="ml-1 shrink-0 opacity-40 transition hover:opacity-80"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
