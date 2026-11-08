import api from "./api";
import { getRefreshToken, startSession, clearTokens } from "./tokenStorage";
import { normalizeRole } from "../utils/roles";

// ===================== REGISTER =====================
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// ===================== LOGIN =====================
// The backend returns snake_case (access_token / refresh_token / role).
//
// options.acceptRoles (optional): if given, the login only succeeds for those
// roles. The check happens BEFORE anything is stored, so a rejected account
// never leaves tokens behind (used by the admin login page).
export const login = async (username, password, { acceptRoles } = {}) => {
  // skipAuth: never send a previous account's token with a login request.
  const response = await api.post(
    "/auth/login",
    { username, password },
    { skipAuth: true }
  );

  const data = response.data?.data;
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error("Login failed. The server did not return a session.");
  }

  if (acceptRoles?.length && !acceptRoles.includes(normalizeRole(data.role))) {
    const error = new Error("This account cannot sign in here.");
    error.code = "ROLE_NOT_ALLOWED";
    throw error;
  }

  // Replaces both tokens at once, so nothing from an older login survives.
  startSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });

  return response.data;
};

// ===================== LOGOUT =====================
export const logout = () => {
  clearTokens();
};

// ===================== GET MY DETAILS =====================
export const getMyDetails = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ===================== REFRESH TOKEN =====================
// Manual refresh. The interceptor in api.js already does this automatically.
// The backend expects the camelCase body key "refreshToken".
export const refreshToken = async (token = getRefreshToken()) => {
  const response = await api.post(
    "/auth/refresh",
    { refreshToken: token },
    { skipAuth: true }
  );
  return response.data;
};