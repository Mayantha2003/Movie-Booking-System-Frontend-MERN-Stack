
import { useCallback, useEffect, useMemo, useState } from "react";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HeroSection from "../components/movie/HeroSection";
import QuickBook from "../components/home/QuickBook";
import NowShowing from "../components/home/NowShowing";
import ComingSoon from "../components/home/ComingSoon";

import {
  LoadingState,
  ErrorState,
} from "../components/common/StateViews";

import { getNowShowing, getComingSoon } from "../service/movie";

// Convert backend movie fields into frontend fields.
const mapMovie = (movie) => ({
  ...movie,
  id: movie._id,
  genres: movie.genre || [],
  releaseDate: movie.release_date
    ? new Date(movie.release_date).toLocaleDateString()
    : "Release date unavailable",
});

const Home = () => {
  const [search, setSearch] = useState("");
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch movies from backend
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [nowResponse, soonResponse] = await Promise.all([
        getNowShowing(),
        getComingSoon(),
      ]);

      setNowShowing((nowResponse?.data || []).map(mapMovie));
      setComingSoon((soonResponse?.data || []).map(mapMovie));
    } catch (err) {
      console.error("Movie fetching error:", err);
      setError("Unable to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Search movies
  const term = search.trim().toLowerCase();

  const filteredNowShowing = useMemo(
    () =>
      nowShowing.filter((movie) =>
        movie.title?.toLowerCase().includes(term)
      ),
    [nowShowing, term]
  );

  const filteredComingSoon = useMemo(
    () =>
      comingSoon.filter((movie) =>
        movie.title?.toLowerCase().includes(term)
      ),
    [comingSoon, term]
  );

  // Display first two movies in Hero Section
  const heroMovies = filteredNowShowing.slice(0, 2);

  return (
    <div className="min-h-screen bg-bg bg-[radial-gradient(900px_420px_at_85%_-5%,rgba(209,13,50,0.10),transparent)] font-sans text-ink selection:bg-primary/30">

      {/* Navigation Bar */}
      <Navbar search={search} setSearch={setSearch} />

      {/* Loading State */}
      {loading ? (
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <LoadingState
            label="Loading movies..."
            fullScreen={false}
          />
        </main>
      ) : error ? (

        /* Error State */
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md">
            <ErrorState
              message={error}
              onRetry={fetchMovies}
            />
          </div>
        </main>

      ) : (

        /* Home Content */
        <>
          {/* Featured Movie */}
          <HeroSection movies={heroMovies} />

          {/* Quick Booking */}
          <QuickBook movies={filteredNowShowing} />

          {/* Now Showing Movies */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6">
            <NowShowing movies={filteredNowShowing} />
          </main>

          {/* Coming Soon Movies */}
          <ComingSoon movies={filteredComingSoon} />
        </>
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Home;
