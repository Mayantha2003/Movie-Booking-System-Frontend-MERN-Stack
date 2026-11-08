import api from "./api";

// GET /offers
export const getOffers = async () => {
  const response = await api.get("/offers");
  return response.data;
};

// GET /offers/code/:code
export const getOfferByCode = async (code) => {
  const response = await api.get(`/offers/code/${encodeURIComponent(code)}`);
  return response.data;
};