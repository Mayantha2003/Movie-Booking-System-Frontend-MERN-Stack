import api from "./api";
import type { ApiResponse, Food } from "../types/api";

export const getFoods = async (): Promise<ApiResponse<Food[]>> => {
  const response = await api.get<ApiResponse<Food[]>>("/foods");
  return response.data;
};
