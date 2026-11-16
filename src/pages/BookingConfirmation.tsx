
import { useCallback, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useRemote from "../hooks/useRemote";
import { getBookingByCode } from "../service/booking";
import type { BookingConfirmation } from "../types/api";
import { generateTicketPDF } from "../utils/generateTicketPDF";

import BookingShell from "../components/booking/BookingShell";
import BookingStepper from "../components/booking/BookingStepper";
import TicketCard from "../components/booking/TicketCard";
import { LoadingState, ErrorState } from "../components/common/StateViews";
import Button from "../components/common/Button";

const Check = () => (
  <svg
    viewBox="0 0 24 24"
    width="40"
    height="40"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

interface BookingConfirmationProps {
  code: string;
}

function BookingConfirmationView({
  booking,
  isAuthenticated,
}: {
  booking: BookingConfirmation;
  isAuthenticated: boolean;
}) {
  const [downloading, setDownloading] = useState(false);

  const cancelled = booking.bookingStatus === "Cancelled";

  const confirmed =
    (booking.bookingStatus === "Confirmed" ||
      booking.bookingStatus === "Completed") &&
    booking.paymentStatus === "Paid";

  const pending = booking.bookingStatus === "Pending";

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await generateTicketPDF(booking);
    } catch (error) {
      console.error("Ticket PDF download failed:", error);
      alert("Unable to download the ticket PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <BookingShell>
      <BookingStepper current={4} />

      <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <span
            className={`mx-auto grid size-16 place-items-center rounded-full ${
              cancelled
                ? "bg-danger/15 text-danger"
                : confirmed
                  ? "bg-success/15 text-success"
                  : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {cancelled ? (
              <span className="text-3xl" aria-hidden="true">
                ×
              </span>
            ) : confirmed ? (
              <Check />
            ) : (
              <span aria-hidden="true">…</span>
            )}
          </span>

          <h1 className="mt-5 text-3xl font-extrabold">
            {cancelled
              ? "This booking was cancelled"
              : confirmed
                ? "Booking confirmed"
                : pending
                  ? "Payment pending"
                  : "Booking not confirmed"}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {cancelled
              ? "The seats have been released."
              : confirmed
                ? "Keep your booking ID or QR code handy. You'll need it at the cinema."
                : pending
                  ? "Your seats are temporarily held while payment is being completed. This is not a ticket yet."
                  : "This booking has not been confirmed. Check the payment status before using it as a ticket."}
          </p>
        </div>

        <TicketCard booking={booking} />

        {/* Download PDF and navigation buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-glow transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              "Generating PDF..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Ticket PDF
              </>
            )}
          </button>

          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-glow transition hover:bg-primary-hover"
          >
            Back to home
          </Link>

          {isAuthenticated && (
            <Link
              to="/profile"
              className="inline-flex h-11 items-center rounded-lg border border-line px-6 text-sm font-bold transition hover:border-primary"
            >
              My bookings
            </Link>
          )}
        </div>
      </div>
    </BookingShell>
  );
}

function BookingConfirmationContent({
  code,
}: BookingConfirmationProps) {
  const { isAuthenticated } = useAuth();

  const fetchBooking = useCallback(
    () => getBookingByCode(code),
    [code]
  );

  const {
    status,
    data: booking,
    error,
    reload,
  } = useRemote<BookingConfirmation>(
    fetchBooking,
    "We couldn't find this booking."
  );

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
            <Link
              to="/"
              className="font-semibold text-primary-hover hover:underline"
            >
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

  return (
    <BookingConfirmationView
      booking={booking}
      isAuthenticated={isAuthenticated}
    />
  );
}

function LegacyBookingLookup({
  code,
  isAuthenticated,
}: BookingConfirmationProps & {
  isAuthenticated: boolean;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [verification, setVerification] = useState<{
    email: string;
    phone: string;
  } | null>(null);

  const fetchBooking = useCallback(() => {
    if (verification) {
      return getBookingByCode(code, verification);
    }

    if (isAuthenticated) {
      return getBookingByCode(code);
    }

    return Promise.reject(
      new Error("Contact details are required.")
    );
  }, [code, isAuthenticated, verification]);

  const {
    status,
    data: booking,
    error,
    reload,
  } = useRemote<BookingConfirmation>(
    fetchBooking,
    "We couldn't find this booking."
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setVerification({
      email: email.trim(),
      phone: phone.trim(),
    });

    reload();
  };

  if (booking) {
    return (
      <BookingConfirmationView
        booking={booking}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  if (status === "loading" && isAuthenticated && !verification) {
    return (
      <BookingShell>
        <LoadingState label="Loading your ticket…" />
      </BookingShell>
    );
  }

  return (
    <BookingShell>
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-center text-2xl font-extrabold">
          Verify your booking
        </h1>

        <p className="mt-3 text-center text-sm text-muted">
          This older booking ID needs extra verification. Enter the email
          address and phone number used for the booking.
        </p>

        {isAuthenticated && (
          <p className="mt-2 text-center text-sm text-muted">
            If this booking is linked to another account, sign in to that
            account.
          </p>
        )}

        {!isAuthenticated && (
          <p className="mt-2 text-center text-sm text-muted">
            If this booking is linked to an account,{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-hover hover:underline"
            >
              sign in
            </Link>
            .
          </p>
        )}

        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit}
        >
          <label
            className="block text-sm font-semibold"
            htmlFor="legacy-booking-email"
          >
            Email address

            <input
              id="legacy-booking-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-line bg-card px-3 text-ink"
            />
          </label>

          <label
            className="block text-sm font-semibold"
            htmlFor="legacy-booking-phone"
          >
            Phone number

            <input
              id="legacy-booking-phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-line bg-card px-3 text-ink"
            />
          </label>

          {status === "error" && verification && (
            <ErrorState message={error} />
          )}

          <Button
            type="submit"
            loading={status === "loading" && Boolean(verification)}
            disabled={!email.trim() || !phone.trim()}
            className="w-full"
          >
            View booking
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            to="/"
            className="font-semibold text-primary-hover hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </BookingShell>
  );
}

export default function BookingConfirmation() {
  const { code = "" } = useParams();
  const { isAuthenticated } = useAuth();

  if (/^BK-[A-HJ-NP-Z2-9]{6}$/i.test(code.trim())) {
    return (
      <LegacyBookingLookup
        key={code}
        code={code}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <BookingConfirmationContent
      key={code}
      code={code}
    />
  );
}
