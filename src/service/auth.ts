import api from "./api";
import { clearTokens, getRefreshToken, startSession } from "./tokenStorage";
import { normalizeRole } from "../utils/roles";
import type {
  ApiResponse,
  LoginData,
  LoginOptions,
  MeData,
  RegisterPayload,
} from "../types/auth";

export const register = async (userData: RegisterPayload) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (
  username: string,
  password: string,
  { acceptRoles }: LoginOptions = {}
): Promise<ApiResponse<LoginData>> => {
  const response = await api.post<ApiResponse<LoginData>>(
    "/auth/login",
    { username, password },
    { skipAuth: true }
  );

  const data = response.data?.data;
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error("Login failed. The server did not return a session.");
  }

  if (acceptRoles?.length && !acceptRoles.includes(normalizeRole(data.role))) {
    const error = new Error("This account cannot sign in here.") as Error & {
      code?: string;
    };
    error.code = "ROLE_NOT_ALLOWED";
    throw error;
  }

  startSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });

  return response.data;
};

export const logout = (): void => {
  clearTokens();
};

export const getMyDetails = async (): Promise<ApiResponse<MeData>> => {
  const response = await api.get<ApiResponse<MeData>>("/auth/me");
  return response.data;
};

export const refreshToken = async (token: string | null = getRefreshToken()) => {
  const response = await api.post(
    "/auth/refresh",
    { refreshToken: token },
    { skipAuth: true }
  );
  return response.data;
};
