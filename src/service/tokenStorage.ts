export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
export const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";

// Counts how many times the session has been started or ended in THIS tab.
// api.ts uses it to discard results that belong to a session that already ended.
let sessionId = 0;

export const getSessionId = (): number => sessionId;

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

// LOGIN: replaces BOTH tokens together and starts a new session.
export const startSession = ({ accessToken, refreshToken }: Partial<SessionTokens> = {}): void => {
  if (!accessToken || !refreshToken) {
    throw new Error("Both an access token and a refresh token are required.");
  }
  sessionId += 1;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// REFRESH: only the access token changes; it is still the same session.
export const saveAccessToken = (accessToken?: string | null): void => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

// LOGOUT / SESSION EXPIRED: removes both tokens and ends the session.
export const clearTokens = (): void => {
  sessionId += 1;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};