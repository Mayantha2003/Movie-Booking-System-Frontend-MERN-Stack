import api from "./api";
import type { ApiResponse, Offer } from "../types/api";

export const getOffers = async (): Promise<ApiResponse<Offer[]>> => {
  const response = await api.get<ApiResponse<Offer[]>>("/offers");
  return response.data;
};

export const getOfferByCode = async (code: string): Promise<ApiResponse<Offer>> => {
  const response = await api.get<ApiResponse<Offer>>(
    `/offers/code/${encodeURIComponent(code)}`
  );
  return response.data;
};
