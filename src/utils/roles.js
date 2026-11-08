export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
};

// Normalize backend roles
export const normalizeRole = (role) => {
  if (role === "SUPER_ADMIN") return ROLES.SUPER_ADMIN;
  if (role === "ADMIN") return ROLES.ADMIN;

  // USER, CUSTOMER and anything unknown get the lowest privilege
  return ROLES.USER;
};

// Check user permissions
export const hasRole = (user, allowed = []) => {
  return (
    Boolean(user) &&
    (allowed.length === 0 || allowed.includes(user.role))
  );
};

export const isStaffRole = (role) =>
  role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

// Where each role lives after logging in
const HOME_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: "/super-admin/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.USER]: "/",
};

export const getHomePath = (role) => HOME_BY_ROLE[role] ?? "/";

const isUnder = (pathname, base) =>
  pathname === base || pathname.startsWith(`${base}/`);

export const isStaffPath = (pathname = "") =>
  isUnder(pathname, "/admin") || isUnder(pathname, "/super-admin");

// Which role owns a path. null = not tied to a role.
const roleForPath = (pathname) => {
  if (isUnder(pathname, "/super-admin")) return ROLES.SUPER_ADMIN;
  if (pathname === "/admin/login") return null;
  if (isUnder(pathname, "/admin")) return ROLES.ADMIN;
  return ROLES.USER;
};

const AUTH_PAGES = ["/login", "/register", "/admin/login"];

// Decides where to send someone right after they log in.
// The page they were originally heading to (`from`) is only honoured when
// THIS role is allowed to open it. Otherwise they go to their own home.
// This stops a leftover `from` (e.g. /admin/dashboard) from sending a
// different account to the wrong area.
export const resolvePostLoginPath = (role, from) => {
  const home = getHomePath(role);
  const pathname = from?.pathname;

  if (!pathname || AUTH_PAGES.includes(pathname)) return home;
  if (roleForPath(pathname) !== role) return home;

  return `${pathname}${from.search ?? ""}`;
};