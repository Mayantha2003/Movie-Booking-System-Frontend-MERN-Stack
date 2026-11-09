import { describeDay, showDayKey } from "../../utils/booking";
import { formatTime } from "../dashboard/format";

interface ShowSummaryHeaderProps {
  showtime: {
    movie?: { _id?: string; title?: string; language?: string; duration?: number; poster?: string } | string;
    cinema?: { _id?: string; name?: string } | string;
    screen?: { _id?: string; name?: string; screenType?: string } | string;
    showDate: string;
    startTime: string;
  };
  now: Date;
}

export default function ShowSummaryHeader({ showtime, now }: ShowSummaryHeaderProps) {
  const movie = typeof showtime.movie === "string" ? undefined : showtime.movie;
  const cinema = typeof showtime.cinema === "string" ? undefined : showtime.cinema;
  const screen = typeof showtime.screen === "string" ? undefined : showtime.screen;
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
