export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Normalize backend roles
export const normalizeRole = (role?: string | null): Role => {
  if (role === "SUPER_ADMIN") return ROLES.SUPER_ADMIN;
  if (role === "ADMIN") return ROLES.ADMIN;
  // USER, CUSTOMER and anything unknown get the lowest privilege
  return ROLES.USER;
};

export const hasRole = (
  user: { role: Role } | null | undefined,
  allowed: readonly Role[] = []
): boolean =>
  Boolean(user) && (allowed.length === 0 || allowed.includes(user!.role));

export const isStaffRole = (role?: Role | null): boolean =>
  role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

const HOME_BY_ROLE: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "/super-admin/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.USER]: "/",
};

export const getHomePath = (role?: Role | null): string =>
  (role && HOME_BY_ROLE[role]) ?? "/";

const isUnder = (pathname: string, base: string): boolean =>
  pathname === base || pathname.startsWith(`${base}/`);

export const isStaffPath = (pathname = ""): boolean =>
  isUnder(pathname, "/admin") || isUnder(pathname, "/super-admin");

const roleForPath = (pathname: string): Role | null => {
  if (isUnder(pathname, "/super-admin")) return ROLES.SUPER_ADMIN;
  if (pathname === "/admin/login") return null;
  if (isUnder(pathname, "/admin")) return ROLES.ADMIN;
  return ROLES.USER;
};

const AUTH_PAGES = ["/login", "/register", "/admin/login"];

export interface FromLocation {
  pathname?: string;
  search?: string;
}

// The page they were heading to (`from`) is only honoured when THIS role may open it.
export const resolvePostLoginPath = (
  role: Role,
  from?: FromLocation | null
): string => {
  const home = getHomePath(role);
  const pathname = from?.pathname;

  if (!pathname || AUTH_PAGES.includes(pathname)) return home;
  if (roleForPath(pathname) !== role) return home;

  return `${pathname}${from?.search ?? ""}`;
};