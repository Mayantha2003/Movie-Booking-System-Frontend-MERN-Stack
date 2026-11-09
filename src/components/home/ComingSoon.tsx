import { useState } from "react";
import MovieCard, { type MovieCardItem } from "../movie/MovieCard";

interface ComingSoonProps {
  movies: MovieCardItem[];
}

const ComingSoon = ({ movies }: ComingSoonProps) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? movies : movies.slice(0, 5);

  return (
    <section id="coming-soon" className="scroll-mt-4 border-t border-white/10 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white">Coming Soon</h2>
          {movies.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-primary hover:text-primary"
            >
              {showAll ? "Show less" : "See all →"}
            </button>
          )}
        </div>

        {movies.length === 0 ? (
          <p className="mt-4 text-muted">No movies found.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((m) => (
              <li key={m.id ?? m._id}>
                <MovieCard movie={m} variant="soon" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ComingSoon;
