import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useRemote from "../hooks/useRemote";
import useNow from "../hooks/useNow";
import { getShowtimeById, getBookedSeats } from "../service/showtime";
import { createBooking } from "../service/booking";
import { getErrorMessage } from "../service/errorMessage";
import { isLapsed, parseSeatIds, seatPayload, sortSeatIds } from "../utils/booking";
import { validateGuest } from "../utils/validators";
import type { CreateBookingPayload, Showtime } from "../types/api";

import BookingShell from "../components/booking/BookingShell";
import BookingStepper from "../components/booking/BookingStepper";
import OrderSummary from "../components/booking/OrderSummary";
import GuestDetailsForm from "../components/booking/GuestDetailsForm";
import Banner from "../components/auth/Banner";
import Button from "../components/common/Button";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateViews";

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

const Panel = ({ title, children }: PanelProps) => (
  <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 className="mb-4 text-lg font-extrabold">{title}</h2>
    {children}
  </section>
);

interface BookingSummaryProps {
  showtimeId: string;
}

function BookingSummaryContent({ showtimeId }: BookingSummaryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const now = useNow();

  const seatIds = useMemo(() => sortSeatIds(parseSeatIds(params.get("seats"))), [params]);

  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState("");
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    const { data: showtime } = await getShowtimeById(showtimeId);
    const booked = await getBookedSeats(showtimeId);
    return { data: { showtime, booked } };
  }, [showtimeId]);

  const { status, data, error, reload } = useRemote<{ showtime: Showtime; booked: string[] }>(fetchAll, "We couldn't load this show.");

  const seatsPage = (ids: string[]) =>
    ids.length
      ? `/booking/${showtimeId}/seats?seats=${ids.join(",")}`
      : `/booking/${showtimeId}/seats`;

  if (seatIds.length === 0) return <Navigate to={seatsPage([])} replace />;

  if (status === "loading") {
    return (
      <BookingShell>
        <LoadingState label="Preparing your booking…" />
      </BookingShell>
    );
  }

  if (status === "error") {
    return (
      <BookingShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <ErrorState message={error} onRetry={reload} />
        </div>
      </BookingShell>
    );
  }

  const showtime = data?.showtime;
  if (!showtime) {
    return null;
  }

  const bookedSeats = data?.booked ?? [];
  const closed = showtime.isActive === false || isLapsed(showtime, now);
  const alreadyTaken = [...new Set([...takenSeats, ...seatIds.filter((id) => bookedSeats.includes(id))])].filter((id) => seatIds.includes(id));
  const remaining = seatIds.filter((id) => !alreadyTaken.includes(id));
  const movieId = typeof showtime.movie === "string" ? "" : showtime.movie?._id ?? "";

  if (closed) {
    return (
      <BookingShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <EmptyState
            title="This show is no longer open for booking"
            message="It has already started or was taken off the schedule."
            action={
              <Link to={`/movies/${movieId}`} className="text-sm font-semibold text-primary-hover hover:underline">
                Choose another showtime
              </Link>
            }
          />
        </div>
      </BookingShell>
    );
  }

  const handleGuestChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuest((g) => ({ ...g, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleConfirm = async () => {
    setServerError("");

    if (!isAuthenticated) {
      const found = validateGuest(guest);
      setErrors(found);
      if (Object.keys(found).length) return;
    }

    setSubmitting(true);
    try {
      const payload: CreateBookingPayload = {
        showtimeId,
        seats: seatIds.map(seatPayload),
      };

      if (!isAuthenticated) {
        payload.guestInfo = {
          name: guest.name.trim(),
          email: guest.email.trim(),
          phone: guest.phone.trim(),
        };
      }

      const res = await createBooking(payload);
      navigate(`/booking/confirmation/${res.data.bookingCode}`, { replace: true });
    } catch (err) {
      const responseData = (err as { response?: { data?: { unavailableSeats?: string[] } } }).response?.data;
      const taken = responseData?.unavailableSeats;
      if ((err as { response?: { status?: number } }).response?.status === 409 && Array.isArray(taken)) {
        setTakenSeats(taken);
      }
      setServerError(getErrorMessage(err, "We couldn't complete your booking. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const hasConflict = alreadyTaken.length > 0;

  return (
    <BookingShell>
      <BookingStepper current={3} backTo={seatsPage(seatIds)} />

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Review your booking</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {hasConflict && (
              <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/5 p-5">
                <p className="font-bold">
                  {alreadyTaken.length === 1 ? "Seat" : "Seats"} {alreadyTaken.join(", ")} {alreadyTaken.length === 1 ? "was" : "were"} just booked by someone else.
                </p>
                <p className="mt-1 text-sm text-muted">Please choose different seats to continue.</p>
                <Link to={seatsPage(remaining)} className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover">
                  Choose different seats
                </Link>
              </div>
            )}

            <Panel title="Customer details">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold">
                    {(user?.firstName || user?.username || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username}</p>
                    <p className="truncate text-sm text-muted">
                      {user?.email || `@${user?.username}`} · This booking will be saved to your account.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-5 text-sm text-muted">
                    Continue as a guest, or{" "}
                    <Link to="/login" state={{ from: location }} className="font-semibold text-primary-hover hover:underline">
                      log in
                    </Link>{" "}
                    to keep this booking in your account.
                  </p>
                  <GuestDetailsForm values={guest} errors={errors} onChange={handleGuestChange} />
                </>
              )}
            </Panel>

            <Panel title="Payment">
              <p className="text-sm leading-6 text-muted">
                Your booking is confirmed as soon as you submit it. Online payment isn&apos;t enabled yet, so the payment status will show as <span className="font-semibold text-amber-300">Pending</span>.
              </p>
            </Panel>
          </div>

          <OrderSummary showtime={showtime} seatIds={seatIds} now={now} className="h-fit lg:sticky lg:top-24">
            {serverError && !hasConflict && (
              <div className="mb-4">
                <Banner>{serverError}</Banner>
              </div>
            )}
            <Button onClick={handleConfirm} loading={submitting} disabled={hasConflict} size="lg" className="w-full">
              Confirm booking
            </Button>
          </OrderSummary>
        </div>
      </div>
    </BookingShell>
  );
}

export default function BookingSummary() {
  const { showtimeId = "" } = useParams();
  return <BookingSummaryContent key={showtimeId} showtimeId={showtimeId} />;
}
