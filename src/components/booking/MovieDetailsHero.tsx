import { useState } from "react";
import MoviePoster from "../movie/MoviePoster";
import TrailerModal from "../movie/TrailerModal";
import { PlayIcon } from "../common/Icons";
import { formatDuration, getYouTubeId, safeImageUrl } from "../../utils/media";

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
    {children}
  </span>
);

interface MovieDetailsHeroProps {
  movie: {
    banner?: string;
    poster?: string;
    trailer_url?: string;
    rating?: number | string;
    status?: string;
    release_date?: string;
    duration?: number;
    language?: string;
    genre?: string[];
    description?: string;
    director?: string;
    cast?: string[];
    title: string;
  };
}

export default function MovieDetailsHero({ movie }: MovieDetailsHeroProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);

  const banner = safeImageUrl(movie.banner);
  const poster = safeImageUrl(movie.poster);
  const trailerId = getYouTubeId(movie.trailer_url ?? "");
  const rating = Number(movie.rating ?? 0);
  const soon = movie.status === "coming_soon";

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

  const backgroundImage = banner
    ? `linear-gradient(90deg, rgba(11,18,32,0.97) 0%, rgba(11,18,32,0.85) 50%, rgba(11,18,32,0.6) 100%), url("${banner}")`
    : "linear-gradient(110deg, #0B1220 0%, #151F30 55%, #0B1220 100%)";

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundImage, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {!banner && poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full scale-125 object-cover opacity-20 blur-3xl"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[260px_1fr] md:py-14">
        <div className="mx-auto w-48 md:w-full">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/15">
            <MoviePoster movie={movie as never} className="aspect-[2/3] w-full" />

            {trailerId && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                aria-label={`Play ${movie.title} trailer`}
                className="group absolute inset-0 grid place-items-center bg-black/25 transition hover:bg-black/40"
              >
                <span className="transition group-hover:scale-110">
                  <PlayIcon size={60} />
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {soon && (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Coming soon</span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-sm font-bold ring-1 ring-white/15">
                <span aria-hidden="true" className="text-amber-400">★</span>
                {rating.toFixed(1)}
                <span className="text-xs font-medium text-muted">/ 10</span>
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {movie.title}
          </h1>

          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {formatDuration(movie.duration ?? 0) && <span>{formatDuration(movie.duration ?? 0)}</span>}
            {movie.language && <span>{movie.language}</span>}
            {releaseDate && <span>{soon ? `Releasing ${releaseDate}` : `Released ${releaseDate}`}</span>}
          </p>

          {movie.genre?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <Chip key={g}>{g}</Chip>
              ))}
            </div>
          ) : null}

          {movie.description && <p className="mt-6 max-w-3xl text-[15px] leading-7 text-white/80">{movie.description}</p>}

          <dl className="mt-6 space-y-4 text-sm">
            {movie.director && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">Director</dt>
                <dd className="font-semibold">{movie.director}</dd>
              </div>
            )}
            {movie.cast?.length ? (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 pt-1 text-muted">Cast</dt>
                <dd className="flex flex-wrap gap-2">
                  {movie.cast.map((name) => (
                    <Chip key={name}>{name}</Chip>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#sessions"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-bold text-white shadow-glow transition hover:bg-primary-hover"
            >
              {soon ? "See showtimes" : "Book tickets"}
            </a>
            {trailerId && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-bold transition hover:border-primary hover:bg-white/10"
              >
                <span aria-hidden="true">▶</span> Watch trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {trailerOpen && trailerId && (
        <TrailerModal videoId={trailerId} title={movie.title} onClose={() => setTrailerOpen(false)} />
      )}
    </section>
  );
}
