import api from "./api";

// GET /showtimes/movie/:movieId
export const getShowtimesByMovie = async (movieId) => {
  const response = await api.get(`/showtimes/movie/${movieId}`);
  return response.data;
};

// GET /showtimes/:id
export const getShowtimeById = async (id) => {
  const response = await api.get(`/showtimes/${id}`);
  return response.data;
};

// GET /showtimes/:id/seats
// Returns the array of booked seat ids, e.g. ["A-1", "B-8"].
// (This is the one function that returns the array directly instead of the
// full response body, because the seat map only needs the ids.)
export const getBookedSeats = async (id) => {
  const response = await api.get(`/showtimes/${id}/seats`);
  return response.data?.data?.bookedSeatIds ?? [];
};