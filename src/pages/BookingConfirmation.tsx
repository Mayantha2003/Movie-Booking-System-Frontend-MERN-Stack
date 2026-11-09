import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useRemote from "../hooks/useRemote";
import { getBookingByCode } from "../service/booking";
import type { Booking } from "../types/api";

import BookingShell from "../components/booking/BookingShell";
import BookingStepper from "../components/booking/BookingStepper";
import TicketCard from "../components/booking/TicketCard";
import { LoadingState, ErrorState } from "../components/common/StateViews";

const Check = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

interface BookingConfirmationProps {
  code: string;
}

function BookingConfirmationContent({ code }: BookingConfirmationProps) {
  const { isAuthenticated } = useAuth();
  const fetchBooking = useCallback(() => getBookingByCode(code), [code]);
  const { status, data: booking, error, reload } = useRemote<Booking>(fetchBooking, "We couldn't find this booking.");

  if (status === "loading") {
    return (
      <BookingShell>
        <LoadingState label="Loading your ticket…" />
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

  if (!booking) {
    return null;
  }

  const cancelled = booking.bookingStatus === "Cancelled";

  return (
    <BookingShell>
      <BookingStepper current={4} />

      <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <span className={`mx-auto grid size-16 place-items-center rounded-full ${cancelled ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}>
            {cancelled ? <span className="text-3xl" aria-hidden="true">×</span> : <Check />}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">{cancelled ? "This booking was cancelled" : "Booking confirmed"}</h1>
          <p className="mt-2 text-sm text-muted">
            {cancelled
              ? "The seats have been released."
              : "Keep your booking ID or QR code handy. You'll need it at the cinema."}
          </p>
        </div>

        <TicketCard booking={booking} />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-glow transition hover:bg-primary-hover">
            Back to home
          </Link>
          {isAuthenticated && (
            <Link to="/profile" className="inline-flex h-11 items-center rounded-lg border border-line px-6 text-sm font-bold transition hover:border-primary">
              My bookings
            </Link>
          )}
        </div>
      </div>
    </BookingShell>
  );
}

export default function BookingConfirmation() {
  const { code = "" } = useParams();
  return <BookingConfirmationContent key={code} code={code} />;
}
