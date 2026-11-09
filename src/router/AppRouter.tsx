import { Navigate, Route, Routes } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/roles";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import MovieDetails from "../pages/MovieDetails";
import SeatSelection from "../pages/SeatSelection";
import BookingSummary from "../pages/BookingSummary";
import BookingConfirmation from "../pages/BookingConfirmation";

import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import Movies from "../pages/admin/Movies";
import Bookings from "../pages/admin/Bookings";
import Cinemas from "../pages/admin/Cinemas";
import Screens from "../pages/admin/Screens";
import Showtimes from "../pages/admin/Showtimes";
import Foods from "../pages/admin/Foods";
import Offers from "../pages/admin/Offers";
import Users from "../pages/admin/Users";

import SuperAdminLayout from "../components/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import ManageAdmins from "../pages/ManageAdmins";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<ProtectedRoute roles={[ROLES.USER]} allowGuests />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:movieId" element={<MovieDetails />} />
        <Route path="/booking/:showtimeId/seats" element={<SeatSelection />} />
        <Route path="/booking/:showtimeId/summary" element={<BookingSummary />} />
        <Route path="/booking/confirmation/:code" element={<BookingConfirmation />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route
        element={<ProtectedRoute roles={[ROLES.ADMIN]} loginPath="/admin/login" />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="movies" element={<Movies />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="cinemas" element={<Cinemas />} />
          <Route path="screens" element={<Screens />} />
          <Route path="showtimes" element={<Showtimes />} />
          <Route path="foods" element={<Foods />} />
          <Route path="offers" element={<Offers />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      <Route
        element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} loginPath="/admin/login" />}
      >
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="admins" element={<ManageAdmins />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
