import Modal from "../dashboard/Modal";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatDate, fullName, initialOf } from "../dashboard/format";

const Row = ({ label, children }) => (
  <div className="grid gap-1 border-b border-white/10 py-3 last:border-b-0 sm:grid-cols-[130px_1fr] sm:gap-4">
    <dt className="text-sm text-gray-400">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-white">{children}</dd>
  </div>
);

export default function AdminDetailsModal({ admin, onClose }) {
  return (
    <Modal title="Admin details" onClose={onClose}>
      <div className="mb-4 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold">{initialOf(admin)}</span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{fullName(admin)}</p>
          <p className="truncate text-sm text-gray-400">@{admin.username}</p>
        </div>
      </div>
      <dl>
        <Row label="Status"><AdminStatusBadge status={admin.user_status} /></Row>
        <Row label="Role">Admin</Row>
        <Row label="Email">{admin.email || <span className="text-gray-500">Not provided</span>}</Row>
        <Row label="Phone">{admin.phone || <span className="text-gray-500">Not provided</span>}</Row>
        <Row label="Created">{formatDate(admin.createdAt)}</Row>
        <Row label="Last updated">{formatDate(admin.updatedAt)}</Row>
      </dl>
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={onClose}
          className="h-11 rounded-lg border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/10">
          Close
        </button>
      </div>
    </Modal>
  );
}