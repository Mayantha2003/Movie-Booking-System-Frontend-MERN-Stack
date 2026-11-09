import { useCallback, useEffect, useMemo, useState } from "react";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HeroSection from "../components/movie/HeroSection";
import QuickBook from "../components/home/QuickBook";
import NowShowing from "../components/home/NowShowing";
import ComingSoon from "../components/home/ComingSoon";

import { LoadingState, ErrorState } from "../components/common/StateViews";
import { getNowShowing, getComingSoon } from "../service/movie";
import type { Movie } from "../types/api";
import type { MovieCardItem } from "../components/movie/MovieCard";

const mapMovie = (movie: Movie): MovieCardItem => ({
  ...movie,
  id: movie._id,
  genres: movie.genre || [],
  releaseDate: movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "Release date unavailable",
});

const Home = () => {
  const [search, setSearch] = useState<string>("");
  const [nowShowing, setNowShowing] = useState<MovieCardItem[]>([]);
  const [comingSoon, setComingSoon] = useState<MovieCardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [nowResponse, soonResponse] = await Promise.all([
        getNowShowing(),
        getComingSoon(),
      ]);

      setNowShowing((nowResponse?.data ?? []).map(mapMovie));
      setComingSoon((soonResponse?.data ?? []).map(mapMovie));
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

  const term = search.trim().toLowerCase();

  const filteredNowShowing = useMemo(
    () =>
      nowShowing
        .filter((movie) => movie.title?.toLowerCase().includes(term))
        .map((movie) => ({ ...movie, id: movie.id ?? movie._id ?? "" })),
    [nowShowing, term]
  );

  const filteredComingSoon = useMemo(
    () =>
      comingSoon
        .filter((movie) => movie.title?.toLowerCase().includes(term))
        .map((movie) => ({ ...movie, id: movie.id ?? movie._id ?? "" })),
    [comingSoon, term]
  );

  const heroMovies = filteredNowShowing.slice(0, 2);

  return (
    <div className="min-h-screen bg-bg bg-[radial-gradient(900px_420px_at_85%_-5%,rgba(209,13,50,0.10),transparent)] font-sans text-ink selection:bg-primary/30">
      <Navbar search={search} setSearch={setSearch} />

      {loading ? (
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <LoadingState label="Loading movies..." fullScreen={false} />
        </main>
      ) : error ? (
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md">
            <ErrorState message={error} onRetry={fetchMovies} />
          </div>
        </main>
      ) : (
        <>
          <HeroSection movies={heroMovies} />
          <QuickBook movies={filteredNowShowing} />
          <main className="mx-auto max-w-7xl px-4 sm:px-6">
            <NowShowing movies={filteredNowShowing} />
          </main>
          <ComingSoon movies={filteredComingSoon} />
        </>
      )}

      <Footer />
    </div>
  );
};

export default Home;
