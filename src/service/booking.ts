import api from "./api";
import type { ApiResponse, Booking, CreateBookingPayload } from "../types/api";

export const createBooking = async (
  bookingData: CreateBookingPayload
): Promise<ApiResponse<Booking>> => {
  const response = await api.post<ApiResponse<Booking>>("/bookings", bookingData, {
    skipAuthRedirect: true,
  });
  return response.data;
};

export const getBookingByCode = async (code: string): Promise<ApiResponse<Booking>> => {
  const response = await api.get<ApiResponse<Booking>>(
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
