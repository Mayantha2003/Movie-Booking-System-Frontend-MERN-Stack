import api from "./api";
import type { ApiResponse, Screen } from "../types/api";

export const getScreenById = async (id: string): Promise<ApiResponse<Screen>> => {
  const response = await api.get<ApiResponse<Screen>>(`/screens/${id}`);
  return response.data;
};
