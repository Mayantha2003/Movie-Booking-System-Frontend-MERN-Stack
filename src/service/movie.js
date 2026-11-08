import api from "./api";

// GET /movies/now-showing
export const getNowShowing = async () => {
  const response = await api.get("/movies/now-showing");
  return response.data;
};

// GET /movies/coming-soon
export const getComingSoon = async () => {
  const response = await api.get("/movies/coming-soon");
  return response.data;
};

// GET /movies/:id
export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};