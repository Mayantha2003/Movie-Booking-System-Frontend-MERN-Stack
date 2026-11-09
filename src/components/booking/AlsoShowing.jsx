import useRemote from "../../hooks/useRemote";
import { getNowShowing } from "../../service/movie";
import MovieCard from "../movie/MovieCard";

// The same shape Home.jsx gives MovieCard.
const mapMovie = (movie) => ({ ...movie, id: movie._id, genres: movie.genre || [] });

// "Also showing" row. It is a nice-to-have, so it renders nothing while loading or on error.
export default function AlsoShowing({ currentId }) {
  const { status, data } = useRemote(getNowShowing, "Could not load movies.");
  if (status !== "ready") return null;

  const movies = (data || []).filter((m) => m._id !== currentId).slice(0, 6).map(mapMovie);
  if (movies.length === 0) return null;

  return (
    <section className="mx-auto mt-14 max-w-[1200px] px-4 sm:px-6" aria-labelledby="also-showing">
      <h2 id="also-showing" className="mb-6 text-2xl font-extrabold">Also showing</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </section>
  );
}