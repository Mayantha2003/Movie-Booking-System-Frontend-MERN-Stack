import { Link } from "react-router-dom";
import MoviePoster from "./MoviePoster";
import { formatDuration } from "../../utils/media";

// Poster card used for "Now Showing" and "Coming Soon".
//   variant "now"  -> "Book now" on hover
//   variant "soon" -> "View details" on hover and the release date underneath
const MovieCard = ({ movie, variant = "now" }) => {
  const soon = variant === "soon";
  const rating = Number(movie.rating);
  const meta = [formatDuration(movie.duration), (movie.genres ?? []).slice(0, 2).join(", ")]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className="group">
      <Link
        to={`/movies/${movie.id}`}
        aria-label={`${soon ? "View details for" : "Book"} ${movie.title}`}
        className="relative block overflow-hidden rounded-2xl bg-card shadow-lg shadow-black/40 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow hover:ring-primary/60 focus-visible:-translate-y-1.5"
      >
        <MoviePoster
          movie={movie}
          className="aspect-[2/3] w-full transition duration-500 group-hover:scale-105"
        />

        {movie.language && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {movie.language}
          </span>
        )}
        {rating > 0 && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            <span aria-hidden="true" className="text-amber-400">★</span>
            {rating.toFixed(1)}
          </span>
        )}

        {/* Call to action, revealed on hover / keyboard focus */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-20 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <span className="block rounded-lg bg-primary py-2.5 text-center text-sm font-bold text-white shadow-glow">
            {soon ? "View details" : "Book now"}
          </span>
        </div>
      </Link>

      <h3 className="mt-3 truncate text-sm font-extrabold uppercase tracking-wide text-white" title={movie.title}>
        {movie.title}
      </h3>
      {meta && <p className="mt-1 truncate text-xs text-muted">{meta}</p>}
      {soon && <p className="mt-1 text-xs font-bold text-primary">{movie.releaseDate}</p>}
    </article>
  );
};

export default MovieCard;