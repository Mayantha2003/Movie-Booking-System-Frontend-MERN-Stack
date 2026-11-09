import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { AuthContext, type AuthContextValue } from "./authStore";
import * as authService from "../service/auth";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
} from "../service/tokenStorage";
import { normalizeRole } from "../utils/roles";
import type { LoginData, MeData, User } from "../types/auth";

const fromLogin = (d: LoginData): User => ({
  id: d.id,
  firstName: d.first_name,
  lastName: d.last_name,
  username: d.username,
  role: normalizeRole(d.role),
});

const fromMe = (d: MeData): User => ({
  id: d._id,
  firstName: d.first_name,
  lastName: d.last_name,
  username: d.username,
  email: d.email,
  phone: d.phone,
  role: normalizeRole(d.user_role),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(Boolean(getAccessToken()));

  useEffect(() => {
    if (!getAccessToken()) return undefined;
    let cancelled = false;

    authService
      .getMyDetails()
      .then((res) => {
        if (!cancelled) setUser(fromMe(res.data));
      })
      .catch((error: unknown) => {
        if (!cancelled && axios.isAxiosError(error) && error.response) {
          authService.logout();
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;

      const isTokenEvent =
        e.key === null || e.key === ACCESS_TOKEN_KEY || e.key === REFRESH_TOKEN_KEY;
      if (!isTokenEvent) return;

      if (!getAccessToken()) {
        setUser(null);
        return;
      }

      if (e.key === REFRESH_TOKEN_KEY) {
        authService
          .getMyDetails()
          .then((res) => setUser(fromMe(res.data)))
          .catch(() => {});
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async (username, password, options) => {
      const res = await authService.login(username, password, options);
      const next = fromLogin(res.data);
      setUser(next);
      return next;
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      register: authService.register,
      logout,
    }),
    [user, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
