import api from "./api";

// All of these need a SUPER_ADMIN access token (api.js attaches it).

// GET /super-admin/stats -> data: { admins, users, movies, bookings, revenue }
export const getStats = async () => (await api.get("/super-admin/stats")).data;

// GET /super-admin/admins -> data: [ { _id, first_name, last_name, username, email, phone, user_status, createdAt } ]
export const getAdmins = async () => (await api.get("/super-admin/admins")).data;

// POST /auth/create-admin
export const createAdmin = async (values) => {
  const payload = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
  };
  if (values.phone.trim()) payload.phone = values.phone.trim();
  return (await api.post("/auth/create-admin", payload)).data;
};

// PATCH /super-admin/admins/:id/status  body: { status: "ACTIVE" | "BLOCKED" }
export const setAdminStatus = async (id, status) =>
  (await api.patch(`/super-admin/admins/${id}/status`, { status })).data;

// DELETE /super-admin/admins/:id
export const deleteAdmin = async (id) =>
  (await api.delete(`/super-admin/admins/${id}`)).data;