import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { resolvePostLoginPath, type FromLocation } from "../utils/roles";
import { LoadingState } from "../components/common/StateViews";

export default function GuestRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingState label="Loading…" fullScreen />;
  if (user) {
    const from = (location.state as { from?: FromLocation } | null)?.from;
    return <Navigate to={resolvePostLoginPath(user.role, from)} replace />;
  }

  return <Outlet />;
}
