import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

// Page frame for every booking step: the site navbar, the content and the footer.
export default function BookingShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}