import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import MoviePoster from "../movie/MoviePoster";
import { describeDay, showDayKey, sortSeatIds } from "../../utils/booking";
import { formatMoney, formatTime } from "../dashboard/format";
import { formatDuration } from "../../utils/media";

const Detail = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs text-muted">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-semibold">{children}</dd>
  </div>
);

const STATUS_STYLES = {
  Confirmed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Paid: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  Cancelled: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  Failed: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  Refunded: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
};

const Status = ({ label, value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[value] ?? STATUS_STYLES.Pending}`}>
    {label}: {value}
  </span>
);

// The finished ticket: movie, show details, seats, price, booking ID and QR code.
// `booking` is the response of GET /bookings/code/:code.
export default function TicketCard({ booking }) {
  const [copied, setCopied] = useState(false);

  const { movie, cinema, screen, showtime } = booking;
  const seatIds = sortSeatIds((booking.seats || []).map((s) => s.seatId));
  const day = describeDay(showDayKey(showtime?.showDate));
  const qrValue = `${window.location.origin}/booking/confirmation/${booking.bookingCode}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure page, permissions). The code is visible anyway.
    }
  };

  return (
    <article className="animate-ticket-in overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-black/40">
      <div className="grid lg:grid-cols-[1fr_280px]">
        {/* Show details */}
        <div className="p-6 sm:p-8">
          <div className="flex gap-5">
            <MoviePoster movie={movie} className="aspect-[2/3] w-24 shrink-0 rounded-xl sm:w-28" />
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">{movie?.title}</h2>
              <p className="mt-1 text-sm text-muted">{formatDuration(movie?.duration)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Status label="Booking" value={booking.bookingStatus} />
                <Status label="Payment" value={booking.paymentStatus} />
              </div>
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
            <Detail label="Cinema">{cinema?.name}</Detail>
            <Detail label="Screen">
              {screen?.name}
              {screen?.screenType && screen.screenType !== "Standard" ? ` (${screen.screenType})` : ""}
            </Detail>
            <Detail label="Date">{day.full}</Detail>
            <Detail label="Time">{formatTime(showtime?.startTime)}</Detail>
            <Detail label="Tickets">{booking.totalSeats}</Detail>
            <Detail label="Seats">
              <span className="flex flex-wrap gap-1.5">
                {seatIds.map((id) => (
                  <span key={id} className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary-hover">
                    {id}
                  </span>
                ))}
              </span>
            </Detail>
            {booking.guestInfo?.name && <Detail label="Booked by">{booking.guestInfo.name}</Detail>}
            {booking.guestInfo?.email && <Detail label="Email">{booking.guestInfo.email}</Detail>}
            {cinema?.address && <Detail label="Address">{cinema.address}</Detail>}
          </dl>

          {/* Price */}
          <div className="mt-7 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-muted">
              <span>{booking.totalSeats} × {formatMoney(booking.ticketPrice)}</span>
              <span>{formatMoney(booking.totalSeats * booking.ticketPrice)}</span>
            </div>
            {booking.foodTotal > 0 && (
              <div className="flex justify-between text-muted">
                <span>Food & beverages</span>
                <span>{formatMoney(booking.foodTotal)}</span>
              </div>
            )}
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Discount{booking.offer?.code ? ` (${booking.offer.code})` : ""}</span>
                <span>− {formatMoney(booking.discountAmount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-extrabold">{formatMoney(booking.finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Booking ID + QR (the "stub") */}
        <div className="relative flex flex-col items-center justify-center gap-4 border-t border-dashed border-line bg-card/50 p-6 text-center lg:border-l lg:border-t-0">
          <span aria-hidden="true" className="absolute -top-3 left-1/2 hidden size-6 -translate-x-1/2 rounded-full bg-bg max-lg:block" />
          <span aria-hidden="true" className="absolute -left-3 top-1/2 hidden size-6 -translate-y-1/2 rounded-full bg-bg lg:block" />

          <div className="rounded-2xl bg-white p-3">
            <QRCodeSVG value={qrValue} size={160} level="M" aria-label={`QR code for booking ${booking.bookingCode}`} />
          </div>

          <div>
            <p className="text-xs text-muted">Booking ID</p>
            <p className="mt-1 text-2xl font-extrabold tracking-wider">{booking.bookingCode}</p>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className="h-10 rounded-lg border border-line px-5 text-sm font-semibold transition hover:border-primary"
          >
            {copied ? "Copied ✓" : "Copy booking ID"}
          </button>
        </div>
      </div>
    </article>
  );
}