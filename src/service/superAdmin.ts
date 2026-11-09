import api from "./api";
import type { AdminUser, ApiResponse, SuperAdminStats } from "../types/api";

export const getStats = async (): Promise<ApiResponse<SuperAdminStats>> =>
  (await api.get<ApiResponse<SuperAdminStats>>("/super-admin/stats")).data;

export const getAdmins = async (): Promise<ApiResponse<AdminUser[]>> =>
  (await api.get<ApiResponse<AdminUser[]>>("/super-admin/admins")).data;

export const createAdmin = async (values: {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  const payload = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
  };

  if (values.phone?.trim()) {
    Object.assign(payload, { phone: values.phone.trim() });
  }

  return (await api.post<ApiResponse<AdminUser>>("/auth/create-admin", payload)).data;
};

export const setAdminStatus = async (id: string, status: "ACTIVE" | "BLOCKED") =>
  (await api.patch<ApiResponse<AdminUser>>(`/super-admin/admins/${id}/status`, { status })).data;

export const deleteAdmin = async (id: string) =>
  (await api.delete<ApiResponse<null>>(`/super-admin/admins/${id}`)).data;
