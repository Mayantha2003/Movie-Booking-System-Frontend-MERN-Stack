import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const NotFound = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">The page you are looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-bold hover:bg-primary-hover">Back to home</Link>
    </main>
    <Footer />
  </div>
);

export default NotFound;