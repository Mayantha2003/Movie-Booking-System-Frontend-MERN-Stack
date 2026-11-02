import { Link, useNavigate } from "react-router-dom";
import { ClapperLogo, SearchIcon, PinIcon, UserIcon, HomeIcon } from "./Icons";

const Navbar = ({ search, setSearch }) => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("ACCESS_TOKEN"));

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    navigate("/login");
  };

  return (
    <header className="border-b border-[#E2E8F0] bg-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <ClapperLogo />
          <span className="text-lg font-extrabold leading-none text-[#C8102E]">
            Movie Booking
            <span className="block text-xs font-semibold text-[#64748B]">System</span>
          </span>
        </Link>

        <Link
          to="/"
          className="ml-2 flex items-center gap-2 rounded-full bg-[#FFF1F2] px-4 py-2 text-sm font-semibold text-[#C8102E]"
        >
          <HomeIcon /> Home
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm focus:border-[#C8102E] focus:outline-none sm:w-56"
            />
          </div>

          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <PinIcon /> Colombo
          </span>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#E11D48]"
            >
              <UserIcon /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#E11D48]"
            >
              <UserIcon /> Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;