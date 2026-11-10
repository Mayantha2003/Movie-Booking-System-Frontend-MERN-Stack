import { makeStore } from "./makeStore";
import { restoreSession } from "./authSlice";
import { attachSessionListeners } from "./sessionSync";

export const store = makeStore();

attachSessionListeners(store);
void store.dispatch(restoreSession());

export type { AppDispatch, RootState } from "./makeStore";
