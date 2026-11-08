import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import Modal from "../../components/dashboard/Modal";
import { formatDate, formatMoney, fullName, initialOf } from "../../components/dashboard/format";
import { getUsers, userApi } from "../../service/admin";

const PHONE = /^\+?[0-9\s-]{7,15}$/;

const fields = [
  { name: "first_name", label: "First name", type: "text", required: true, half: true },
  { name: "last_name", label: "Last name", type: "text", required: true, half: true },
  { name: "username", label: "Username", type: "text", required: true, half: true, lockOnEdit: true, hint: "At least 3 characters. Cannot be changed later." },
  { name: "email", label: "Email", type: "email", half: true },
  { name: "phone", label: "Phone", type: "tel", half: true, placeholder: "+94 77 123 4567" },
  { name: "password", label: "Password", type: "password", required: true, half: true, createOnly: true, hint: "At least 8 characters." },
];

const StatusBadge = ({ status }) =>
  status === "BLOCKED" ? <Badge tone="red">Blocked</Badge>
  : status === "INACTIVE" ? <Badge tone="gray">Inactive</Badge>
  : <Badge tone="green">Active</Badge>;

const columns = [
  {
    key: "user", header: "User",
    render: (u) => (
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-red-600/90 text-sm font-bold text-white">{initialOf(u)}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{fullName(u)}</p>
          <p className="truncate text-xs text-gray-400">@{u.username}</p>
        </div>
      </div>
    ),
  },
  {
    key: "contact", header: "Contact",
    render: (u) => (
      <div className="min-w-0">
        <p className="truncate">{u.email || "—"}</p>
        <p className="truncate text-xs text-gray-500">{u.phone || "No phone"}</p>
      </div>
    ),
  },
  {
    key: "bookings", header: "Bookings", className: "whitespace-nowrap",
    render: (u) => `${u.bookingCount ?? 0} · ${formatMoney(u.totalSpent)}`,
  },
  { key: "status", header: "Status", render: (u) => <StatusBadge status={u.user_status} /> },
  { key: "joined", header: "Joined", render: (u) => formatDate(u.createdAt), className: "whitespace-nowrap text-gray-400" },
];

const Row = ({ label, children }) => (
  <div className="grid gap-1 border-b border-white/10 py-3 last:border-b-0 sm:grid-cols-[130px_1fr] sm:gap-4">
    <dt className="text-sm text-gray-400">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-white">{children}</dd>
  </div>
);

const renderView = (u, close) => (
  <Modal title="User details" onClose={close}>
    <div className="mb-4 flex items-center gap-4">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold">{initialOf(u)}</span>
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">{fullName(u)}</p>
        <p className="truncate text-sm text-gray-400">@{u.username}</p>
      </div>
    </div>
    <dl>
      <Row label="Status"><StatusBadge status={u.user_status} /></Row>
      <Row label="Email">{u.email || <span className="text-gray-500">Not provided</span>}</Row>
      <Row label="Phone">{u.phone || <span className="text-gray-500">Not provided</span>}</Row>
      <Row label="Bookings">{u.bookingCount ?? 0}</Row>
      <Row label="Total paid">{formatMoney(u.totalSpent)}</Row>
      <Row label="Joined">{formatDate(u.createdAt)}</Row>
      <Row label="Last updated">{formatDate(u.updatedAt)}</Row>
    </dl>
    <div className="mt-5 flex justify-end">
      <button type="button" onClick={close}
        className="h-11 rounded-lg border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/10">
        Close
      </button>
    </div>
  </Modal>
);

const validate = (v, editing) => {
  const errors = {};
  if (v.username.trim().length < 3) errors.username = "Username must be at least 3 characters.";
  if (v.phone.trim() && !PHONE.test(v.phone.trim())) errors.phone = "Enter a valid phone number.";
  if (!editing && v.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
};

export default function Users() {
  return (
    <CrudPage
      title="Users" subtitle="Customer accounts. View details, edit, block or remove them."
      noun="User" plural="users"
      fetcher={getUsers} api={userApi}
      columns={columns} fields={fields} validate={validate} renderView={renderView}
      searchText={(u) => [fullName(u), u.username, u.email, u.phone].join(" ")}
      rowName={(u) => fullName(u)}
      toggle={{
        isOn: (u) => u.user_status !== "BLOCKED",
        onLabel: "Unblock", offLabel: "Block",
        run: (u) => userApi.setStatus(u._id, u.user_status === "BLOCKED" ? "ACTIVE" : "BLOCKED"),
      }}
      summary={(rows) => `${rows.filter((u) => u.user_status === "BLOCKED").length} blocked · ${rows.length} in total`}
      deleteNote="Their past bookings are kept."
    />
  );
}