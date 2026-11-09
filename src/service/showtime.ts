import api from "./api";
import type { ApiResponse, BookedSeatsData, PopulatedShowtime } from "../types/api";

export const getShowtimesByMovie = async (
  movieId: string
): Promise<ApiResponse<PopulatedShowtime[]>> => {
  const response = await api.get<ApiResponse<PopulatedShowtime[]>>(
    `/showtimes/movie/${movieId}`
  );
  return response.data;
};

export const getShowtimeById = async (
  id: string
): Promise<ApiResponse<PopulatedShowtime>> => {
  const response = await api.get<ApiResponse<PopulatedShowtime>>(`/showtimes/${id}`);
  return response.data;
};

export const getBookedSeats = async (id: string): Promise<string[]> => {
  const response = await api.get<ApiResponse<BookedSeatsData>>(`/showtimes/${id}/seats`);
  return response.data?.data?.bookedSeatIds ?? [];
};
