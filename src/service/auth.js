import api from "./api";

// ===================== REGISTER =====================
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// ===================== LOGIN =====================
export const login = async (username, password) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response.data;
};

// ===================== GET MY DETAILS =====================
export const getMyDetails = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ===================== REFRESH TOKEN =====================
export const refreshToken = async (refreshToken) => {
  const response = await api.post("/auth/refresh", {
    refreshToken,
  });
  return response.data;
};