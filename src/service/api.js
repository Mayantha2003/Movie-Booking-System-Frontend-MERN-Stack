import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  getSessionId,
  saveAccessToken,
  clearTokens,
} from "./tokenStorage";
import { isStaffPath } from "../utils/roles";

// The ONE axios instance for the whole app. Every service imports this file.
const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Per-request options you can pass in the axios config:
//   skipAuth:         don't attach the Bearer token (used by login and refresh)
//   skipAuthRefresh:  on 401, don't try to refresh the token
//   skipAuthRedirect: if the session ends, don't redirect to the login page
//                     (used by createBooking so the page, and the seats the
//                     user selected, stay exactly as they are)

// Auth endpoints where a 401/403 is a normal answer (wrong password, bad
// refresh token), not an expired session.
const AUTH_URLS = ["/auth/login", "/auth/register", "/auth/refresh"];
const isAuthUrl = (url = "") => AUTH_URLS.some((path) => url.includes(path));

const getSentToken = (config) => {
  const headers = config?.headers;
  const value = headers?.get?.("Authorization") ?? headers?.Authorization;
  return typeof value === "string" ? value.replace(/^Bearer\s+/i, "") : null;
};

// ---------- REQUEST: attach the access token when there is one ----------
// Guests have no token, so their requests are sent without the header.
// Each request also remembers which session it was made in.
api.interceptors.request.use(
  (config) => {
    config._sessionId = getSessionId();

    const token = getAccessToken();

    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Session end ----------
const endSession = (config) => {
  clearTokens();
  window.dispatchEvent(new CustomEvent("auth:logout"));

  const path = window.location.pathname;
  const onAuthPage =
    path === "/login" || path === "/register" || path === "/admin/login";

  if (!config?.skipAuthRedirect && !onAuthPage) {
    // Staff areas have their own login page.
    window.location.assign(isStaffPath(path) ? "/admin/login" : "/login");
  }
};

// ---------- Refresh: one call shared by every request that needs it ----------
let refreshPromise = null;
let refreshSessionId = null;

const refreshAccessToken = () => {
  const sessionId = getSessionId();

  // Share the in-flight refresh only if it belongs to the current session.
  if (refreshPromise && refreshSessionId === sessionId) {
    return refreshPromise;
  }

  refreshSessionId = sessionId;

  const promise = api
    .post(
      "/auth/refresh",
      { refreshToken: getRefreshToken() },
      { skipAuth: true, skipAuthRefresh: true }
    )
    .then((response) => {
      const newAccessToken = response.data?.data?.access_token;
      if (!newAccessToken) {
        throw new Error("Refresh response had no access token");
      }

      // The user logged out (or another account logged in) while this
      // refresh was in flight. Do NOT write the old account's token back.
      if (getSessionId() !== sessionId) {
        throw new Error("Session changed during token refresh");
      }

      saveAccessToken(newAccessToken);
      return newAccessToken;
    })
    .finally(() => {
      if (refreshPromise === promise) refreshPromise = null;
    });

  refreshPromise = promise;
  return promise;
};

const retryWithToken = (config, token) => {
  config._retry = true;
  config.headers.Authorization = `Bearer ${token}`;
  return api(config);
};

// ---------- RESPONSE: refresh an expired token, then retry once ----------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Only a 401 on a normal request that has not been retried yet.
    if (
      status !== 401 ||
      !original ||
      original._retry ||
      original.skipAuthRefresh ||
      isAuthUrl(original.url)
    ) {
      return Promise.reject(error);
    }

    // The request belongs to a session that has already ended. Never retry it
    // with a newer account's token and never let it end the new session.
    if (
      original._sessionId !== undefined &&
      original._sessionId !== getSessionId()
    ) {
      return Promise.reject(error);
    }

    // Guest request (no token was sent): nothing to refresh, nothing to log out.
    const sentToken = getSentToken(original);
    if (!sentToken) {
      return Promise.reject(error);
    }

    // Another request already refreshed the token while this one was in flight.
    const currentToken = getAccessToken();
    if (currentToken && currentToken !== sentToken) {
      return retryWithToken(original, currentToken);
    }

    // Token was sent but we have nothing to refresh it with.
    if (!getRefreshToken()) {
      endSession(original);
      return Promise.reject(error);
    }

    try {
      const newToken = await refreshAccessToken();
      return retryWithToken(original, newToken);
    } catch (refreshError) {
      // Server unreachable (or the session changed mid-refresh): keep the
      // current session, let the caller show the error.
      if (!refreshError.response) {
        return Promise.reject(error);
      }
      // Refresh token rejected or expired: the session is really over.
      endSession(original);
      return Promise.reject(error);
    }
  }
);

export default api;