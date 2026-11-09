import type { ReactNode } from "react";
import MoviePoster from "../movie/MoviePoster";
import { describeDay, showDayKey } from "../../utils/booking";
import { formatMoney, formatTime } from "../dashboard/format";
import { formatDuration } from "../../utils/media";

interface RowProps {
  label: string;
  children: ReactNode;
}

const Row = ({ label, children }: RowProps) => (
  <div className="flex justify-between gap-4 py-2.5 text-sm">
    <dt className="shrink-0 text-muted">{label}</dt>
    <dd className="min-w-0 text-right font-semibold">{children}</dd>
  </div>
);

interface OrderSummaryProps {
  showtime: {
    movie?: { _id?: string; title?: string; language?: string; duration?: number; poster?: string } | string;
    cinema?: { _id?: string; name?: string } | string;
    screen?: { _id?: string; name?: string; screenType?: string } | string;
    showDate: string;
    startTime: string;
    ticketPrice: number;
  };
  seatIds: string[];
  now: Date;
  children?: ReactNode;
  className?: string;
}

export default function OrderSummary({ showtime, seatIds, now, children, className = "" }: OrderSummaryProps) {
  const movie = typeof showtime.movie === "string" ? undefined : showtime.movie;
  const cinema = typeof showtime.cinema === "string" ? undefined : showtime.cinema;
  const screen = typeof showtime.screen === "string" ? undefined : showtime.screen;
  const day = describeDay(showDayKey(showtime.showDate), now);
  const total = seatIds.length * showtime.ticketPrice;

  return (
    <aside className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`} aria-label="Booking summary">
      <div className="flex gap-4">
        <MoviePoster movie={movie} className="aspect-[2/3] w-20 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold leading-snug">{movie?.title}</h2>
          <p className="mt-1 text-xs text-muted">
            {[movie?.language, formatDuration(movie?.duration ?? 0)].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-line border-t border-line">
        <Row label="Cinema">{cinema?.name}</Row>
        <Row label="Screen">{screen?.name}</Row>
        <Row label="Date">{day.full}</Row>
        <Row label="Time">{formatTime(showtime.startTime)}</Row>
        <Row label="Seats">
          <span className="flex flex-wrap justify-end gap-1.5">
            {seatIds.map((id) => (
              <span key={id} className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary-hover">
                {id}
              </span>
            ))}
          </span>
        </Row>
        <Row label="Tickets">
          {seatIds.length} × {formatMoney(showtime.ticketPrice)}
        </Row>
      </dl>

      <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Total</span>
        <span className="text-2xl font-extrabold">{formatMoney(total)}</span>
      </div>

      {children && <div className="mt-5">{children}</div>}
    </aside>
  );
}
