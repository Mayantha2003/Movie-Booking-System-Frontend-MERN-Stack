import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import BookingShell from "../components/booking/BookingShell";
import Banner from "../components/auth/Banner";
import {
  clearPendingPaymentSession,
  getPendingPaymentSession,
  submitDemoCardPayment,
} from "../service/payment";
import { getErrorMessage } from "../service/errorMessage";

const formatCardNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const isValidCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
};

const isValidExpiry = (value: string) => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;

  const [monthText, yearText] = value.split("/");
  const month = Number(monthText);
  const year = 2000 + Number(yearText);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  const expiryMonth = year * 12 + month - 1;

  return expiryMonth >= currentMonth;
};

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingCode = searchParams.get("bookingCode")?.toUpperCase() ?? "";

  const session = useMemo(
    () => getPendingPaymentSession(),
    []
  );

  const validSession =
    !!session &&
    session.bookingCode.toUpperCase() === bookingCode;

  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
      setExpiry(digits);
    } else {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    }
  };

  const handlePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!validSession || !session) {
      setError(
        "Your secure booking session is unavailable. Please start a new booking."
      );
      return;
    }

    if (
      Date.parse(session.holdExpiresAt) <= Date.now()
    ) {
      clearPendingPaymentSession(bookingCode);
      setError("Your seat hold has expired. Please select your seats again.");
      return;
    }

    if (cardHolderName.trim().length < 3) {
      setError("Please enter the cardholder name.");
      return;
    }

    if (!isValidCardNumber(cardNumber)) {
      setError("Please enter a valid demo card number.");
      return;
    }

    if (!isValidExpiry(expiry)) {
      setError("Please enter a valid future expiry date.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("Please enter a valid CVV.");
      return;
    }

    setProcessing(true);

    try {
      const result = await submitDemoCardPayment({
        bookingCode: session.bookingCode,
        paymentToken: session.paymentToken,
      });

      if (
        result.bookingStatus !== "Confirmed" &&
        result.bookingStatus !== "Completed"
      ) {
        throw new Error(
          "Payment was not confirmed by the booking server. Please check your booking before trying again."
        );
      }

      clearPendingPaymentSession(session.bookingCode);

      navigate(
        `/booking/confirmation/${encodeURIComponent(session.bookingCode)}`,
        { replace: true }
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Demo payment failed. Please check your details and try again."
        )
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!validSession || !session) {
    return (
      <BookingShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-2xl border border-line bg-surface p-7 text-center">
            <h1 className="text-2xl font-extrabold">
              Payment session unavailable
            </h1>
            <p className="mt-3 text-sm text-muted">
              Your secure payment session is not available in this browser.
              Please start a new booking.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-white"
            >
              Back to movies
            </Link>
          </div>
        </div>
      </BookingShell>
    );
  }

  return (
    <BookingShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">
                  SECURE DEMO CHECKOUT
                </p>
                <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  Card Payment
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Demonstration payment for your movie booking.
                </p>
              </div>
              <span className="rounded-xl border border-line px-3 py-2 text-xs font-bold">
                DEMO
              </span>
            </div>

            <div className="mt-6 rounded-xl bg-background p-4">
              <p className="text-xs text-muted">Booking reference</p>
              <p className="mt-1 font-mono font-bold">{bookingCode}</p>
              <p className="mt-3 text-xs text-muted">
                Seat hold expires
              </p>
              <p className="mt-1 text-sm font-semibold">
                {new Date(session.holdExpiresAt).toLocaleString()}
              </p>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-5 p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-extrabold">
                Card information
              </h2>
              <p className="mt-1 text-sm text-muted">
                Enter demonstration card details to complete the prototype.
                No card details are sent to the payment server.
              </p>
            </div>

            {error && (
              <div role="alert">
                <Banner>{error}</Banner>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Cardholder name
              </label>
              <input
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                autoComplete="cc-name"
                placeholder="Name on card"
                maxLength={80}
                className="h-12 w-full rounded-lg border border-line bg-background px-4 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Card number
              </label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                className="h-12 w-full rounded-lg border border-line bg-background px-4 font-mono outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Expiry date
                </label>
                <input
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  maxLength={5}
                  className="h-12 w-full rounded-lg border border-line bg-background px-4 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  CVV
                </label>
                <input
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  className="h-12 w-full rounded-lg border border-line bg-background px-4 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <p className="text-sm font-bold">
                Demo card information
              </p>
              <p className="mt-2 text-sm text-muted">
                Card number: 4242 4242 4242 4242
              </p>
              <p className="mt-1 text-sm text-muted">
                Expiry: Any future month and year
              </p>
              <p className="mt-1 text-sm text-muted">
                CVV: 123
              </p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? "Processing demo payment..." : "Pay securely"}
            </button>

            <p className="text-center text-xs leading-5 text-muted">
              This is a demonstration payment interface. It does not charge
              a real card or process real financial transactions.
            </p>
          </form>
        </div>
      </div>
    </BookingShell>
  );
}
