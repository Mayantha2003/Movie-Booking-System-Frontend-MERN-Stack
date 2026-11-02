import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoviePoster from "../movie/MoviePoster";

const ComingSoon = ({ movies }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? movies : movies.slice(0, 5);

  return (
    <section id="coming-soon" className="scroll-mt-4 bg-[#F8FAFC] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Coming Soon</h2>
          {movies.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold hover:border-[#C8102E] hover:text-[#C8102E]"
            >
              {showAll ? "Show less" : "See all →"}
            </button>
          )}
        </div>

        {movies.length === 0 ? (
          <p className="mt-4 text-[#64748B]">No movies found.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((m) => (
              <li key={m.id}>
                <MoviePoster movie={m} className="aspect-[2/3] w-full rounded-lg" />
                <h3 className="mt-3 text-sm font-extrabold uppercase">{m.title}</h3>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {m.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded border border-[#CBD5E1] px-2 py-0.5 text-[11px] font-semibold uppercase text-[#334155]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-sm text-[#64748B]">{m.language}</p>
                <p className="text-sm font-bold">{m.releaseDate}</p>
                <button
                  onClick={() => navigate(`/movies/${m.id}`)}
                  className="mt-3 rounded-lg border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ComingSoon;