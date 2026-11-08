import api from "./api";

// POST /bookings  (works for guests AND logged-in users)
//
// bookingData = {
//   showtimeId,
//   seats: [{ row: "B", seatNumber: 8, seatId: "B-8" }],
//   foodItems: [{ foodId, quantity }],      // optional
//   offerCode: "SAVE20",                    // optional
//   guestInfo: { name, email, phone },      // required only for guests
// }
//
// The Authorization header is added automatically when the user is logged in.
// An expired token is refreshed and the request is retried with the same body,
// so selected seats are never lost.
// skipAuthRedirect keeps the user on the checkout page if the session cannot
// be renewed; the UI can show the error and offer a login instead.
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