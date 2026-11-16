import { useEffect, useState } from "react";
import MovieCard from "../movie/MovieCard";
import { getTrendingPicks } from "../../service/recommendation";
import type { MovieRecommendation } from "../../types/api";

// "Trending now" - films the AI picked from real bookings + ratings. Hidden if unavailable.
const AiPicks = () => {
  const [picks, setPicks] = useState<MovieRecommendation[]>([]);
  const [source, setSource] = useState<"ai" | "fallback" | "none">("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getTrendingPicks()
      .then((res) => {
        if (cancelled) return;
        setPicks(res.data ?? []);
        setSource(res.source);
      })
      .catch(() => {
        /* Optional section: stay hidden instead of showing an error on the home page. */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && picks.length === 0) return null;

  return (
    <section id="ai-picks" aria-labelledby="ai-picks-title" className="scroll-mt-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="ai-picks-title" className="text-2xl font-extrabold text-white">
          Trending Now
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary-hover">
          <span aria-hidden="true">✨</span> {source === "ai" ? "AI picks" : "Top picks"}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">The most popular, best-rated films right now.</p>

      {loading ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <div className="aspect-[2/3] animate-pulse rounded-2xl bg-card" />
              <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-card" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {picks.map(({ movie, reason }) => (
            <li key={movie._id}>
              <MovieCard
                movie={{
                  ...movie,
                  id: movie._id,
                  genres: movie.genre || [],
                }}
              />
              <p className="mt-1.5 line-clamp-2 text-xs text-primary-hover">✨ {reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AiPicks;