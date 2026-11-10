import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
} from "../service/tokenStorage";
import { restoreSession, signedOut } from "./authSlice";
import type { AppStore } from "./makeStore";

export function attachSessionListeners(store: AppStore): () => void {
  const onLogout = () => store.dispatch(signedOut());

  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return;

    const isTokenEvent =
      event.key === null ||
      event.key === ACCESS_TOKEN_KEY ||
      event.key === REFRESH_TOKEN_KEY;
    if (!isTokenEvent) return;

    if (!getAccessToken()) {
      store.dispatch(signedOut());
      return;
    }

    if (event.key === REFRESH_TOKEN_KEY) {
      void store.dispatch(restoreSession());
    }
  };

  window.addEventListener("auth:logout", onLogout);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("auth:logout", onLogout);
    window.removeEventListener("storage", onStorage);
  };
}
