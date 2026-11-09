import api from "./api";
import type {
  AdminStats,
  AdminUser,
  ApiResponse,
  Booking,
  Cinema,
  Food,
  Movie,
  Offer,
  Payload,
  Screen,
  Showtime,
  UploadedImage,
  UserStatus,
} from "../types/api";

const body = <T>(res: { data: T }): T => res.data;

const resource = <T>(path: string) => ({
  create: (data: Payload) => api.post<ApiResponse<T>>(path, data).then(body),
  update: (id: string, data: Payload) =>
    api.put<ApiResponse<T>>(`${path}/${id}`, data).then(body),
  remove: (id: string) => api.delete<ApiResponse<null>>(`${path}/${id}`).then(body),
  toggle: (id: string) => api.patch<ApiResponse<T>>(`${path}/${id}/toggle`).then(body),
});

export const getAdminStats = () =>
  api.get<ApiResponse<AdminStats>>("/admin/stats").then(body);

export const getMovies = () => api.get<ApiResponse<Movie[]>>("/admin/movies").then(body);
export const getFoods = () => api.get<ApiResponse<Food[]>>("/admin/foods").then(body);
export const getOffers = () => api.get<ApiResponse<Offer[]>>("/admin/offers").then(body);
export const getCinemas = () => api.get<ApiResponse<Cinema[]>>("/cinemas").then(body);
export const getScreens = () => api.get<ApiResponse<Screen[]>>("/screens").then(body);
export const getShowtimes = () => api.get<ApiResponse<Showtime[]>>("/showtimes").then(body);
export const getUsers = () => api.get<ApiResponse<AdminUser[]>>("/admin/users").then(body);
export const getBookings = () => api.get<ApiResponse<Booking[]>>("/bookings").then(body);

export const movieApi = resource<Movie>("/movies");
export const cinemaApi = resource<Cinema>("/cinemas");
export const screenApi = resource<Screen>("/screens");
export const showtimeApi = resource<Showtime>("/showtimes");
export const foodApi = resource<Food>("/foods");
export const offerApi = resource<Offer>("/offers");

export const userApi = {
  create: (data: Payload) =>
    api.post<ApiResponse<AdminUser>>("/admin/users", data).then(body),
  update: (id: string, data: Payload) =>
    api.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data).then(body),
  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/users/${id}`).then(body),
  setStatus: (id: string, status: UserStatus) =>
    api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { status }).then(body),
};

export const uploadMovieImage = (file: File, kind: "poster" | "banner" = "poster") => {
  const form = new FormData();
  form.append("image", file);
  return api
    .post<ApiResponse<UploadedImage>>("/movies/upload-image", form, {
      params: { kind },
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(body);
};
