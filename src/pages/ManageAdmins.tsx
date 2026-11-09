import { useEffect, useMemo, useState } from "react";
import useRemote from "../hooks/useRemote";
import { getAdmins, setAdminStatus, deleteAdmin } from "../service/superAdmin";
import { getErrorMessage } from "../service/errorMessage";
import DataTable, { type ColumnDef, RowButton } from "../components/dashboard/DataTable";
import ConfirmDialog from "../components/dashboard/ConfirmDialog";
import Notice from "../components/dashboard/Notice";
import { formatDate, fullName, initialOf } from "../components/dashboard/format";
import AdminStatusBadge from "../components/superadmin/AdminStatusBadge";
import CreateAdminModal from "../components/superadmin/CreateAdminModal";
import AdminDetailsModal from "../components/superadmin/AdminDetailsModal";
import type { AdminUser, UserStatus } from "../types/api";

const columns: ColumnDef<AdminUser>[] = [
  {
    key: "admin", header: "Admin",
    render: (a: AdminUser) => (
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-red-600/90 text-sm font-bold text-white">{initialOf(a)}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{fullName(a)}</p>
          <p className="truncate text-xs text-gray-400">@{a.username}</p>
        </div>
      </div>
    ),
  },
  { key: "email", header: "Email", render: (a: AdminUser) => a.email || "—", className: "max-w-[220px] truncate" },
  { key: "status", header: "Status", render: (a: AdminUser) => <AdminStatusBadge status={a.user_status} /> },
  { key: "created", header: "Created", render: (a: AdminUser) => formatDate(a.createdAt), className: "whitespace-nowrap text-gray-400" },
];

export default function ManageAdmins() {
  const { status, data, error, reload, mutate } = useRemote(getAdmins, "Could not load the admin accounts.");

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [confirm, setConfirm] = useState<{ type: "block" | "unblock" | "delete"; admin: AdminUser } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (notice?.tone !== "success") return undefined;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const admins = useMemo<AdminUser[]>(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a: AdminUser) => [fullName(a), a.username, a.email ?? ""].some((v) => String(v).toLowerCase().includes(q)));
  }, [admins, search]);

  const handleCreated = (message: string) => {
    setCreating(false);
    setNotice({ tone: "success", text: message });
    reload();
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    const { type, admin } = confirm;
    setBusyId(admin._id);
    try {
      if (type === "delete") {
        const res = await deleteAdmin(admin._id);
        mutate((list: AdminUser[] = []) => list.filter((a) => a._id !== admin._id));
        setNotice({ tone: "success", text: res.message || "Admin deleted successfully!" });
      } else {
        const res = await setAdminStatus(admin._id, type === "block" ? "BLOCKED" : "ACTIVE");
        mutate((list: AdminUser[] = []) => list.map((a) => (a._id === admin._id ? { ...a, ...res.data } : a)));
        setNotice({ tone: "success", text: res.message || "Admin status updated." });
      }
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err, "That action failed. Please try again.") });
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const copy = confirm
    ? {
        block: {
          title: "Block this admin?",
          message: `${fullName(confirm.admin)} will no longer be able to sign in. An active session ends when its access token expires (within about 30 minutes).`,
          label: "Block admin",
          tone: "warn" as const,
        },
        unblock: {
          title: "Unblock this admin?",
          message: `${fullName(confirm.admin)} will be able to sign in to the Admin Portal again.`,
          label: "Unblock admin",
          tone: "ok" as const,
        },
        delete: {
          title: "Delete this admin?",
          message: `${fullName(confirm.admin)} will be permanently removed. This cannot be undone.`,
          label: "Delete admin",
          tone: "danger" as const,
        },
      }[confirm.type]
    : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Admins</h1>
          <p className="mt-2 text-gray-400">Create admin accounts and control who can access the Admin Portal.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)}
          className="h-11 w-full rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 sm:w-auto">
          + Create admin
        </button>
      </div>

      {notice && (
        <div className="mb-6">
          <Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">Admin accounts</h2>
            <p className="mt-1 text-sm text-gray-400">
              {status === "ready" ? `${admins.length} ${admins.length === 1 ? "admin" : "admins"} in total` : "Loading accounts…"}
            </p>
          </div>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username or email" aria-label="Search admins"
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0f19] px-3.5 text-sm text-white placeholder:text-gray-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 sm:w-72" />
        </div>

        <DataTable
          columns={columns} rows={filtered} status={status} error={error} onRetry={reload}
          filtered={Boolean(search.trim())}
          emptyTitle="No admin accounts yet" emptyText="Use “Create admin” to add the first one."
          actions={(a) => {
            const blocked = a.user_status === "BLOCKED";
            const busy = busyId === a._id;
            return (
              <>
                <RowButton onClick={() => setViewing(a)} disabled={busy}>View</RowButton>
                <RowButton tone={blocked ? "ok" : "warn"} disabled={busy}
                  onClick={() => setConfirm({ type: blocked ? "unblock" : "block", admin: a })}>
                  {blocked ? "Unblock" : "Block"}
                </RowButton>
                <RowButton tone="danger" disabled={busy} onClick={() => setConfirm({ type: "delete", admin: a })}>Delete</RowButton>
              </>
            );
          }}
        />
      </section>

      {creating && <CreateAdminModal onClose={() => setCreating(false)} onCreated={handleCreated} />}
      {viewing && <AdminDetailsModal admin={viewing} onClose={() => setViewing(null)} />}
      {confirm && copy && (
        <ConfirmDialog title={copy.title} message={copy.message} confirmLabel={copy.label} tone={copy.tone}
          busy={busyId === confirm.admin._id} onConfirm={runConfirmed} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}