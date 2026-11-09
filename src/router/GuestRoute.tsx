import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { LoadingState } from "../components/common/StateViews";

export default function GuestRoute() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <LoadingState label="Loading…" fullScreen />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}
