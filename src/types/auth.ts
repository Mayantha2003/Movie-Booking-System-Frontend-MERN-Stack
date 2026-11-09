import type { Role } from "../utils/roles";
import type { ApiResponse } from "./api";

export type { ApiResponse };

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: Role;
  email?: string;
  phone?: string;
}

export interface LoginData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface MeData {
  _id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  phone?: string;
  user_role: string;
}

export interface LoginOptions {
  acceptRoles?: readonly Role[];
}

export type RegisterPayload = Record<string, unknown>;
