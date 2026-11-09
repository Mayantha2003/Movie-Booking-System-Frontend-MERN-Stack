import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: string;
  dismissible?: boolean;
}

// Dark dialog. Closes with Escape or a click on the backdrop, locks page scroll
// while open, and slides up from the bottom on phones.
export default function Modal({ title, description, onClose, children, size = "max-w-lg", dismissible = true }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<() => void>(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) closeRef.current();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [dismissible]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#111827] text-white shadow-2xl outline-none sm:rounded-2xl ${size}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#111827] px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
          {dismissible && (
            <button type="button" onClick={onClose} aria-label="Close"
              className="-mr-2 grid size-9 shrink-0 place-items-center rounded-lg text-xl text-gray-400 transition hover:bg-white/10 hover:text-white">
              ×
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}