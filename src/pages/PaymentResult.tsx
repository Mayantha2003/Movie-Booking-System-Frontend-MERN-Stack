import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import BookingShell from "../components/booking/BookingShell";
import Button from "../components/common/Button";
import Banner from "../components/auth/Banner";
import { getErrorMessage } from "../service/errorMessage";
import {
  clearPendingPaymentSession,
  createPaymentCheckout,
  getPaymentStatus,
  getPendingPaymentSession,
  isValidPaymentOrderId,
  savePendingPaymentSession,
  submitPayHereCheckout,
} from "../service/payment";
import type { PaymentStatusResponse } from "../types/api";

const ORDER_BOOKING_CODE = /^PH-(BK-[A-Z0-9]{6})-[1-3]$/i;
const MAX_STATUS_CHECKS = 15;
const STATUS_POLL_INTERVAL_MS = 2_000;

const nextOrderId = (currentOrderId: string, bookingCode: string): string => {
  const currentAttempt = Number(currentOrderId.slice(currentOrderId.lastIndexOf("-") + 1));
  return `PH-${bookingCode}-${currentAttempt + 1}`;
};

const isResolved = (status: PaymentStatusResponse): boolean => {
  if (status.bookingStatus === "Cancelled") return true;
  if (status.status === "FAILED" || status.status === "CANCELLED") return true;
  return (
    status.status === "SUCCESS" &&
    (status.bookingStatus === "Confirmed" || status.bookingStatus === "Completed")
  );
};

