// Single place that reads/writes the auth tokens in localStorage.
// Uses the same keys your Navbar already reads: ACCESS_TOKEN and REFRESH_TOKEN.
// Kept separate from api.js / auth.js so they never import each other in a circle.

export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
export const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";

// Counts how many times the session has been started or ended in THIS tab.
// api.js uses it to throw away the result of any request or token refresh
// that belongs to a session that has already ended (e.g. user A logged out
// while a refresh was still in flight, then user B logged in).
let sessionId = 0;

export const getSessionId = () => sessionId;

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// LOGIN: replaces BOTH tokens together and starts a new session.
// Writing only one of them could leave the previous account's refresh token
// next to the new account's access token.
export const startSession = ({ accessToken, refreshToken } = {}) => {
  if (!accessToken || !refreshToken) {
    throw new Error("Both an access token and a refresh token are required.");
  }
  sessionId += 1;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// REFRESH: only the access token changes; it is still the same session.
export const saveAccessToken = (accessToken) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

// LOGOUT / SESSION EXPIRED: removes both tokens and ends the session.
export const clearTokens = () => {
  sessionId += 1;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};