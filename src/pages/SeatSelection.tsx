import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import useRemote from "../hooks/useRemote";
import useNow from "../hooks/useNow";
import { getShowtimeById, getBookedSeats } from "../service/showtime";
import { getScreenById } from "../service/screen";
import { MAX_SEATS, buildSeatRows, isLapsed, parseSeatIds, sortSeatIds } from "../utils/booking";
import { formatMoney } from "../components/dashboard/format";
import type { Screen, Showtime } from "../types/api";

import BookingShell from "../components/booking/BookingShell";
import BookingStepper from "../components/booking/BookingStepper";
import ShowSummaryHeader from "../components/booking/ShowSummaryHeader";
import SeatMap from "../components/booking/SeatMap";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateViews";
import Button from "../components/common/Button";

interface SeatSelectionProps {
  showtimeId: string;
}

function SeatSelectionContent({ showtimeId }: SeatSelectionProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const now = useNow();

  const [picked, setPicked] = useState<string[]>(() => parseSeatIds(params.get("seats")));
  const [limitHit, setLimitHit] = useState<boolean>(false);

  const fetchAll = useCallback(async () => {
    const { data: showtime } = await getShowtimeById(showtimeId);
    const screenRef = typeof showtime.screen === "string" ? showtime.screen : showtime.screen?._id;
    if (!screenRef) {
      throw new Error("This showtime is missing screen details.");
    }

    const [screen, booked] = await Promise.all([
      getScreenById(screenRef),
      getBookedSeats(showtimeId),
    ]);
    return { data: { showtime, screen: screen.data, booked } };
  }, [showtimeId]);

  const { status, data, error, reload } = useRemote<{ showtime: Showtime; screen: Screen; booked: string[] }>(fetchAll, "We couldn't load this show.");

  const rows = useMemo(() => (data ? buildSeatRows(data.screen) : []), [data]);
  const bookedSet = useMemo(() => new Set(data?.booked ?? []), [data]);

  const selected = useMemo(() => {
    const valid = new Set(rows.flatMap((row) => row.seats.map((seat) => seat.id)));
    return picked.filter((id) => valid.has(id) && !bookedSet.has(id));
  }, [picked, rows, bookedSet]);

  const toggle = useCallback(
    (id: string) => {
      if (selected.includes(id)) {
        setLimitHit(false);
        setPicked(selected.filter((s) => s !== id));
      } else if (selected.length >= MAX_SEATS) {
        setLimitHit(true);
      } else {
        setLimitHit(false);
        setPicked([...selected, id]);
      }
    },
    [selected]
  );

  const movieId = typeof data?.showtime?.movie === "string" ? "" : data?.showtime?.movie?._id ?? "";
  const back = `/movies/${movieId}`;

  if (status === "loading") {
    return (
      <BookingShell>
        <LoadingState label="Loading seat layout…" />
      </BookingShell>
    );
  }

  if (status === "error") {
    return (
      <BookingShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <ErrorState message={error} onRetry={reload} />
          <p className="mt-6 text-center text-sm">
            <Link to="/" className="font-semibold text-primary-hover hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </BookingShell>
    );
  }

  const { showtime } = data ?? {};
  if (!showtime) {
    return null;
  }

  const closed = showtime.isActive === false || isLapsed(showtime, now);

  const proceed = () =>
    navigate({
      pathname: `/booking/${showtimeId}/summary`,
      search: `?seats=${sortSeatIds(selected).join(",")}`,
    });

  return (
    <BookingShell>
      <BookingStepper current={2} backTo={back} />

      <div className="mx-auto max-w-[1200px] px-4 pb-32 pt-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <ShowSummaryHeader showtime={showtime} now={now} />
          <Link to={back} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold transition hover:border-primary">
            Change showtime
          </Link>
        </div>

        <div className="mt-8">
          {closed ? (
            <EmptyState
              title="This show is no longer open for booking"
              message="It has already started or was taken off the schedule. Please pick another showtime."
              action={
                <Link to={back} className="text-sm font-semibold text-primary-hover hover:underline">
                  See other showtimes
                </Link>
              }
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Seat layout unavailable"
              message="This screen doesn't have a seat layout yet. Please choose another showtime."
              action={
                <Link to={back} className="text-sm font-semibold text-primary-hover hover:underline">
                  See other showtimes
                </Link>
              }
            />
          ) : (
            <div className="rounded-2xl border border-line bg-surface px-3 py-8 sm:px-8">
              <SeatMap rows={rows} booked={bookedSet} selected={selected} onToggle={toggle} />
              <p className="mt-6 text-center text-xs text-muted">
                {formatMoney(showtime.ticketPrice)} per seat · up to {MAX_SEATS} seats per booking
              </p>
              {limitHit && (
                <p role="alert" className="mt-3 text-center text-sm font-semibold text-amber-300">
                  You can book up to {MAX_SEATS} seats at a time.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {!closed && rows.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0" aria-live="polite">
              {selected.length === 0 ? (
                <p className="text-sm text-muted">Select your seats to continue</p>
              ) : (
                <>
                  <p className="truncate text-sm font-bold">
                    {selected.length} {selected.length === 1 ? "seat" : "seats"}: {sortSeatIds(selected).join(", ")}
                  </p>
                  <p className="text-lg font-extrabold">{formatMoney(selected.length * showtime.ticketPrice)}</p>
                </>
              )}
            </div>
            <Button onClick={proceed} disabled={selected.length === 0} size="lg" className="shrink-0">
              Continue
            </Button>
          </div>
        </div>
      )}
    </BookingShell>
  );
}

export default function SeatSelection() {
  const { showtimeId = "" } = useParams();
  return <SeatSelectionContent key={showtimeId} showtimeId={showtimeId} />;
}
