import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const Forbidden = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-extrabold text-primary">403</p>
      <h1 className="mt-3 text-2xl font-bold">You don't have access</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">Your account doesn't have permission to view this page.</p>
      <Link to="/" className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-bold hover:bg-primary-hover">
        Back to home
      </Link>
    </main>
  </div>
);

export default Forbidden;
