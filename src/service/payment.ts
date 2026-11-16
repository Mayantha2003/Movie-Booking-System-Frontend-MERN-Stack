
import api from "./api";
import type { ApiResponse } from "../types/api";

const PAYMENT_SESSION_KEY = "movie-booking-pending-payment";

const BOOKING_CODE_PATTERN =
  /^BK-(?:[A-HJ-NP-Z2-9]{6}|[A-HJ-NP-Z2-9]{26})$/i;

export interface PendingPaymentSession {
  bookingCode: string;
  paymentToken: string;
  holdExpiresAt: string;
  showtimeId: string;
  seatIds: string[];
}

export interface DemoPaymentResponse {
  orderId: string;
  status: string;
  bookingStatus: string;
  paymentStatus?: string;
  amount: number;
  currency: string;
}

export const submitDemoCardPayment = async (input: {
  bookingCode: string;
  paymentToken: string;
}): Promise<DemoPaymentResponse> => {
  const response = await api.post<ApiResponse<DemoPaymentResponse>>(
    "/payments/demo",
    {
      bookingCode: input.bookingCode,
      paymentToken: input.paymentToken,
    },
    { skipAuthRedirect: true }
  );

  return response.data.data;
};

const sessionStorageAvailable = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
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

export const savePendingPaymentSession = (
  session: PendingPaymentSession
): void => {
  if (!sessionStorageAvailable()) {
    throw new Error("This browser cannot save the payment session.");
  }

  window.sessionStorage.setItem(
    PAYMENT_SESSION_KEY,
    JSON.stringify(session)
  );
};


export const getPendingPaymentSession =
  (): PendingPaymentSession | null => {
    if (!sessionStorageAvailable()) return null;

    try {
      const stored = window.sessionStorage.getItem(PAYMENT_SESSION_KEY);
      if (!stored) return null;

      const value = JSON.parse(stored) as PendingPaymentSession;

      if (
        !value ||
        typeof value.bookingCode !== "string" ||
        typeof value.paymentToken !== "string" ||
        typeof value.holdExpiresAt !== "string" ||
        typeof value.showtimeId !== "string" ||
        !Array.isArray(value.seatIds)
      ) {
        return null;
      }

      return value;
    } catch {
      return null;
    }
  };


export const clearPendingPaymentSession = (
  bookingCode?: string
): void => {
  if (!sessionStorageAvailable()) return;

  try {
    if (bookingCode) {
      const current = getPendingPaymentSession();

      if (current && current.bookingCode !== bookingCode) return;
    }

    window.sessionStorage.removeItem(PAYMENT_SESSION_KEY);
  } catch (error) {
    console.error("Could not clear payment session:", error);
  }
};
