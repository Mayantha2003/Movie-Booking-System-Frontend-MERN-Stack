import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";

import useRemote from "../hooks/useRemote";
import useNow from "../hooks/useNow";
import { getMovieById } from "../service/movie";
import { getShowtimesByMovie } from "../service/showtime";
import { sessionsForDay, upcomingDays } from "../utils/booking";

import BookingShell from "../components/booking/BookingShell";
import BookingStepper from "../components/booking/BookingStepper";
import MovieDetailsHero from "../components/booking/MovieDetailsHero";
import DateStrip from "../components/booking/DateStrip";
import CinemaSessions, { SessionLegend } from "../components/booking/CinemaSessions";
import AlsoShowing from "../components/booking/AlsoShowing";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateViews";

// Step 1 + 2 of the booking flow: movie details, then date -> cinema -> showtime.
function MovieDetails({ movieId }) {
  const now = useNow();

  const fetchMovie = useCallback(() => getMovieById(movieId), [movieId]);
  const fetchShows = useCallback(() => getShowtimesByMovie(movieId), [movieId]);

  const movie = useRemote(fetchMovie, "We couldn't load this movie.");
  const shows = useRemote(fetchShows, "We couldn't load the showtimes.");

  const [pickedDay, setPickedDay] = useState("");

  if (movie.status === "loading") {
    return <BookingShell><LoadingState label="Loading movie…" /></BookingShell>;
  }

  if (movie.status === "error") {
    return (
      <BookingShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <ErrorState message={movie.error} onRetry={movie.reload} />
          <p className="mt-6 text-center text-sm">
            <Link to="/" className="font-semibold text-primary-hover hover:underline">Back to home</Link>
          </p>
        </div>
      </BookingShell>
    );
  }

  const days = upcomingDays(shows.data ?? [], now);
  const activeDay = days.includes(pickedDay) ? pickedDay : days[0];
  const sessions = activeDay ? sessionsForDay(shows.data ?? [], activeDay) : [];

  return (
    <BookingShell>
      <BookingStepper current={1} backTo="/" />
      <MovieDetailsHero movie={movie.data} />

      <section id="sessions" aria-labelledby="sessions-title" className="mx-auto mt-4 max-w-[1200px] scroll-mt-24 px-4 sm:px-6">
        <h2 id="sessions-title" className="text-2xl font-extrabold">Choose cinema & showtime</h2>

        {shows.status === "loading" && <LoadingState label="Loading showtimes…" />}

        {shows.status === "error" && (
          <div className="mt-6"><ErrorState message={shows.error} onRetry={shows.reload} /></div>
        )}

        {shows.status === "ready" && days.length === 0 && (
          <div className="mt-6">
            <EmptyState
              title={movie.data.status === "coming_soon" ? "Bookings open soon" : "No upcoming shows"}
              message={
                movie.data.status === "coming_soon"
                  ? "Showtimes will appear here once this movie is scheduled."
                  : "There are no upcoming showtimes for this movie right now. Please check back later."
              }
              action={<Link to="/" className="text-sm font-semibold text-primary-hover hover:underline">Browse other movies</Link>}
            />
          </div>
        )}

        {shows.status === "ready" && days.length > 0 && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <DateStrip days={days} selected={activeDay} onSelect={setPickedDay} now={now} />
              <SessionLegend />
            </div>

            <div key={activeDay} className="animate-ticket-in">
              <CinemaSessions sessions={sessions} now={now} />
            </div>
          </div>
        )}
      </section>

      <AlsoShowing currentId={movieId} />
    </BookingShell>
  );
}

// `key` resets all state when the user jumps to another movie.
export default function MovieDetailsPage() {
  const { movieId } = useParams();
  return <MovieDetails key={movieId} movieId={movieId} />;
}