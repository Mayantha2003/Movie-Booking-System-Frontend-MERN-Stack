import api from "./api";
import type {
  ApiResponse,
  Booking,
  BookingConfirmation,
  CreateBookingPayload,
  CreateBookingResponse,
} from "../types/api";

export const createBooking = async (
  bookingData: CreateBookingPayload
): Promise<CreateBookingResponse> => {
  const response = await api.post<CreateBookingResponse>(
    "/bookings",
    bookingData,
    { skipAuthRedirect: true }
  );
  return response.data;
};

export const getBookingByCode = async (
  code: string,
  verification?: { email: string; phone: string }
): Promise<ApiResponse<BookingConfirmation>> => {
  if (verification) {
    const response = await api.post<ApiResponse<BookingConfirmation>>(
      `/bookings/code/${encodeURIComponent(code)}`,
      verification
    );
    return response.data;
  }

  const response = await api.get<ApiResponse<BookingConfirmation>>(
    `/bookings/code/${encodeURIComponent(code)}`
  );
  return response.data;
};

export const getMyBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get<ApiResponse<Booking[]>>("/bookings/my-bookings");
  return response.data;
};

export const cancelBooking = async (id: string): Promise<ApiResponse<Booking>> => {
  const response = await api.put<ApiResponse<Booking>>(`/bookings/cancel/${id}`);
  return response.data;
};
