import type { ReactNode } from "react";
import MovieCard, { type MovieCardItem } from "../movie/MovieCard";

interface NowShowingProps {
  movies: MovieCardItem[];
}

const NowShowing = ({ movies }: NowShowingProps) => (
  <section id="now-showing" className="scroll-mt-4 py-10">
    <div className="flex items-baseline gap-3">
      <h2 className="text-2xl font-extrabold text-white">Now Showing</h2>
      {movies.length > 0 && <span className="text-sm font-semibold text-muted">{movies.length} movies</span>}
    </div>

    {movies.length === 0 ? (
      <p className="mt-4 text-muted">No movies found.</p>
    ) : (
      <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((m) => (
          <li key={m.id ?? m._id}>
            <MovieCard movie={m} />
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default NowShowing;
