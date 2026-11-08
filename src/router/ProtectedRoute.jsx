import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getHomePath, hasRole, isStaffRole } from "../utils/roles";
import { LoadingState } from "../components/common/StateViews";
import Forbidden from "../pages/Forbidden";

// Protect routes by login state and role.
//   roles:       only these roles may enter (empty = any logged-in user)
//   allowGuests: let people who are NOT logged in through (public pages that
//                are still closed to the wrong role, e.g. the customer home page)
//   loginPath:   where guests are sent (staff areas use /admin/login)
export default function ProtectedRoute({
  roles = [],
  allowGuests = false,
  loginPath = "/login",
}) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  // Check authentication status
  if (initializing) {
    return (
      <LoadingState
        label="Checking your session..."
        fullScreen
      />
    );
  }

  // Guests
  if (!user) {
    if (allowGuests) return <Outlet />;

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location }}
      />
    );
  }

  // Logged in, but the role is not allowed here
  if (roles.length > 0 && !hasRole(user, roles)) {
    // Staff are sent back to their own dashboard; customers see a 403.
    return isStaffRole(user.role)
      ? <Navigate to={getHomePath(user.role)} replace />
      : <Forbidden />;
  }

  // Allow access
  return <Outlet />;
}