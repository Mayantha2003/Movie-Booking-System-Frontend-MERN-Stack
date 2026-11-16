import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import useAuth from "../hooks/useAuth";
import useRemote from "../hooks/useRemote";
import { getAdminAnalytics, getAdminStats } from "../service/admin";
import StatCard from "../components/dashboard/StatCard";
import Badge from "../components/dashboard/Badge";
import Notice from "../components/dashboard/Notice";
import {
  formatDate,
  formatMoney,
  formatNumber,
} from "../components/dashboard/format";
import type {
  AdminAnalytics,
  Booking,
} from "../types/api";

const PAYMENT_TONE: Record<
  Booking["paymentStatus"],
  "green" | "amber" | "red" | "blue" | "gray"
> = {
  Paid: "green",
  Pending: "amber",
  Failed: "red",
  Cancelled: "gray",
  Refunded: "blue",
};

const QUICK = [
  { to: "/admin/movies", label: "Add a movie", icon: "🎬" },
  { to: "/admin/showtimes", label: "Schedule a showtime", icon: "🕒" },
  { to: "/admin/offers", label: "Create an offer", icon: "🎁" },
  { to: "/admin/bookings", label: "View bookings", icon: "🎟️" },
];

const CHART_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
];

const todayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const daysAgoString = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const who = (b: Booking): string => {
  if (typeof b.user === "string" || !b.user) {
    return b.guestInfo?.name || "Guest";
  }

  return (
    [b.user.first_name, b.user.last_name].filter(Boolean).join(" ") ||
    "Guest"
  );
};

const chartDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
    <h2 className="mb-5 text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

const EmptyChart = () => (
  <div className="flex h-full min-h-[250px] items-center justify-center text-sm text-gray-400">
    No data available for this period.
  </div>
);

