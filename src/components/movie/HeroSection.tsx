import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoviePoster from "./MoviePoster";
import TrailerModal from "./TrailerModal";
import { PlayIcon } from "../common/Icons";
import { formatDuration, getYouTubeId, safeImageUrl } from "../../utils/media";
import type { MovieCardItem } from "./MovieCard";

interface HeroSectionProps {
  movies: MovieCardItem[];
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  const hero = movies[heroIndex] || movies[0];

  const banner = safeImageUrl(hero.banner);
  const poster = safeImageUrl(hero.poster);
  const trailerId = getYouTubeId(hero.trailer_url ?? "");

  const details = [
    Number(hero.rating) > 0 ? `★ ${Number(hero.rating).toFixed(1)}` : "",
    formatDuration(Number(hero.duration ?? 0)),
    (hero.genres ?? hero.genre ?? []).join(", "),
    hero.language,
  ].filter(Boolean);

  const backgroundImage = banner
    ? `linear-gradient(90deg, rgba(11, 18, 32, 0.97) 0%, rgba(11, 18, 32, 0.82) 48%, rgba(11, 18, 32, 0.55) 100%), url("${banner}")`
    : "linear-gradient(110deg, #0B1220 0%, #151F30 55%, #0B1220 100%)";

  return (
    <section
      className="relative overflow-hidden bg-bg text-ink"
      style={{ backgroundImage, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {!banner && poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full scale-125 object-cover opacity-25 blur-3xl"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/70 via-[#0B1220]/20 to-[#0B1220]/50" />

      <div className="relative mx-auto flex min-h-[400px] max-w-[1760px] items-center justify-between gap-8 px-5 py-7 sm:px-8 lg:px-12">
        <div className="max-w-3xl flex-1">
          <span className="inline-flex rounded-full border border-white/50 bg-black/30 px-3 py-1 text-xs font-semibold text-white">
            {hero.releaseDate || hero.release_date}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {hero.title}
          </h1>

          {details.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-gray-300 sm:text-sm">
              {details.map((d, i) => (
                <span key={d} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">•</span>}
                  {d}
                </span>
              ))}
            </p>
          )}

          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-300">{hero.description}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/movies/${hero.id ?? hero._id}`)}
              className="h-11 min-w-32 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-glow transition hover:bg-primary-hover"
            >
              Book Now
            </button>
            {trailerId && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="h-11 rounded-lg border border-white/30 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Watch trailer
              </button>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-10 sm:flex">
          <div className="relative w-44 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/15 sm:w-48 lg:w-52">
            <MoviePoster movie={hero as never} className="aspect-[2/3] w-full" />

            {trailerId && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                aria-label={`Play ${hero.title} trailer`}
                className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/30"
              >
                <span className="flex size-12 items-center justify-center rounded-full border border-white/70 bg-primary text-white shadow-lg transition hover:scale-110">
                  <PlayIcon size={25} />
                </span>
              </button>
            )}
          </div>

          {movies.length > 1 && (
            <div className="flex flex-col gap-4">
              {movies.slice(0, 2).map((movie, index) => (
                <button
                  key={movie.id ?? movie._id}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Show ${movie.title}`}
                  className={`flex items-center gap-2 text-sm font-bold transition ${
                    index === heroIndex ? "text-primary" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {index === heroIndex && <span className="h-px w-6 bg-primary" />}
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {trailerOpen && trailerId && (
        <TrailerModal videoId={trailerId} title={hero.title} onClose={() => setTrailerOpen(false)} />
      )}
    </section>
  );
};

export default HeroSection;
