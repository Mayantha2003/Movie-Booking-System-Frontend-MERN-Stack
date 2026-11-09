import api from "./api";

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData, {
    skipAuthRedirect: true,
  });
  return response.data;
};

// GET /bookings/code/:code  (public)
export const getBookingByCode = async (code) => {
  const response = await api.get(`/bookings/code/${encodeURIComponent(code)}`);
  return response.data;
};

// GET /bookings/my-bookings  (login required)
export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

// PUT /bookings/cancel/:id  (login required)
export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/cancel/${id}`);
  return response.data;
};