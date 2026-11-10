import api from "./api";
import type {
  ApiResponse,
  PayHereCheckout,
  PaymentStatusResponse,
} from "../types/api";

const PAYMENT_SESSION_KEY = "movie-booking-pending-payment";
const ORDER_ID_PATTERN = /^PH-BK-[A-Z0-9]{6}-[1-3]$/i;
const SANDBOX_CHECKOUT_URL = "https://sandbox.payhere.lk/pay/checkout";

export const isValidPaymentOrderId = (orderId: string): boolean =>
  ORDER_ID_PATTERN.test(orderId);

export interface PendingPaymentSession {
  bookingCode: string;
  paymentToken: string;
  holdExpiresAt: string;
  showtimeId: string;
  seatIds: string[];
  orderId?: string;
}

export const createPaymentCheckout = async (
  bookingCode: string,
  paymentToken: string
): Promise<PayHereCheckout> => {
  const response = await api.post<ApiResponse<PayHereCheckout>>(
    "/payments/checkout",
    { bookingCode, paymentToken },
    { skipAuthRedirect: true }
  );
  return response.data.data;
};

export const getPaymentStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  if (!isValidPaymentOrderId(orderId)) {
    throw new Error("Invalid payment order ID.");
  }
  const response = await api.get<ApiResponse<PaymentStatusResponse>>(
    `/payments/status/${encodeURIComponent(orderId)}`,
    { skipAuthRedirect: true }
  );
  return response.data.data;
};

export const savePendingPaymentSession = (
  session: PendingPaymentSession
): void => {
  if (!sessionStorageAvailable()) {
    throw new Error("This browser cannot save the payment session for a retry.");
  }
  window.sessionStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(session));
};

export const canPersistPaymentSession = (): boolean => {
  if (!sessionStorageAvailable()) return false;
  const probeKey = `${PAYMENT_SESSION_KEY}-probe`;
  try {
    window.sessionStorage.setItem(probeKey, "1");
    window.sessionStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
};

const sessionStorageAvailable = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
};

export const getPendingPaymentSession = (): PendingPaymentSession | null => {
  if (!sessionStorageAvailable()) return null;

  let stored: string | null;
  try {
    stored = window.sessionStorage.getItem(PAYMENT_SESSION_KEY);
  } catch (error) {
    console.error("Could not read the pending payment session:", error);
    return null;
  }
  if (!stored) return null;

  try {
    const value: unknown = JSON.parse(stored);
    const hasOrderId =
      typeof value === "object" && value !== null && "orderId" in value;
    const orderId = hasOrderId ? value.orderId : undefined;
    if (
      typeof value !== "object" ||
      value === null ||
      !("bookingCode" in value) ||
      !("paymentToken" in value) ||
      !("holdExpiresAt" in value) ||
      !("showtimeId" in value) ||
      !("seatIds" in value) ||
      typeof value.bookingCode !== "string" ||
      !/^BK-[A-HJ-NP-Z2-9]{6}$/i.test(value.bookingCode) ||
      typeof value.paymentToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(value.paymentToken) ||
      typeof value.holdExpiresAt !== "string" ||
      typeof value.showtimeId !== "string" ||
      !Array.isArray(value.seatIds) ||
      value.seatIds.length === 0 ||
      !value.seatIds.every((seatId: unknown) => typeof seatId === "string") ||
      (hasOrderId &&
        (typeof orderId !== "string" || !isValidPaymentOrderId(orderId)))
    ) {
      clearPendingPaymentSession();
      return null;
    }

    if (
      !Number.isFinite(Date.parse(value.holdExpiresAt)) ||
      Date.parse(value.holdExpiresAt) <= Date.now()
    ) {
      clearPendingPaymentSession();
      return null;
    }

    return {
      bookingCode: value.bookingCode,
      paymentToken: value.paymentToken,
      holdExpiresAt: value.holdExpiresAt,
      showtimeId: value.showtimeId,
      seatIds: value.seatIds,
      ...(typeof orderId === "string" ? { orderId } : {}),
    };
  } catch {
    clearPendingPaymentSession();
    return null;
  }
};

export const clearPendingPaymentSession = (bookingCode?: string): void => {
  if (!sessionStorageAvailable()) return;
  try {
    if (bookingCode) {
      const current = getPendingPaymentSession();
      if (current && current.bookingCode !== bookingCode) return;
    }
    window.sessionStorage.removeItem(PAYMENT_SESSION_KEY);
  } catch (error) {
    console.error("Could not clear the pending payment session:", error);
  }
};

export const submitPayHereCheckout = (checkout: PayHereCheckout["checkout"]): void => {
  const action = new URL(checkout.action);
  if (
    action.href !== SANDBOX_CHECKOUT_URL ||
    action.protocol !== "https:" ||
    action.hostname !== "sandbox.payhere.lk"
  ) {
    throw new Error("The payment provider checkout URL is not allowed.");
  }
  for (const requiredField of [
    "merchant_id",
    "order_id",
    "currency",
    "amount",
    "hash",
  ]) {
    if (
      typeof checkout.fields[requiredField] !== "string" ||
      !checkout.fields[requiredField].trim()
    ) {
      throw new Error("The payment provider returned incomplete checkout fields.");
    }
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = action.href;
  form.enctype = "application/x-www-form-urlencoded";
  form.acceptCharset = "UTF-8";
  form.style.display = "none";

  for (const [name, value] of Object.entries(checkout.fields)) {
    if (!/^[a-z][a-z0-9_]*$/i.test(name) || typeof value !== "string") {
      throw new Error("The payment provider returned invalid checkout fields.");
    }
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.append(input);
  }

  document.body.append(form);
  HTMLFormElement.prototype.submit.call(form);
};
