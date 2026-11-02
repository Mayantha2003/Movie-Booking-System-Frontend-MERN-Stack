import { useNavigate } from "react-router-dom";
import MoviePoster from "../movie/MoviePoster";

const NowShowing = ({ movies }) => {
  const navigate = useNavigate();

  return (
    <section id="now-showing" className="scroll-mt-4 py-8">
      <h2 className="text-2xl font-extrabold text-[#1E293B]">Now Showing</h2>

      {movies.length === 0 ? (
        <p className="mt-4 text-[#64748B]">No movies found.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {movies.map((m) => (
            <li key={m.id}>
              <MoviePoster movie={m} className="aspect-[2/3] w-full rounded-lg" />
              <h3 className="mt-2 font-bold uppercase">{m.title}</h3>
              <p className="text-sm text-[#64748B]">{m.language}</p>
              <button
                onClick={() => navigate(`/movies/${m.id}`)}
                className="mt-2 w-full rounded-lg bg-[#C8102E] py-2.5 text-sm font-bold text-white hover:bg-[#E11D48]"
              >
                Book
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NowShowing;