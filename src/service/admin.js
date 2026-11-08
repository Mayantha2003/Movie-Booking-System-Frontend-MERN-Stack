import api from "./api";

// Everything the ADMIN console calls. api.js attaches the access token.

const body = (res) => res.data;

// POST / PUT / DELETE (and PATCH /:id/toggle) for one resource.
const resource = (path) => ({
  create: (data) => api.post(path, data).then(body),
  update: (id, data) => api.put(`${path}/${id}`, data).then(body),
  remove: (id) => api.delete(`${path}/${id}`).then(body),
  toggle: (id) => api.patch(`${path}/${id}/toggle`).then(body),
});

// GET /admin/stats -> data: { movies, bookings, users, revenue, recentBookings }
export const getAdminStats = () => api.get("/admin/stats").then(body);

// Lists. The public movie / food / offer lists hide inactive items,
// so the console reads its own /admin/* lists.
export const getMovies = () => api.get("/admin/movies").then(body);
export const getFoods = () => api.get("/admin/foods").then(body);
export const getOffers = () => api.get("/admin/offers").then(body);
export const getCinemas = () => api.get("/cinemas").then(body);
export const getScreens = () => api.get("/screens").then(body);
export const getShowtimes = () => api.get("/showtimes").then(body);
export const getUsers = () => api.get("/admin/users").then(body);
export const getBookings = () => api.get("/bookings").then(body);

export const movieApi = resource("/movies");
export const cinemaApi = resource("/cinemas");
export const screenApi = resource("/screens");
export const showtimeApi = resource("/showtimes");
export const foodApi = resource("/foods");
export const offerApi = resource("/offers");

// Customer accounts. Admins cannot touch ADMIN / SUPER_ADMIN accounts here.
export const userApi = {
  create: (data) => api.post("/admin/users", data).then(body),
  update: (id, data) => api.put(`/admin/users/${id}`, data).then(body),
  remove: (id) => api.delete(`/admin/users/${id}`).then(body),
  setStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }).then(body),
};

// POST /movies/upload-image?kind=poster|banner   (multipart form, field "image")
// -> data: { url, path }   url is the full public Supabase link.
export const uploadMovieImage = (file, kind = "poster") => {
  const form = new FormData();
  form.append("image", file);
  return api
    .post("/movies/upload-image", form, { params: { kind }, headers: { "Content-Type": "multipart/form-data" } })
    .then(body);
};