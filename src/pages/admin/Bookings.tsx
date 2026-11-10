import { useMemo, useState, type ReactNode } from "react";
import useRemote from "../../hooks/useRemote";
import { getBookings } from "../../service/admin";
import DataTable, { type ColumnDef, RowButton } from "../../components/dashboard/DataTable";
import Badge from "../../components/dashboard/Badge";
import Modal from "../../components/dashboard/Modal";
import StatCard from "../../components/dashboard/StatCard";
import { formatDate, formatMoney, formatNumber, formatTime } from "../../components/dashboard/format";
import type { Booking, BookingStatus, PaymentStatus } from "../../types/api";

const PAYMENT_TONE: Record<PaymentStatus, "green" | "amber" | "red" | "blue" | "gray"> = {
  Paid: "green",
  Pending: "amber",
  Failed: "red",
  Cancelled: "gray",
  Refunded: "blue",
};
const STATUS_TONE: Record<BookingStatus, "green" | "blue" | "gray" | "amber"> = {
  Pending: "amber",
  Confirmed: "green",
  Completed: "blue",
  Cancelled: "gray",
};

const customerOf = (b: Booking) => {
  if (b.user && typeof b.user !== "string") {
    return { name: [b.user.first_name, b.user.last_name].filter(Boolean).join(" ") || "Customer", email: b.user.email, guest: false };
  }
  return { name: b.guestInfo?.name || "Guest", email: b.guestInfo?.email, phone: b.guestInfo?.phone, guest: true };
};

const seatsOf = (b: Booking) => (b.seats ?? []).map((s) => s.seatId).join(", ") || "—";

const columns: ColumnDef<Booking>[] = [
  {
    key: "code", header: "Booking",
    render: (b: Booking) => (
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold text-white">{b.bookingCode}</p>
        <p className="text-xs text-gray-400">{formatDate(b.bookedAt || b.createdAt)}</p>
      </div>
    ),
  },
  {
    key: "customer", header: "Customer",
    render: (b: Booking) => {
      const c = customerOf(b);
      return (
        <div className="min-w-0">
          <p className="truncate">{c.name}{c.guest && <span className="ml-2 text-xs text-gray-500">Guest</span>}</p>
          <p className="truncate text-xs text-gray-500">{c.email || "—"}</p>
        </div>
      );
    },
  },
  {
    key: "movie", header: "Movie",
    render: (b: Booking) => (
      <div className="min-w-0">
        <p className="truncate">{b.movie?.title ?? "Deleted movie"}</p>
        <p className="truncate text-xs text-gray-500">{b.cinema?.name ?? "—"}</p>
      </div>
    ),
  },
  { key: "seats", header: "Seats", render: (b: Booking) => `${b.totalSeats} · ${seatsOf(b)}`, hideOnMobile: true },
  { key: "amount", header: "Amount", render: (b: Booking) => formatMoney(b.finalAmount), className: "whitespace-nowrap font-semibold text-white" },
  { key: "payment", header: "Payment", render: (b: Booking) => <Badge tone={PAYMENT_TONE[b.paymentStatus]}>{b.paymentStatus}</Badge> },
  { key: "status", header: "Status", render: (b: Booking) => <Badge tone={STATUS_TONE[b.bookingStatus]}>{b.bookingStatus}</Badge> },
];

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1 border-b border-white/10 py-3 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-4">
    <dt className="text-sm text-gray-400">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-white">{children}</dd>
  </div>
);

function BookingDetails({ booking: b, onClose }: { booking: Booking; onClose: () => void }) {
  const c = customerOf(b);
  return (
    <Modal title={b.bookingCode} description="Booking details" onClose={onClose} size="max-w-xl">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={PAYMENT_TONE[b.paymentStatus]}>{b.paymentStatus}</Badge>
        <Badge tone={STATUS_TONE[b.bookingStatus]}>{b.bookingStatus}</Badge>
      </div>
      <dl>
        <Row label="Customer">{c.name}{c.guest && " (guest)"}</Row>
        <Row label="Email">{c.email || "—"}</Row>
        {c.phone && <Row label="Phone">{c.phone}</Row>}
        <Row label="Movie">{b.movie?.title ?? "Deleted movie"}</Row>
        <Row label="Cinema">{b.cinema?.name ?? "—"}</Row>
        <Row label="Showtime">
          {b.showtime ? `${formatDate(b.showtime.showDate, { utc: true })} at ${formatTime(b.showtime.startTime)}` : "—"}
        </Row>
        <Row label="Seats">{b.totalSeats} · {seatsOf(b)}</Row>
        <Row label="Tickets">{formatMoney(b.totalAmount)} ({formatMoney(b.ticketPrice)} each)</Row>
        {b.foodTotal && b.foodTotal > 0 && <Row label="Food">{formatMoney(b.foodTotal)} ({b.foodItems?.length ?? 0} items)</Row>}
        {b.discountAmount && b.discountAmount > 0 && <Row label="Discount">− {formatMoney(b.discountAmount)}{b.offer?.code && ` (${b.offer.code})`}</Row>}
        <Row label="Total paid">{formatMoney(b.finalAmount)}</Row>
        <Row label="Booked on">{formatDate(b.bookedAt || b.createdAt)}</Row>
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

const selectCls = "h-11 rounded-lg border border-white/10 bg-[#0b0f19] px-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30";

export default function Bookings() {
  const { status, data, error, reload } = useRemote(getBookings, "Could not load the bookings.");
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [viewing, setViewing] = useState<Booking | null>(null);

  const rows = useMemo<Booking[]>(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((b: Booking) => {
      if (bookingStatus && b.bookingStatus !== bookingStatus) return false;
      if (payment && b.paymentStatus !== payment) return false;
      if (!q) return true;
      const c = customerOf(b);
      return [b.bookingCode, c.name, c.email, b.movie?.title, b.cinema?.name].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [rows, search, bookingStatus, payment]);

  const loading = status === "loading";
  const paidRevenue = rows.filter((b) => b.paymentStatus === "Paid").reduce((sum, b) => sum + Number(b.finalAmount || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="mt-2 text-gray-400">Every ticket sold, from customers and guests.</p>
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <StatCard title="Bookings" icon="🎟️" loading={loading} value={formatNumber(rows.length)} />
        <StatCard title="Confirmed" icon="✅" loading={loading} value={formatNumber(rows.filter((b) => b.bookingStatus === "Confirmed").length)} />
        <StatCard title="Paid revenue" icon="💰" loading={loading} value={formatMoney(paidRevenue)} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-6 py-5">
          <h2 className="mr-auto text-xl font-semibold">All bookings</h2>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, customer, movie" aria-label="Search bookings"
            className={`${selectCls} w-full placeholder:text-gray-500 sm:w-64`} />
          <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)} aria-label="Filter by status" className={`${selectCls} flex-1 sm:flex-none`}>
            <option value="">All statuses</option>
            <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Filter by payment" className={`${selectCls} flex-1 sm:flex-none`}>
            <option value="">All payments</option>
            <option>Paid</option><option>Pending</option><option>Failed</option><option>Cancelled</option><option>Refunded</option>
          </select>
        </div>

        <DataTable
          columns={columns} rows={filtered} status={status} error={error} onRetry={reload}
          filtered={Boolean(search.trim() || bookingStatus || payment)}
          emptyTitle="No bookings yet" emptyText="Bookings appear here as soon as customers book tickets."
          actions={(b: Booking) => <RowButton onClick={() => setViewing(b)}>View</RowButton>}
        />
      </section>

      {viewing && <BookingDetails booking={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}