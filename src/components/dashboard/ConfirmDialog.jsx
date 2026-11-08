import Modal from "./Modal";

const CONFIRM_STYLES = {
  danger: "bg-rose-600 hover:bg-rose-500",
  warn: "bg-amber-600 hover:bg-amber-500",
  ok: "bg-emerald-600 hover:bg-emerald-500",
};

export default function ConfirmDialog({ title, message, confirmLabel, tone = "danger", busy = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} size="max-w-md" dismissible={!busy}>
      <p className="text-sm leading-relaxed text-gray-300">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={busy}
          className="h-11 rounded-lg border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${CONFIRM_STYLES[tone]}`}>
          {busy && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}