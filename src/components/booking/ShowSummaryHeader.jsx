import { describeDay, showDayKey } from "../../utils/booking";
import { formatTime } from "../dashboard/format";

// Movie, cinema, screen, date and time of the show being booked.
export default function ShowSummaryHeader({ showtime, now }) {
  const { movie, cinema, screen } = showtime;
  const day = describeDay(showDayKey(showtime.showDate), now);

  return (
    <div>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{movie?.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {cinema?.name}
        {screen?.name && <> · {screen.name}</>}
        {screen?.screenType && screen.screenType !== "Standard" && <> ({screen.screenType})</>}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {day.full} · {formatTime(showtime.startTime)}
      </p>
    </div>
  );
}