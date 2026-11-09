import api from "./api";

// GET /screens/:id  (public)
// data: { _id, cinema, name, screenType, totalSeats, rows, seatsPerRow, seatLayout? }
// The seat map is built from rows / seatsPerRow (or seatLayout when the admin set one).
export const getScreenById = async (id) => {
  const response = await api.get(`/screens/${id}`);
  return response.data;
};