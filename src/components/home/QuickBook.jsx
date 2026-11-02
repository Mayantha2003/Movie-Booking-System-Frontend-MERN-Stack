import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DATES, CINEMAS, TIMINGS } from "../../data/movies";

const selectClass =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-3 text-sm text-[#1E293B] focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20";

const QuickBook = ({ movies }) => {
  const navigate = useNavigate();
  const [quick, setQuick] = useState({
    movieId: "",
    date: "",
    cinema: "",
    time: "",
  });

  const handleBook = () => {
    if (!quick.movieId) return;
    navigate(`/movies/${quick.movieId}`);
  };

  return (
    <section className="border-y border-[#FFE4E8] bg-[#FFF1F2]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
        <span className="text-base font-extrabold">Quick Book</span>
        <span className="rounded-md border border-[#C8102E] bg-white px-3 py-2 text-sm font-semibold text-[#C8102E]">
          Movie
        </span>

        <div className="grid min-w-[260px] flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className={selectClass}
            value={quick.movieId}
            onChange={(e) => setQuick({ ...quick, movieId: e.target.value })}
          >
            <option value="">Select Movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={quick.date}
            onChange={(e) => setQuick({ ...quick, date: e.target.value })}
          >
            <option value="">Select Date</option>
            {DATES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={quick.cinema}
            onChange={(e) => setQuick({ ...quick, cinema: e.target.value })}
          >
            <option value="">Select Cinema</option>
            {CINEMAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={quick.time}
            onChange={(e) => setQuick({ ...quick, time: e.target.value })}
          >
            <option value="">Select Timing</option>
            {TIMINGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleBook}
          disabled={!quick.movieId}
          className="rounded-lg bg-[#C8102E] px-8 py-3 text-sm font-bold text-white hover:bg-[#E11D48] disabled:opacity-50"
        >
          Book
        </button>
      </div>
    </section>
  );
};

export default QuickBook;