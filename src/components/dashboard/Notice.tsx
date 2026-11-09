import type { ReactNode } from "react";

const TONES = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
} as const;

type NoticeTone = keyof typeof TONES;

interface NoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
}

// Success / error message with an optional close button and action.
export default function Notice({ tone = "success", children, onClose, action }: NoticeProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      <span aria-hidden="true" className="mt-0.5">{tone === "error" ? "⚠️" : "✅"}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {action}
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss message"
          className="-mr-1 rounded-md px-1.5 text-lg leading-none opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}