
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { ROLES } from "../../utils/roles";

import {
  ClapperLogo,
  SearchIcon,
  PinIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
} from "./Icons";

// Home is the only main navigation link
const links = [
  { to: "/", label: "Home", end: true },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-primary/15 text-primary-hover"
      : "text-muted hover:bg-surface hover:text-ink"
  }`;

const Navbar = ({ search, setSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useRef(null);

  // Close account menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Logout
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const initial = (
    user?.firstName || user?.username || "?"
  ).charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/95 backdrop-blur-xl">

      {/* Desktop Navbar */}
      <nav
        className="flex h-[76px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        {/* LEFT SIDE - LOGO + HOME */}
        <div className="flex shrink-0 items-center gap-7">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
          >
            <ClapperLogo />

            <span className="text-base font-extrabold leading-none text-ink">
              Movie Booking
              <span className="mt-1 block text-[11px] font-semibold text-muted">
                System
              </span>
            </span>
          </Link>

          {/* Home Link */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - SEARCH + LOCATION + ACCOUNT */}
        <div className="ml-auto flex shrink-0 items-center gap-3">

          {/* Search */}
          {setSearch && (
            <div className="relative hidden lg:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <SearchIcon />
              </span>

              <input
                type="search"
                placeholder="Search movies"
                aria-label="Search movies"
                value={search ?? ""}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-48 rounded-full border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-muted outline-none transition focus:w-56 focus:border-primary xl:w-56"
              />
            </div>
          )}

          {/* Location */}
          <span className="hidden items-center gap-1.5 text-sm font-semibold text-muted xl:flex">
            <PinIcon />
            Colombo
          </span>

          {/* Logged In User */}
          {isAuthenticated ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="flex h-10 items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3 text-sm font-semibold transition hover:border-primary"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                  {initial}
                </span>

                <span className="hidden max-w-24 truncate text-ink sm:block">
                  {user.firstName || user.username}
                </span>
              </button>

              {/* Account Dropdown */}
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-card shadow-xl"
                >
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-bold text-ink">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="truncate text-xs text-muted">
                      @{user.username}
                    </p>

                    {user.role === ROLES.ADMIN && (
                      <span className="mt-1.5 inline-block rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-hover">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Profile */}
                  <Link
                    role="menuitem"
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-surface"
                  >
                    Profile
                  </Link>

                  {/* Logout */}
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full border-t border-line px-4 py-2.5 text-left text-sm text-red-300 hover:bg-surface"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login / Register */
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-glow transition hover:bg-primary-hover"
              >
                <UserIcon />
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-full border border-line bg-card md:hidden"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-line bg-surface px-4 py-3 md:hidden">

          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className={linkClass}
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2.5 text-left text-sm font-semibold text-red-400 hover:bg-card"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                Log in
              </NavLink>

              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
