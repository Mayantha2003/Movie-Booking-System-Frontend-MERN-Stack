import { createContext } from "react";
import type {
  ApiResponse,
  LoginOptions,
  RegisterPayload,
  User,
} from "../types/auth";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (
    username: string,
    password: string,
    options?: LoginOptions
  ) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<ApiResponse<unknown>>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
