import api from "./api";
import type { RecommendationResponse } from "../types/api";

export const getTrendingPicks = async (): Promise<RecommendationResponse> => {
  const response = await api.get<RecommendationResponse>("/recommendations/trending");
  return response.data;
};