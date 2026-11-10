import {
  createSlice,
  type PayloadAction,
  type ThunkAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { UnknownAction } from "redux";
import * as authService from "../service/auth";
import { getAccessToken } from "../service/tokenStorage";
import { normalizeRole } from "../utils/roles";
import type { LoginData, LoginOptions, MeData, User } from "../types/auth";

export interface AuthState {
  user: User | null;
  initializing: boolean;
}

interface AuthRootState {
  auth: AuthState;
}

const fromLogin = (data: LoginData): User => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  username: data.username,
  role: normalizeRole(data.role),
});

const fromMe = (data: MeData): User => ({
  id: data._id,
  firstName: data.first_name,
  lastName: data.last_name,
  username: data.username,
  email: data.email,
  phone: data.phone,
  role: normalizeRole(data.user_role),
});

const authSlice = createSlice({
  name: "auth",
  initialState: (): AuthState => ({
    user: null,
    initializing: Boolean(getAccessToken()),
  }),
  reducers: {
    signedIn(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.initializing = false;
    },
    signedOut(state) {
      state.user = null;
      state.initializing = false;
    },
    restoreFinished(state) {
      state.initializing = false;
    },
  },
});

export const { signedIn, signedOut, restoreFinished } = authSlice.actions;
export default authSlice.reducer;

export const restoreSession = (): ThunkAction<
  Promise<void>,
  AuthRootState,
  unknown,
  UnknownAction
> => async (dispatch) => {
  if (!getAccessToken()) {
    dispatch(restoreFinished());
    return;
  }

  try {
    const response = await authService.getMyDetails();
    dispatch(signedIn(fromMe(response.data)));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) authService.logout();
    dispatch(restoreFinished());
  }
};

export const loginUser =
  (
    username: string,
    password: string,
    options?: LoginOptions
  ): ThunkAction<Promise<User>, AuthRootState, unknown, UnknownAction> =>
  async (dispatch) => {
    const response = await authService.login(username, password, options);
    const user = fromLogin(response.data);
    dispatch(signedIn(user));
    return user;
  };

export const logoutUser = (): ThunkAction<
  void,
  AuthRootState,
  unknown,
  UnknownAction
> => (dispatch) => {
  authService.logout();
  dispatch(signedOut());
};
