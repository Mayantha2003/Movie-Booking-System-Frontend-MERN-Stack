import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getSessionId,
  saveAccessToken,
} from "./tokenStorage";
import { isStaffPath } from "../utils/roles";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_URLS = ["/auth/login", "/auth/register", "/auth/refresh"];
const isAuthUrl = (url = ""): boolean => AUTH_URLS.some((path) => url.includes(path));

const getSentToken = (config?: InternalAxiosRequestConfig): string | null => {
  const headers = config?.headers;
  const value = headers?.get?.("Authorization") ?? headers?.Authorization;
  return typeof value === "string" ? value.replace(/^Bearer\s+/i, "") : null;
};

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

const endSession = (config?: InternalAxiosRequestConfig): void => {
  clearTokens();
  window.dispatchEvent(new CustomEvent("auth:logout"));

  const path = window.location.pathname;
  const onAuthPage = path === "/login" || path === "/register" || path === "/admin/login";

  if (!config?.skipAuthRedirect && !onAuthPage) {
    window.location.assign(isStaffPath(path) ? "/admin/login" : "/login");
  }
};

let refreshPromise: Promise<string> | null = null;
let refreshSessionId: number | null = null;

const refreshAccessToken = (): Promise<string> => {
  const sessionId = getSessionId();

  if (refreshPromise && refreshSessionId === sessionId) {
    return refreshPromise;
  }

  refreshSessionId = sessionId;

  const promise: Promise<string> = api
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

const retryWithToken = (config: InternalAxiosRequestConfig, token: string) => {
  config._retry = true;
  config.headers.Authorization = `Bearer ${token}`;
  return api(config);
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      original.skipAuthRefresh ||
      isAuthUrl(original.url)
    ) {
      return Promise.reject(error);
    }

    if (original._sessionId !== undefined && original._sessionId !== getSessionId()) {
      return Promise.reject(error);
    }

    const sentToken = getSentToken(original);
    if (!sentToken) {
      return Promise.reject(error);
    }

    const currentToken = getAccessToken();
    if (currentToken && currentToken !== sentToken) {
      return retryWithToken(original, currentToken);
    }

    if (!getRefreshToken()) {
      endSession(original);
      return Promise.reject(error);
    }

    try {
      const newToken = await refreshAccessToken();
      return retryWithToken(original, newToken);
    } catch (refreshError) {
      if (!(refreshError as AxiosError).response) {
        return Promise.reject(error);
      }
      endSession(original);
      return Promise.reject(error);
    }
  }
);

export default api;
