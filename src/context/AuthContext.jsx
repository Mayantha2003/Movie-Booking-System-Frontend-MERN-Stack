import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authStore";
import * as authService from "../service/auth";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
} from "../service/tokenStorage";
import { normalizeRole } from "../utils/roles";

// POST /auth/login -> data: { id, first_name, last_name, username, role, access_token, refresh_token }
const fromLogin = (d) => ({
  id: d.id,
  firstName: d.first_name,
  lastName: d.last_name,
  username: d.username,
  role: normalizeRole(d.role),
});

// GET /auth/me -> data: the user document without the password
const fromMe = (d) => ({
  id: d._id,
  firstName: d.first_name,
  lastName: d.last_name,
  username: d.username,
  email: d.email,
  phone: d.phone,
  role: normalizeRole(d.user_role),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we are restoring a session from a stored token after a page reload.
  const [initializing, setInitializing] = useState(Boolean(getAccessToken()));

  // Restore the session on first load. api.js refreshes an expired access token automatically.
  // The role always comes from the server (/auth/me), never from browser storage.
  useEffect(() => {
    if (!getAccessToken()) return undefined;
    let cancelled = false;

    authService
      .getMyDetails()
      .then((res) => !cancelled && setUser(fromMe(res.data)))
      .catch((error) => {
        // Only drop the tokens when the server really rejected them. A network error keeps them.
        if (!cancelled && error.response) authService.logout();
      })
      .finally(() => !cancelled && setInitializing(false));

    return () => { cancelled = true; };
  }, []);

  // api.js dispatches this when a refresh token is rejected (the session is over).
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  // Keep this tab in step with other tabs. Without this, logging in as an admin
  // in one tab leaves another tab showing the previous (customer) account while
  // its requests already use the admin's token.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.storageArea !== window.localStorage) return;

      const isTokenEvent =
        e.key === null || e.key === ACCESS_TOKEN_KEY || e.key === REFRESH_TOKEN_KEY;
      if (!isTokenEvent) return;

      // Logged out in another tab.
      if (!getAccessToken()) {
        setUser(null);
        return;
      }

      // A new login happened in another tab (it writes the refresh token last).
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

  // options.acceptRoles: optional list of roles allowed to sign in from the calling page.
  // The role comes from the backend login response.
  const login = useCallback(async (username, password, options) => {
    const res = await authService.login(username, password, options); // stores both tokens
    const next = fromLogin(res.data);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
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