// Helpers for the booking flow: dates, showtimes, seats.

export const MAX_SEATS = 10;

// The last rows of a screen (best view) are shown as the VIP zone.
// NOTE: the backend prices every seat at Showtime.ticketPrice, so VIP is a
// seating zone only. The price per seat is the same everywhere.
export const VIP_ROW_COUNT = 2;

// ---------------------------------------------------------------- dates
const pad = (n) => String(n).padStart(2, "0");

// "2026-11-09" for the viewer's own calendar day
export const localDayKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The calendar day an admin saved on a showtime. A date such as 2026-11-09 is
// stored as UTC midnight, so read it back in UTC to get the same day everywhere.
export const showDayKey = (showDate) => {
  const d = new Date(showDate);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export const describeDay = (key, now = new Date()) => {
  const d = new Date(`${key}T00:00:00Z`);
  const fmt = (opts) => d.toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
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

// "10:30 AM" or "14:00" -> minutes since midnight (null if unreadable)
export const parseTimeToMinutes = (time) => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(time || "");
  if (!m) return null;

  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const period = m[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// ------------------------------------------------------------ showtimes
export const isLapsed = (showtime, now = new Date()) => {
  const day = showDayKey(showtime.showDate);
  const today = localDayKey(now);

  if (day < today) return true;
  if (day > today) return false;

  const start = parseTimeToMinutes(showtime.startTime);
  return start !== null && start <= now.getHours() * 60 + now.getMinutes();
};

// "soldout" | "filling" | "available"
export const availability = (showtime) => {
  if (showtime.availableSeats <= 0) return "soldout";
  const ratio = showtime.availableSeats / (showtime.totalSeats || 1);
  return ratio <= 0.3 ? "filling" : "available";
};

const byStartTime = (a, b) =>
  (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0);

// Upcoming days (today onwards) that have at least one active showtime
export const upcomingDays = (showtimes, now = new Date()) => {
  const today = localDayKey(now);
  const days = new Set(
    showtimes
      .filter((s) => s.isActive !== false)
      .map((s) => showDayKey(s.showDate))
      .filter((key) => key && key >= today)
  );
  return [...days].sort();
};

// One day of showtimes -> [{ cinema, groups: [{ label, showtimes }] }]
// Cinemas are sorted by name; inside a cinema the showtimes are grouped by screen type.
export const sessionsForDay = (showtimes, dayKey) => {
  const cinemas = new Map();

  for (const show of showtimes) {
    if (show.isActive === false || !show.cinema) continue;
    if (showDayKey(show.showDate) !== dayKey) continue;

    if (!cinemas.has(show.cinema._id)) {
      cinemas.set(show.cinema._id, { cinema: show.cinema, groups: new Map() });
    }

    const label = show.screen?.screenType || "Standard";
    const { groups } = cinemas.get(show.cinema._id);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(show);
  }

  return [...cinemas.values()]
    .map(({ cinema, groups }) => ({
      cinema,
      groups: [...groups].map(([label, list]) => ({ label, showtimes: list.sort(byStartTime) })),
    }))
    .sort((a, b) => a.cinema.name.localeCompare(b.cinema.name));
};

// ---------------------------------------------------------------- seats
const rowLabel = (index) =>
  index < 26
    ? String.fromCharCode(65 + index)
    : String.fromCharCode(64 + Math.floor(index / 26)) + String.fromCharCode(65 + (index % 26));

// Screen document -> [{ row, vip, seats: [{ id, row, number }] }]
// Uses screen.seatLayout when the admin defined one, otherwise rows x seatsPerRow.
export const buildSeatRows = (screen) => {
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

// "A-1,A-2" (from the URL) -> ["A-1", "A-2"]; anything invalid is dropped
export const parseSeatIds = (value) => {
  if (typeof value !== "string") return [];

  const ids = [];
  for (const raw of value.split(",")) {
    const id = raw.trim().toUpperCase();
    if (SEAT_ID.test(id) && !ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, MAX_SEATS);
};

export const sortSeatIds = (ids) =>
  [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

// "B-8" -> { row: "B", seatNumber: 8, seatId: "B-8" } (the shape POST /bookings expects)
export const seatPayload = (id) => {
  const [, row, number] = SEAT_ID.exec(id);
  return { row, seatNumber: Number(number), seatId: id };
};