export default function PaymentResult() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id")?.trim().toUpperCase() ?? "";
  const isCancellationReturn = location.pathname === "/payment/cancelled";
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const retryingRef = useRef(false);

  const bookingCode = useMemo(
    () => ORDER_BOOKING_CODE.exec(orderId)?.[1]?.toUpperCase() ?? null,
    [orderId]
  );

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let checkCount = 0;

    setPayment(null);
    setError("");
    setChecking(false);
    setTimedOut(false);

    if (!isValidPaymentOrderId(orderId)) {
      setError("This payment return link is invalid.");
      return () => {
        active = false;
      };
    }

    const checkStatus = async () => {
      if (!active) return;
      setChecking(true);
      try {
        const result = await getPaymentStatus(orderId);
        if (!active) return;
        setPayment(result);
        setError("");

        if (result.bookingStatus === "Cancelled" && bookingCode) {
          clearPendingPaymentSession(bookingCode);
        } else if (
          result.status === "SUCCESS" &&
          (result.bookingStatus === "Confirmed" ||
            result.bookingStatus === "Completed") &&
          bookingCode
        ) {
          clearPendingPaymentSession(bookingCode);
        }

        if (isResolved(result)) {
          setChecking(false);
          return;
        }
      } catch (requestError) {
        if (!active) return;
        setError(
          getErrorMessage(
            requestError,
            "We couldn't check payment status. Please try again."
          )
        );
        setChecking(false);
        return;
      }

      checkCount += 1;
      if (checkCount >= MAX_STATUS_CHECKS) {
        setChecking(false);
        setTimedOut(true);
        return;
      }
      timer = window.setTimeout(checkStatus, STATUS_POLL_INTERVAL_MS);
    };

    void checkStatus();
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [bookingCode, orderId, refreshNumber]);

  const holdActive =
    payment?.bookingStatus === "Pending" &&
    !!payment.holdExpiresAt &&
    Date.parse(payment.holdExpiresAt) > Date.now();
  const confirmed =
    payment?.status === "SUCCESS" &&
    (payment.bookingStatus === "Confirmed" ||
      payment.bookingStatus === "Completed");
  const savedSession = getPendingPaymentSession();
  const hasSavedRetryToken =
    !!bookingCode &&
    savedSession?.bookingCode.toUpperCase() === bookingCode;
  const retryAvailableFromServer =
    !!payment &&
    payment.attemptsLeft > 0 &&
    holdActive &&
    (payment.status === "FAILED" || payment.status === "CANCELLED");
  const canRetry =
    retryAvailableFromServer && hasSavedRetryToken;

  const handleRetry = async () => {
    if (!bookingCode || !canRetry || retryingRef.current) return;
    retryingRef.current = true;
    setRetrying(true);
    setError("");
    try {
      const session = getPendingPaymentSession();
      if (!session || session.bookingCode.toUpperCase() !== bookingCode) {
        throw new Error(
          "The secure payment link is no longer available in this browser. Please start a new booking."
        );
      }
      const retryOrderId = nextOrderId(orderId, bookingCode);
      savePendingPaymentSession({ ...session, orderId: retryOrderId });
      const checkout = await createPaymentCheckout(
        session.bookingCode,
        session.paymentToken
      );
      savePendingPaymentSession({ ...session, orderId: checkout.orderId });
      submitPayHereCheckout(checkout.checkout);
    } catch (retryError) {
      const statusCode = (
        retryError as { response?: { status?: number } }
      ).response?.status;
      const responseCode = (
        retryError as { response?: { data?: { code?: string } } }
      ).response?.data?.code;
      if (responseCode === "ATTEMPT_IN_PROGRESS") {
        const retryOrderId = nextOrderId(orderId, bookingCode);
        window.location.assign(
          `/payment/return?order_id=${encodeURIComponent(retryOrderId)}`
        );
        return;
      }
      if (statusCode === 403 || statusCode === 410) {
        clearPendingPaymentSession(bookingCode);
      }
      setError(
        getErrorMessage(retryError, "We couldn't restart the payment.")
      );
    } finally {
      retryingRef.current = false;
      setRetrying(false);
    }
  };

  let heading = "Checking your payment";
  let description =
    "We’re waiting for the payment provider to confirm the result. This page checks the booking server; the redirect itself is not proof of payment.";

  if (confirmed) {
    heading = "Payment confirmed";
    description = "The backend verified your payment and confirmed your booking.";
  } else if (payment?.status === "SUCCESS") {
    heading = "Payment received; booking not confirmed";
    description =
      "The payment provider reports a successful charge, but the booking server has not confirmed the seats. Do not treat this as a ticket; contact support for assistance.";
  } else if (payment?.bookingStatus === "Cancelled") {
    heading = "Booking cancelled";
    description =
      payment.status === "PENDING"
        ? "The booking has been cancelled and its seats released. The final payment result is still being checked."
        : "The booking was cancelled and its seats have been released.";
  } else if (payment?.status === "FAILED") {
    heading = "Payment failed";
    description = canRetry
      ? "Your seat hold is still active. You can try another payment attempt before it expires."
      : retryAvailableFromServer
        ? "Your seat hold is still active, but this browser no longer has the secure retry token."
        : "This payment did not complete. The seat hold may have expired or all attempts may have been used.";
  } else if (payment?.status === "CANCELLED") {
    heading = isCancellationReturn ? "Payment cancelled" : "Payment was cancelled";
    description = canRetry
      ? "The payment was cancelled. Your seats are still held temporarily, so you can retry."
      : retryAvailableFromServer
        ? "Your seat hold is still active, but this browser no longer has the secure retry token."
        : "The payment was cancelled and this booking can no longer be paid.";
  } else if (payment?.status === "PENDING" && isCancellationReturn) {
    heading = "Checking the cancelled checkout";
    description =
      "The return link does not cancel or confirm a payment. We’re checking the server notification before updating your booking.";
  }

  return (
    <BookingShell>
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <section className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-9">
          <div
            aria-hidden="true"
            className={`mx-auto grid size-14 place-items-center rounded-full text-2xl font-black ${
              confirmed
                ? "bg-success/15 text-success"
                : payment?.status === "FAILED" ||
                    payment?.status === "CANCELLED" ||
                    payment?.bookingStatus === "Cancelled"
                  ? "bg-danger/15 text-danger"
                  : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {confirmed ? "✓" : payment?.status === "FAILED" ? "!" : "…"}
          </div>
          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">{heading}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>

          {orderId && (
            <p className="mt-4 text-xs text-muted">
              Payment reference: <span className="font-mono">{orderId}</span>
            </p>
          )}

          {error && (
            <div className="mt-5 text-left">
              <Banner>{error}</Banner>
            </div>
          )}

          {checking && (
            <p className="mt-5 text-sm text-muted" role="status">
              Checking payment status…
            </p>
          )}
          {timedOut && !error && (
            <p className="mt-5 text-sm text-amber-300" role="status">
              The payment is still pending. You can check again shortly.
            </p>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {confirmed && bookingCode && (
              <Link
                to={`/booking/confirmation/${encodeURIComponent(bookingCode)}`}
                className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                View confirmed booking
              </Link>
            )}
            {canRetry && (
              <Button onClick={handleRetry} loading={retrying}>
                Retry payment
              </Button>
            )}
            {!confirmed && (
              <Button
                variant="secondary"
                onClick={() => setRefreshNumber((value) => value + 1)}
                disabled={checking}
              >
                Check status again
              </Button>
            )}
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-lg border border-line px-6 text-sm font-semibold transition hover:border-primary"
            >
              Back to movies
            </Link>
          </div>
        </section>
      </div>
    </BookingShell>
  );
}
