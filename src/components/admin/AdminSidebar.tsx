
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "◫" },
  { name: "Movies", path: "/admin/movies", icon: "🎬" },
  { name: "Bookings", path: "/admin/bookings", icon: "🎟️" },
  { name: "Cinemas", path: "/admin/cinemas", icon: "🏢" },
  { name: "Screens", path: "/admin/screens", icon: "🖥️" },
  { name: "Showtimes", path: "/admin/showtimes", icon: "🕒" },
  { name: "Foods", path: "/admin/foods", icon: "🍿" },
  { name: "Offers", path: "/admin/offers", icon: "🎁" },
  { name: "Users", path: "/admin/users", icon: "👥" },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-[#111827] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-red-500">
          CINEMA<span className="text-white">ADMIN</span>
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          Movie Booking Management
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 md:flex-1 md:flex-col">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-sm font-semibold">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="mb-4 text-xs text-gray-400">
          {user?.role}
        </p>

        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-white/10 px-4 py-3 text-sm text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
