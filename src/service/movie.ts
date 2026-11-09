import api from "./api";
import type { ApiResponse, Movie } from "../types/api";

export const getNowShowing = async (): Promise<ApiResponse<Movie[]>> => {
  const response = await api.get<ApiResponse<Movie[]>>("/movies/now-showing");
  return response.data;
};

export const getComingSoon = async (): Promise<ApiResponse<Movie[]>> => {
  const response = await api.get<ApiResponse<Movie[]>>("/movies/coming-soon");
  return response.data;
};

export const getMovieById = async (id: string): Promise<ApiResponse<Movie>> => {
  const response = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
  return response.data;
};
