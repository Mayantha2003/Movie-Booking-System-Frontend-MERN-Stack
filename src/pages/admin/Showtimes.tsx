import { useMemo } from "react";
import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import useRemote from "../../hooks/useRemote";
import { formatDate, formatMoney, formatTime } from "../../components/dashboard/format";
import { getCinemas, getMovies, getScreens, getShowtimes, showtimeApi } from "../../service/admin";
import type { FormField } from "../../components/dashboard/form";
import type { ColumnDef } from "../../components/dashboard/DataTable";
import type { Cinema, Movie, Screen, Showtime } from "../../types/api";

const columns: ColumnDef<Showtime>[] = [
  {
    key: "movie", header: "Movie",
    render: (s: Showtime) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{typeof s.movie === "string" ? "Deleted movie" : s.movie?.title ?? "Deleted movie"}</p>
        <p className="truncate text-xs text-gray-400">{typeof s.cinema === "string" ? "—" : s.cinema?.name ?? "—"} · {typeof s.screen === "string" ? "—" : s.screen?.name ?? "—"}</p>
      </div>
    ),
  },
  { key: "date", header: "Date", render: (s: Showtime) => formatDate(s.showDate, { utc: true }), className: "whitespace-nowrap" },
  { key: "time", header: "Time", render: (s: Showtime) => `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`, className: "whitespace-nowrap" },
  { key: "price", header: "Ticket", render: (s: Showtime) => formatMoney(s.ticketPrice), className: "whitespace-nowrap" },
  { key: "seats", header: "Seats left", render: (s: Showtime) => `${s.availableSeats} / ${s.totalSeats}`, className: "whitespace-nowrap" },
  { key: "status", header: "Status", render: (s: Showtime) => (s.isActive ? <Badge tone="green">On sale</Badge> : <Badge tone="gray">Closed</Badge>) },
];

export default function Showtimes() {
  const movies = useRemote(getMovies, "Could not load the movies.");
  const cinemas = useRemote(getCinemas, "Could not load the cinemas.");
  const screens = useRemote(getScreens, "Could not load the screens.");

  const fields = useMemo<FormField[]>(
    () => [
      {
        name: "movie", label: "Movie", type: "select", required: true, lockOnEdit: true,
        options: (movies.data ?? []).map((m: Movie) => ({ value: m._id, label: m.title })),
      },
      {
        name: "cinema", label: "Cinema", type: "select", required: true, half: true, lockOnEdit: true, resets: ["screen"],
        options: (cinemas.data ?? []).map((c: Cinema) => ({ value: c._id, label: c.name })),
      },
      {
        name: "screen", label: "Screen", type: "select", required: true, half: true, lockOnEdit: true,
        hint: "Choose a cinema first.",
        options: (values: Record<string, unknown>) =>
          (screens.data ?? [])
            .filter((s: Screen) => typeof s.cinema !== "string" && s.cinema?._id === values.cinema)
            .map((s: Screen) => ({ value: s._id, label: `${s.name} (${s.totalSeats} seats)` })),
      },
      { name: "showDate", label: "Date", type: "date", required: true, half: true },
      { name: "ticketPrice", label: "Ticket price (Rs.)", type: "number", required: true, half: true, min: 0 },
      { name: "startTime", label: "Starts", type: "time", required: true, half: true },
      { name: "endTime", label: "Ends", type: "time", required: true, half: true },
      { name: "isActive", label: "On sale", type: "checkbox", defaultValue: true },
    ],
    [movies.data, cinemas.data, screens.data]
  );

  const validate = (v: Record<string, unknown>): Record<string, string> => {
    const startTime = typeof v.startTime === "string" ? v.startTime : "";
    const endTime = typeof v.endTime === "string" ? v.endTime : "";
    return startTime && endTime && startTime === endTime ? { endTime: "End time must be different from the start time." } : {};
  };

  return (
    <CrudPage
      title="Showtimes" subtitle="Schedule movies on screens. Seats are taken from the screen automatically."
      noun="Showtime" plural="showtimes"
      fetcher={getShowtimes} api={showtimeApi}
      columns={columns} fields={fields} validate={validate}
      searchText={(s: Showtime) => [typeof s.movie === "string" ? "" : s.movie?.title, typeof s.cinema === "string" ? "" : s.cinema?.name, typeof s.screen === "string" ? "" : s.screen?.name].join(" ")}
      rowName={(s: Showtime) => `${typeof s.movie === "string" ? "Showtime" : s.movie?.title ?? "Showtime"} on ${formatDate(s.showDate, { utc: true })}`}
      toggle={{
        field: "isActive", onLabel: "Open sales", offLabel: "Close sales",
        run: (s: Showtime) => showtimeApi.update(s._id, { isActive: !s.isActive }),
      }}
      emptyText="Add movies, cinemas and screens first, then schedule a showtime."
      deleteNote="Existing bookings for it are not removed."
    />
  );
}