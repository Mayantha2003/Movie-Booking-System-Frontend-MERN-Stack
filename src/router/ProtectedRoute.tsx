import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getHomePath, hasRole, isStaffRole, type Role } from "../utils/roles";
import { LoadingState } from "../components/common/StateViews";
import Forbidden from "../pages/Forbidden";

export interface ProtectedRouteProps {
  roles?: Role[];
  allowGuests?: boolean;
  loginPath?: string;
}

export default function ProtectedRoute({
  roles = [],
  allowGuests = false,
  loginPath = "/login",
}: ProtectedRouteProps) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingState label="Checking your session..." fullScreen />;
  }

  if (!user) {
    if (allowGuests) return <Outlet />;
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !hasRole(user, roles)) {
    return isStaffRole(user.role) ? (
      <Navigate to={getHomePath(user.role)} replace />
    ) : (
      <Forbidden />
    );
  }

  return <Outlet />;
}
