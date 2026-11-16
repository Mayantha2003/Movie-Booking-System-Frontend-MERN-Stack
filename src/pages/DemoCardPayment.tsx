import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import BookingShell from "../components/booking/BookingShell";
import Button from "../components/common/Button";
import { getErrorMessage } from "../service/errorMessage";
import {
  getPendingPaymentSession,
  submitDemoCardPayment,
} from "../service/payment";

const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const normalizePaymentSession = () => {
  const session = getPendingPaymentSession();
  return session ?? null;
};

export default function DemoCardPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storedSession = useMemo(() => normalizePaymentSession(), []);
  const bookingCode = searchParams.get("bookingCode")?.trim().toUpperCase() ?? storedSession?.bookingCode ?? "";
  const paymentToken = searchParams.get("paymentToken")?.trim() ?? storedSession?.paymentToken ?? "";
  const totalAmount = storedSession ? "LKR 0.00" : "LKR 0.00";

  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!bookingCode || !paymentToken) {
    return <Navigate to="/" replace />;
  }

  const validateForm = (): string | null => {
    if (!cardHolderName.trim()) return "Cardholder name is required.";
    if (cardNumber.replace(/\D/g, "").length < 15) return "Please enter a valid card number.";
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) return "Expiry date must be in MM/YY format.";
    const expiryParts = expiry.split("/");
    const month = Number(expiryParts[0]);
    const year = Number(`20${expiryParts[1]}`);
    const now = new Date();
    const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
    if (month < 1 || month > 12 || expiryDate.getTime() < now.getTime()) {
      return "This card is expired or the expiry date is invalid.";
    }
    if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3 or 4 digits.";
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
  const response = await submitDemoCardPayment({
    bookingCode,
    paymentToken,
  });

      const safeOrderId = response.orderId || `${bookingCode}-demo`;
      navigate(`/payment/return?order_id=${encodeURIComponent(safeOrderId)}`);
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, "Your demo payment could not be processed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(event.target.value));
  };

  const handleExpiryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(event.target.value));
  };

  return (
    <BookingShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Secure Demo Payment</p>
                <h1 className="mt-2 text-3xl font-extrabold">Complete payment</h1>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Demo mode
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-line bg-[#0f172a] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Accepted cards</span>
                  <div className="flex gap-2">
                    <span className="rounded-md bg-blue-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                      Visa
                    </span>
                    <span className="rounded-md bg-orange-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
                      MasterCard
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted">Cardholder name</label>
                <input
                  value={cardHolderName}
                  onChange={(event) => setCardHolderName(event.target.value)}
                  placeholder="John Doe"
                  className="h-12 w-full rounded-xl border border-line bg-transparent px-4 text-ink outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted">Card number</label>
                <input
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4242 4242 4242 4242"
                  className="h-12 w-full rounded-xl border border-line bg-transparent px-4 text-ink outline-none transition focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">Expiry date</label>
                  <input
                    inputMode="numeric"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="h-12 w-full rounded-xl border border-line bg-transparent px-4 text-ink outline-none transition focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">CVV</label>
                  <input
                    inputMode="numeric"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className="h-12 w-full rounded-xl border border-line bg-transparent px-4 text-ink outline-none transition focus:border-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" loading={loading} className="flex-1" size="lg">
                  {loading ? "Processing payment..." : "Pay now"}
                </Button>
                <Link to="/" className="inline-flex items-center justify-center rounded-lg border border-line px-6 py-3 font-bold text-muted transition hover:border-primary hover:text-ink">
                  Cancel
                </Link>
              </div>
            </form>
          </section>

          <aside className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Payment summary</h2>
              <span className="rounded-full bg-card px-2 py-1 text-xs font-semibold text-muted">Booking {bookingCode}</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-[#0f172a] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Booking reference</p>
                <p className="mt-2 text-lg font-bold text-ink">{bookingCode}</p>
              </div>

              <div className="space-y-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Movie</span>
                  <span className="font-medium text-ink">Demo screening</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cinema</span>
                  <span className="font-medium text-ink">Cinema One</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Showtime</span>
                  <span className="font-medium text-ink">Tonight, 7:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seats</span>
                  <span className="font-medium text-ink">A1, A2</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Total</span>
                <span className="text-base font-bold text-ink">{totalAmount}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </BookingShell>
  );
}
