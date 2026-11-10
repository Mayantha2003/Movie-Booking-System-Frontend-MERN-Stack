import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, logoutUser } from "../store/authSlice";
import { register } from "../service/auth";
import type {
  ApiResponse,
  LoginOptions,
  RegisterPayload,
  User,
} from "../types/auth";

export interface AuthApi {
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

export default function useAuth(): AuthApi {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const initializing = useAppSelector((state) => state.auth.initializing);

  const login = useCallback<AuthApi["login"]>(
    (username, password, options) =>
      dispatch(loginUser(username, password, options)),
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      register,
      logout,
    }),
    [user, initializing, login, logout]
  );
}
