export const MAX_SEATS = 10;
export const VIP_ROW_COUNT = 2;

const pad = (n: number): string => String(n).padStart(2, "0");

export const localDayKey = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const showDayKey = (showDate: string): string => {
  const d = new Date(showDate);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export const describeDay = (key: string, now: Date = new Date()) => {
  const d = new Date(`${key}T00:00:00Z`);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let label = fmt({ weekday: "short" });
  if (key === localDayKey(now)) label = "Today";
  else if (key === localDayKey(tomorrow)) label = "Tomorrow";

  return {
    month: fmt({ month: "short" }),
    day: fmt({ day: "2-digit" }),
    label,
    full: fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
};

export const parseTimeToMinutes = (time: string | null | undefined): number | null => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(time || "");
  if (!m) return null;

  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const period = m[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const isLapsed = (
  showtime: { showDate: string; startTime: string },
  now: Date = new Date()
): boolean => {
  const day = showDayKey(showtime.showDate);
  const today = localDayKey(now);

  if (day < today) return true;
  if (day > today) return false;

  const start = parseTimeToMinutes(showtime.startTime);
  return start !== null && start <= now.getHours() * 60 + now.getMinutes();
};

export const availability = (showtime: {
  availableSeats: number;
  totalSeats: number;
}): "soldout" | "filling" | "available" => {
  if (showtime.availableSeats <= 0) return "soldout";
  const ratio = showtime.availableSeats / (showtime.totalSeats || 1);
  return ratio <= 0.3 ? "filling" : "available";
};

const byStartTime = (
  a: { startTime: string },
  b: { startTime: string }
): number => (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0);

export const upcomingDays = (showtimes: Array<{ isActive?: boolean; showDate: string }>, now: Date = new Date()): string[] => {
  const today = localDayKey(now);
  const days = new Set(
    showtimes
      .filter((s) => s.isActive !== false)
      .map((s) => showDayKey(s.showDate))
      .filter((key) => key && key >= today)
  );
  return [...days].sort();
};

export type SessionShowtime = {
  _id: string;
  isActive?: boolean;
  showDate: string;
  startTime: string;
  ticketPrice: number;
  availableSeats: number;
  totalSeats: number;
  cinema?: { _id: string; name: string; location?: string; city?: string };
  screen?: { _id?: string; name?: string; screenType?: string };
};

export const sessionsForDay = (showtimes: SessionShowtime[], dayKey: string) => {
  const cinemas = new Map<string, { cinema: { _id: string; name: string }; groups: Map<string, typeof showtimes> }>();

  for (const show of showtimes) {
    if (show.isActive === false || !show.cinema) continue;
    if (showDayKey(show.showDate) !== dayKey) continue;

    if (!cinemas.has(show.cinema._id)) {
      cinemas.set(show.cinema._id, { cinema: show.cinema, groups: new Map() });
    }

    const label = show.screen?.screenType || "Standard";
    const { groups } = cinemas.get(show.cinema._id)!;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(show);
  }

  return [...cinemas.values()]
    .map(({ cinema, groups }) => ({
      cinema,
      groups: [...groups].map(([label, list]) => ({
        label,
        showtimes: list.sort(byStartTime),
      })),
    }))
    .sort((a, b) => a.cinema.name.localeCompare(b.cinema.name));
};

const rowLabel = (index: number): string =>
  index < 26
    ? String.fromCharCode(65 + index)
    : String.fromCharCode(64 + Math.floor(index / 26)) + String.fromCharCode(65 + (index % 26));

export const buildSeatRows = (screen: {
  seatLayout?: Array<{ row: string | number; seats: number }>;
  rows?: number;
  seatsPerRow?: number;
}) => {
  const layout =
    Array.isArray(screen?.seatLayout) && screen.seatLayout.length > 0
      ? screen.seatLayout.map((r) => ({ row: String(r.row).toUpperCase(), count: r.seats }))
      : Array.from({ length: screen?.rows ?? 0 }, (_, i) => ({
          row: rowLabel(i),
          count: screen?.seatsPerRow ?? 0,
        }));

  const hasVip = layout.length > VIP_ROW_COUNT * 2;

  return layout.map((r, index) => ({
    row: r.row,
    vip: hasVip && index >= layout.length - VIP_ROW_COUNT,
    seats: Array.from({ length: r.count }, (_, n) => ({
      id: `${r.row}-${n + 1}`,
      row: r.row,
      number: n + 1,
    })),
  }));
};

const SEAT_ID = /^([A-Z]{1,2})-(\d{1,3})$/;

export const parseSeatIds = (value: unknown): string[] => {
  if (typeof value !== "string") return [];

  const ids: string[] = [];
  for (const raw of value.split(",")) {
    const id = raw.trim().toUpperCase();
    if (SEAT_ID.test(id) && !ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, MAX_SEATS);
};

export const sortSeatIds = (ids: string[]): string[] =>
  [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const seatPayload = (id: string) => {
  const [, row, number] = SEAT_ID.exec(id) || [];
  return { row, seatNumber: Number(number), seatId: id };
};
