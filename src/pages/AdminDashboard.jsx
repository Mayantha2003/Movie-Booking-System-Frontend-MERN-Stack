import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRemote from "../hooks/useRemote";
import { getAdminStats } from "../service/admin";
import StatCard from "../components/dashboard/StatCard";
import Badge from "../components/dashboard/Badge";
import Notice from "../components/dashboard/Notice";
import { formatDate, formatMoney, formatNumber } from "../components/dashboard/format";

const PAYMENT_TONE = { Paid: "green", Pending: "amber", Failed: "red", Refunded: "blue" };

const QUICK = [
  { to: "/admin/movies", label: "Add a movie", icon: "🎬" },
  { to: "/admin/showtimes", label: "Schedule a showtime", icon: "🕒" },
  { to: "/admin/offers", label: "Create an offer", icon: "🎁" },
  { to: "/admin/bookings", label: "View bookings", icon: "🎟️" },
];

const who = (b) =>
  b.user ? [b.user.first_name, b.user.last_name].filter(Boolean).join(" ") : b.guestInfo?.name || "Guest";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { status, data, error, reload } = useRemote(getAdminStats, "Could not load the dashboard.");

  const loading = status === "loading";
  const show = (value, format = formatNumber) => (data ? format(value) : "—");
  const recent = data?.recentBookings ?? [];

  const stats = [
    { title: "Total Movies", value: show(data?.movies), icon: "🎬", hint: "Now showing and coming soon" },
    { title: "Total Bookings", value: show(data?.bookings), icon: "🎟️", hint: "All bookings made" },
    { title: "Total Users", value: show(data?.users), icon: "👥", hint: "Registered customers" },
    { title: "Total Revenue", value: show(data?.revenue, formatMoney), icon: "💰", hint: "Paid bookings only" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="mt-2 text-gray-400">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}. Here is how your cinema is doing.
        </p>
      </div>

      {status === "error" && (
        <div className="mb-6">
          <Notice tone="error"
            action={<button type="button" onClick={reload} className="shrink-0 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15">Retry</button>}>
            {error}
          </Notice>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} loading={loading} />)}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm font-semibold text-red-400 hover:text-red-300">View all</Link>
          </div>

          {loading && (
            <div className="mt-5 space-y-3" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
            </div>
          )}

          {status === "ready" && recent.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No bookings yet. They will appear here as customers book tickets.</p>
          )}

          {recent.length > 0 && (
            <ul className="mt-4 divide-y divide-white/10">
              {recent.map((b) => (
                <li key={b._id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.movie?.title ?? "Deleted movie"}</p>
                    <p className="truncate text-xs text-gray-400">
                      <span className="font-mono">{b.bookingCode}</span> · {who(b)} · {formatDate(b.bookedAt || b.createdAt)}
                    </p>
                  </div>
                  <div className="hidden text-right text-sm font-semibold sm:block">{formatMoney(b.finalAmount)}</div>
                  <Badge tone={PAYMENT_TONE[b.paymentStatus]}>{b.paymentStatus}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <ul className="mt-4 space-y-2">
            {QUICK.map((q) => (
              <li key={q.to}>
                <Link to={q.to} className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white">
                  <span aria-hidden="true">{q.icon}</span>{q.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}