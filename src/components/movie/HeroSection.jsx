import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoviePoster from "./MoviePoster";
import { PlayIcon } from "../common/Icons";

const HeroSection = ({ movies }) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  const hero = movies[heroIndex];

  return (
    <section className="bg-gradient-to-r from-[#FFF1F2] to-white">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between md:py-14">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full border border-[#C8102E] px-3 py-1 text-sm font-semibold text-[#C8102E]">
            {hero.releaseDate}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-[#1E293B] sm:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-[#475569]">
            {hero.rating} • {hero.duration} • {hero.genres.join(", ")} • {hero.language}
          </p>
          <p className="mt-4 text-base text-[#475569]">{hero.description}</p>
          <button
            onClick={() => navigate(`/movies/${hero.id}`)}
            className="mt-6 rounded-lg bg-[#C8102E] px-8 py-3 text-base font-bold text-white hover:bg-[#E11D48]"
          >
            Book
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative w-52 overflow-hidden rounded-xl shadow-xl sm:w-60">
            <MoviePoster movie={hero} className="aspect-[2/3] w-full" />
            <span className="absolute inset-0 flex items-center justify-center">
              <PlayIcon size={52} />
            </span>
          </div>

          <div className="hidden flex-col gap-3 sm:flex">
            {movies.slice(0, 2).map((m, i) => (
              <button
                key={m.id}
                onClick={() => setHeroIndex(i)}
                className={`flex items-center gap-2 text-sm font-bold ${
                  i === heroIndex ? "text-[#C8102E]" : "text-[#94A3B8]"
                }`}
              >
                {i === heroIndex && <span className="h-0.5 w-6 bg-[#C8102E]" />}
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;