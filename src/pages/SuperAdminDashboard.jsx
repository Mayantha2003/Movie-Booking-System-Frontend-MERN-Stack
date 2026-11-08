import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRemote from "../hooks/useRemote";
import { getStats, getAdmins } from "../service/superAdmin";
import StatCard from "../components/dashboard/StatCard";
import Notice from "../components/dashboard/Notice";
import { formatDate, formatMoney, formatNumber, fullName, initialOf } from "../components/dashboard/format";
import AdminStatusBadge from "../components/superadmin/AdminStatusBadge";

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const stats = useRemote(getStats, "Could not load the system statistics.");
  const admins = useRemote(getAdmins, "Could not load the admin accounts.");

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const statsLoading = stats.status === "loading";
  const s = stats.data;
  const show = (value, format = formatNumber) => (s ? format(value) : "—");

  const list = admins.data ?? [];
  const blocked = list.filter((a) => a.user_status === "BLOCKED").length;
  const active = list.length - blocked;
  const activePct = list.length ? Math.round((active / list.length) * 100) : 0;
  const recent = list.slice(0, 5); // the API returns newest first

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const cards = [
    { title: "Total Admins", icon: "🛡️", value: show(s?.admins), hint: "Accounts with admin access", cls: "lg:col-span-2 2xl:col-span-1" },
    { title: "Total Users", icon: "👥", value: show(s?.users), hint: "Registered customers", cls: "lg:col-span-2 2xl:col-span-1" },
    { title: "Total Movies", icon: "🎬", value: show(s?.movies), hint: "Now showing and coming soon", cls: "lg:col-span-2 2xl:col-span-1" },
    { title: "Total Bookings", icon: "🎟️", value: show(s?.bookings), hint: "All bookings made", cls: "lg:col-span-3 2xl:col-span-1" },
    { title: "Total Revenue", icon: "💰", value: show(s?.revenue, formatMoney), hint: "Paid bookings only", cls: "sm:col-span-2 lg:col-span-3 2xl:col-span-1" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-600/15 via-[#111827] to-[#111827] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold">
              {(user?.firstName || user?.username || "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold">Welcome back, {user?.firstName || user?.username}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400">
                <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-semibold text-red-300 ring-1 ring-red-500/30">Super Admin</span>
                <span className="text-sm">{today}</span>
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/super-admin/admins"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500">
              Manage admins
            </Link>
            <button onClick={handleLogout} className="h-11 rounded-lg bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </section>

      {(stats.status === "error" || admins.status === "error") && (
        <Notice tone="error"
          action={
            <button type="button" className="shrink-0 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15"
              onClick={() => {
                if (stats.status === "error") stats.reload();
                if (admins.status === "error") admins.reload();
              }}>
              Retry
            </button>
          }>
          {stats.error || admins.error}
        </Notice>
      )}

      {/* Stats */}
      <section aria-label="System statistics" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-5">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} icon={c.icon} value={c.value} hint={c.hint} loading={statsLoading} className={c.cls} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System overview */}
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold">System Overview</h2>
          <p className="mt-1 text-sm text-gray-400">Health of the admin accounts.</p>

          {admins.status === "loading" ? (
            <div className="mt-6 space-y-3" aria-busy="true">
              <div className="h-3 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active admins</span>
                  <span className="font-semibold">{active} of {list.length}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`${activePct}% of admins are active`}>
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${activePct}%` }} />
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-400">Blocked admins</dt>
                  <dd className="font-semibold">{blocked}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-400">Newest admin</dt>
                  <dd className="truncate font-semibold">{recent[0] ? fullName(recent[0]) : "—"}</dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        {/* Recent admin activity */}
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Recent Admin Activity</h2>
              <p className="mt-1 text-sm text-gray-400">Newest admin accounts.</p>
            </div>
            <Link to="/super-admin/admins" className="text-sm font-semibold text-red-400 hover:text-red-300">View all</Link>
          </div>

          {admins.status === "loading" && (
            <div className="mt-5 space-y-3" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
            </div>
          )}

          {admins.status === "ready" && recent.length === 0 && (
            <p className="mt-6 text-sm text-gray-400">No admin accounts yet. Create the first one from Manage Admins.</p>
          )}

          {recent.length > 0 && (
            <ul className="mt-4 divide-y divide-white/10">
              {recent.map((a) => (
                <li key={a._id} className="flex items-center gap-3 py-3">
                  <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-red-600/90 text-sm font-bold">{initialOf(a)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{fullName(a)}</p>
                    <p className="truncate text-xs text-gray-400">@{a.username} · added {formatDate(a.createdAt)}</p>
                  </div>
                  <AdminStatusBadge status={a.user_status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}