export default function AdminDashboard() {
  const { user } = useAuth();

  const {
    status,
    data,
    error,
    reload,
  } = useRemote(getAdminStats, "Could not load the dashboard.");

  const [from, setFrom] = useState(() => daysAgoString(29));
  const [to, setTo] = useState(() => todayString());

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [appliedFrom, setAppliedFrom] = useState(from);
  const [appliedTo, setAppliedTo] = useState(to);

  const loading = status === "loading";
  const recent: Booking[] = data?.recentBookings ?? [];

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const response = await getAdminAnalytics(appliedFrom, appliedTo);

        if (active) {
          setAnalytics(response.data);
        }
      } catch (err) {
        if (active) {
          setAnalyticsError(
            err instanceof Error
              ? err.message
              : "Could not load analytics."
          );
        }
      } finally {
        if (active) {
          setAnalyticsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [appliedFrom, appliedTo]);

  const show = (value?: number, format = formatNumber) =>
    data ? format(value ?? 0) : "—";

  const stats = [
    {
      title: "Total Movies",
      value: show(data?.movies),
      icon: "🎬",
      hint: "Now showing and coming soon",
    },
    {
      title: "Total Bookings",
      value: show(data?.bookings),
      icon: "🎟️",
      hint: "All bookings made",
    },
    {
      title: "Total Users",
      value: show(data?.users),
      icon: "👥",
      hint: "Registered customers",
    },
    {
      title: "Total Revenue",
      value: show(data?.revenue, formatMoney),
      icon: "💰",
      hint: "Paid bookings only",
    },
  ];

  const summary = analytics?.summary;

  const handleApplyFilter = () => {
    if (!from || !to) {
      setAnalyticsError("Please select both dates.");
      return;
    }

    if (from > to) {
      setAnalyticsError("Start date cannot be after end date.");
      return;
    }

    setAppliedFrom(from);
    setAppliedTo(to);
  };

  const handleLast7Days = () => {
    const end = todayString();
    const start = daysAgoString(6);

    setFrom(start);
    setTo(end);
    setAppliedFrom(start);
    setAppliedTo(end);
  };

  const handleLast30Days = () => {
    const end = todayString();
    const start = daysAgoString(29);

    setFrom(start);
    setTo(end);
    setAppliedFrom(start);
    setAppliedTo(end);
  };

  const bookingStatusData = analytics?.bookingStatuses ?? [];
  const paymentStatusData = analytics?.paymentStatuses ?? [];
  const revenueData = analytics?.revenueTrend ?? [];
  const popularMovies = analytics?.popularMovies ?? [];

  return (
    <div>
      {/* Dashboard heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>

        <p className="mt-2 text-gray-400">
          Welcome back
          {user?.firstName ? `, ${user.firstName}` : ""}. Here is how your
          cinema is doing.
        </p>
      </div>

      {/* Main dashboard error */}
      {status === "error" && (
        <div className="mb-6">
          <Notice
            tone="error"
            action={
              <button
                type="button"
                onClick={reload}
                className="shrink-0 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15"
              >
                Retry
              </button>
            }
          >
            {error}
          </Notice>
        </div>
      )}

      {/* Existing stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      {/* Advanced Analytics */}
      <div className="mt-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
            <p className="mt-1 text-sm text-gray-400">
              Monitor cinema performance and revenue.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLast7Days}
              className="rounded-lg border border-white/10 bg-[#111827] px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10"
            >
              Last 7 days
            </button>

            <button
              type="button"
              onClick={handleLast30Days}
              className="rounded-lg border border-white/10 bg-[#111827] px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10"
            >
              Last 30 days
            </button>
          </div>
        </div>

        {/* Date filters */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-[#111827] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label
                htmlFor="analytics-from"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                From date
              </label>

              <input
                id="analytics-from"
                type="date"
                value={from}
                max={to}
                onChange={(event) => setFrom(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1f2937] px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="analytics-to"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                To date
              </label>

              <input
                id="analytics-to"
                type="date"
                value={to}
                min={from}
                max={todayString()}
                onChange={(event) => setTo(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1f2937] px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyFilter}
              disabled={analyticsLoading}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Filter
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Selected period: {appliedFrom} to {appliedTo}
          </p>
        </section>

        {analyticsError && (
          <div className="mb-6">
            <Notice tone="error">{analyticsError}</Notice>
          </div>
        )}

        {/* Analytics summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Period Revenue",
              value: formatMoney(summary?.revenue ?? 0),
              icon: "💰",
              color: "text-green-400",
            },
            {
              title: "Paid Bookings",
              value: formatNumber(summary?.paidBookings ?? 0),
              icon: "✅",
              color: "text-blue-400",
            },
            {
              title: "Tickets Sold",
              value: formatNumber(summary?.ticketsSold ?? 0),
              icon: "🎟️",
              color: "text-purple-400",
            },
            {
              title: "Failed Payments",
              value: formatNumber(summary?.failedPayments ?? 0),
              icon: "⚠️",
              color: "text-red-400",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#111827] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{item.title}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>

              <p className={`mt-3 text-2xl font-bold ${item.color}`}>
                {analyticsLoading ? "..." : item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue trend chart */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Daily Revenue Trend">
            <div className="h-[300px] w-full">
              {analyticsLoading ? (
                <EmptyChart />
              ) : revenueData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={chartDate}
                      stroke="#9ca3af"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value: number) =>
                        value.toLocaleString()
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                      labelFormatter={(value) =>
                        chartDate(String(value))
                      }
                      formatter={(value) => [
                        formatMoney(Number(value)),
                        "Revenue",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#ef4444" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          {/* Daily bookings chart */}
          <ChartCard title="Daily Bookings">
            <div className="h-[300px] w-full">
              {analyticsLoading ? (
                <EmptyChart />
              ) : revenueData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={chartDate}
                      stroke="#9ca3af"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#9ca3af"
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                      labelFormatter={(value) =>
                        chartDate(String(value))
                      }
                    />

                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="#3b82f6"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Popular movies */}
        <div className="mt-6">
          <ChartCard title="Top 5 Popular Movies">
            <div className="h-[320px] w-full">
              {analyticsLoading ? (
                <EmptyChart />
              ) : popularMovies.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularMovies}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 25,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      stroke="#9ca3af"
                    />

                    <YAxis
                      type="category"
                      dataKey="title"
                      width={120}
                      stroke="#9ca3af"
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="#a855f7"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Booking and payment status */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Booking Status">
            <div className="h-[300px] w-full">
              {analyticsLoading ? (
                <EmptyChart />
              ) : bookingStatusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label={({ name, value }) =>
                        `${name}: ${value}`
                      }
                    >
                      {bookingStatusData.map((item, index) => (
                        <Cell
                          key={item.status}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Payment Status">
            <div className="h-[300px] w-full">
              {analyticsLoading ? (
                <EmptyChart />
              ) : paymentStatusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label={({ name, value }) =>
                        `${name}: ${value}`
                      }
                    >
                      {paymentStatusData.map((item, index) => (
                        <Cell
                          key={item.status}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Existing Recent Bookings and Quick Actions */}
      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>

            <Link
              to="/admin/bookings"
              className="text-sm font-semibold text-red-400 hover:text-red-300"
            >
              View all
            </Link>
          </div>

          {loading && (
            <div className="mt-5 space-y-3" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          )}

          {status === "ready" && recent.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">
              No bookings yet. They will appear here as customers book
              tickets.
            </p>
          )}

          {recent.length > 0 && (
            <ul className="mt-4 divide-y divide-white/10">
              {recent.map((booking) => (
                <li
                  key={booking._id}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {booking.movie?.title ?? "Deleted movie"}
                    </p>

                    <p className="truncate text-xs text-gray-400">
                      <span className="font-mono">
                        {booking.bookingCode}
                      </span>{" "}
                      · {who(booking)} ·{" "}
                      {formatDate(booking.bookedAt || booking.createdAt)}
                    </p>
                  </div>

                  <div className="hidden text-right text-sm font-semibold sm:block">
                    {formatMoney(booking.finalAmount)}
                  </div>

                  <Badge tone={PAYMENT_TONE[booking.paymentStatus]}>
                    {booking.paymentStatus}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold">Quick actions</h2>

          <ul className="mt-4 space-y-2">
            {QUICK.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}