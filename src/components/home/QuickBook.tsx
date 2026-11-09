import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShowtimesByMovie } from "../../service/showtime";

const selectClass =
  "h-11 w-full min-w-0 appearance-none rounded-lg border border-[#D8DEE8] bg-white px-4 pr-12 text-sm text-[#334155] outline-none transition focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

interface QuickBookMovie {
  id: string;
  _id?: string;
  title: string;
}

interface ShowtimeOption {
  _id: string;
  isActive?: boolean;
  showDate: string;
  availableSeats: number;
  cinema: { _id: string; name: string };
  startTime: string;
  ticketPrice: number;
}

interface QuickBookProps {
  movies?: QuickBookMovie[];
}

const SelectArrow = () => (
  <svg
    className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#334155]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const QuickBook = ({ movies = [] }: QuickBookProps) => {
  const navigate = useNavigate();

  const [showtimes, setShowtimes] = useState<ShowtimeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [quick, setQuick] = useState({
    movieId: "",
    date: "",
    cinemaId: "",
    showtimeId: "",
  });

  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!quick.movieId) {
        setShowtimes([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getShowtimesByMovie(quick.movieId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureShowtimes = (response?.data || []).filter(
          (showtime) =>
            showtime.isActive &&
            new Date(showtime.showDate) >= today &&
            showtime.availableSeats > 0
        ) as ShowtimeOption[];

        setShowtimes(futureShowtimes);
        setQuick((prev) => ({
          ...prev,
          date: "",
          cinemaId: "",
          showtimeId: "",
        }));
      } catch (err) {
        console.error("Failed to fetch showtimes:", err);
        setShowtimes([]);
        setError("Unable to load showtimes.");
      } finally {
        setLoading(false);
      }
    };

    void fetchShowtimes();
  }, [quick.movieId]);

  const dates = [
    ...new Set(showtimes.map((showtime) => new Date(showtime.showDate).toLocaleDateString("en-CA"))),
  ];

  const cinemas = [
    ...new Map(
      showtimes
        .filter(
          (showtime) =>
            !quick.date || new Date(showtime.showDate).toLocaleDateString("en-CA") === quick.date
        )
        .map((showtime) => [showtime.cinema._id, showtime.cinema])
    ).values(),
  ];

  const timings = showtimes.filter(
    (showtime) =>
      (!quick.date || new Date(showtime.showDate).toLocaleDateString("en-CA") === quick.date) &&
      (!quick.cinemaId || showtime.cinema._id === quick.cinemaId)
  );

  const handleMovieChange = (movieId: string) => {
    setQuick({ movieId, date: "", cinemaId: "", showtimeId: "" });
  };

  const handleDateChange = (date: string) => {
    setQuick((prev) => ({ ...prev, date, cinemaId: "", showtimeId: "" }));
  };

  const handleCinemaChange = (cinemaId: string) => {
    setQuick((prev) => ({ ...prev, cinemaId, showtimeId: "" }));
  };

  const handleBook = () => {
    if (!quick.movieId || !quick.showtimeId) return;
    navigate(`/booking/${quick.showtimeId}/seats`);
  };

  return (
    <section className="relative z-10 border-b border-[#E2E8F0] bg-[#FFF7E8]">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-3 px-4 py-3 sm:px-6 lg:h-[72px] lg:flex-row lg:items-center lg:gap-3 lg:py-0">
        <span className="shrink-0 text-sm font-extrabold text-[#1E293B] lg:mr-1">Quick Book</span>

        <span className="hidden shrink-0 rounded-md border border-[#C8102E] bg-white px-3 py-2 text-xs font-bold text-[#C8102E] sm:inline-flex">
          Movie
        </span>

        <div className="grid w-full flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
          <div className="relative">
            <select
              className={selectClass}
              value={quick.movieId}
              onChange={(e) => handleMovieChange(e.target.value)}
            >
              <option value="">Select Movie</option>
              {movies.map((movie) => (
                <option key={movie.id ?? movie._id} value={movie.id ?? movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>

          <div className="relative">
            <select
              className={selectClass}
              value={quick.date}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={!quick.movieId || loading || dates.length === 0}
            >
              <option value="">Select Date</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {new Date(`${date}T00:00:00`).toLocaleDateString()}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>

          <div className="relative">
            <select
              className={selectClass}
              value={quick.cinemaId}
              onChange={(e) => handleCinemaChange(e.target.value)}
              disabled={!quick.date}
            >
              <option value="">Select Cinema</option>
              {cinemas.map((cinema) => (
                <option key={cinema._id} value={cinema._id}>
                  {cinema.name}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>

          <div className="relative">
            <select
              className={selectClass}
              value={quick.showtimeId}
              onChange={(e) => setQuick((prev) => ({ ...prev, showtimeId: e.target.value }))}
              disabled={!quick.date || !quick.cinemaId}
            >
              <option value="">Select Timing</option>
              {timings.map((showtime) => (
                <option key={showtime._id} value={showtime._id}>
                  {showtime.startTime} - Rs. {showtime.ticketPrice}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        <button
          onClick={handleBook}
          disabled={!quick.movieId || !quick.showtimeId}
          className="h-11 shrink-0 rounded-lg bg-[#C8102E] px-7 text-sm font-bold text-white transition hover:bg-[#E11D48] disabled:cursor-not-allowed disabled:opacity-50 lg:min-w-[95px]"
        >
          Book
        </button>

        {loading && (
          <span className="text-xs text-gray-500 lg:absolute lg:right-8 lg:top-full lg:mt-1">
            Loading showtimes...
          </span>
        )}

        {error && (
          <span className="text-xs text-red-600 lg:absolute lg:right-8 lg:top-full lg:mt-1">{error}</span>
        )}

        {!loading && quick.movieId && showtimes.length === 0 && !error && (
          <span className="text-xs text-gray-500 lg:absolute lg:right-8 lg:top-full lg:mt-1">
            No upcoming showtimes available.
          </span>
        )}
      </div>
    </section>
  );
};

export default QuickBook;
