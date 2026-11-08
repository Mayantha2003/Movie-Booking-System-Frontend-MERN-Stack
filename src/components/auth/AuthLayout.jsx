import { Link } from "react-router-dom";
import { ClapperLogo } from "../common/Icons";

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#2a0610] via-bg to-surface p-12 lg:flex lg:flex-col lg:justify-between">
      <div aria-hidden className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" />
      <Link to="/" className="relative flex items-center gap-2">
        <ClapperLogo />
        <span className="text-lg font-extrabold">Movie Booking System</span>
      </Link>
      <div className="relative">
        <h2 className="max-w-md text-4xl font-extrabold leading-tight">Your seat is waiting.</h2>
        <p className="mt-4 max-w-sm text-muted">
          Pick a film, choose your seats and add snacks, all in one booking.
        </p>
      </div>
      <p className="relative text-xs text-muted">© {new Date().getFullYear()} Movie Booking System</p>
    </aside>

    <main className="flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <ClapperLogo />
          <span className="font-extrabold">Movie Booking System</span>
        </Link>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      </div>
    </main>
  </div>
);

export default AuthLayout;