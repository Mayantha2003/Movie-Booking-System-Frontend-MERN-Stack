import { Link } from "react-router-dom";
import { ClapperLogo } from "./Icons";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-line bg-card text-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Link to="/" className="mb-4 inline-flex items-center gap-2">
            <ClapperLogo />
            <span className="text-lg font-extrabold text-ink">
              Movie Booking
              <span className="block text-xs font-semibold text-muted">System</span>
            </span>
          </Link>

          <p className="max-w-sm text-sm leading-6 text-muted">
            Book your favourite movies, explore the latest releases, and enjoy an amazing cinema experience.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink">Quick Links</h3>

          <div className="flex flex-col gap-3 text-sm text-muted">
            <Link to="/" className="transition hover:text-primary">Home</Link>
            <Link to="/login" className="transition hover:text-primary">Login</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink">Contact</h3>

          <p className="text-sm leading-6 text-muted">Colombo, Sri Lanka</p>
          <p className="mt-2 text-sm text-muted">Your favourite movies, one booking away.</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} Movie Booking System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
