import api from "./api";

// GET /foods
export const getFoods = async () => {
  const response = await api.get("/foods");
  return response.data;
};