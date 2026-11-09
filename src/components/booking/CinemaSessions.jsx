import { Link } from "react-router-dom";
import { availability, isLapsed } from "../../utils/booking";
import { formatMoney, formatTime } from "../dashboard/format";

const CHIP_STYLES = {
  available: "border-emerald-500/70 text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]",
  filling: "border-amber-500/70 text-amber-400 hover:bg-amber-500/10 hover:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
  soldout: "border-primary/40 text-red-400/70",
  lapsed: "border-line text-muted/70",
};

const LEGEND = [
  ["bg-emerald-500", "Available"],
  ["bg-amber-500", "Filling fast"],
  ["bg-primary", "Sold out"],
  ["bg-muted", "Lapsed"],
];

export const SessionLegend = () => (
  <ul className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-xs text-muted">
    {LEGEND.map(([color, label]) => (
      <li key={label} className="flex items-center gap-2">
        <span aria-hidden="true" className={`size-2.5 rounded-sm ${color}`} />
        {label}
      </li>
    ))}
  </ul>
);

function ShowtimeChip({ show, now }) {
  const lapsed = isLapsed(show, now);
  const level = lapsed ? "lapsed" : availability(show);
  const disabled = level === "lapsed" || level === "soldout";
  const time = formatTime(show.startTime);
  const status = level === "lapsed" ? "Lapsed" : level === "soldout" ? "Sold out" : formatMoney(show.ticketPrice);

  const className = `flex min-w-[116px] flex-col items-center rounded-lg border bg-card/60 px-4 py-2.5 transition ${CHIP_STYLES[level]} ${
    disabled ? "cursor-not-allowed opacity-70" : ""
  }`;

  const content = (
    <>
      <span className="text-[11px] font-semibold text-muted">{show.screen?.name}</span>
      <span className="text-base font-extrabold">{time}</span>
      <span className="text-[11px] font-medium">{status}</span>
    </>
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true" aria-label={`${time}, ${show.screen?.name}, ${status}`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      to={`/booking/${show._id}/seats`}
      className={className}
      aria-label={`${time}, ${show.screen?.name}, ${formatMoney(show.ticketPrice)}, ${level === "filling" ? "filling fast" : "available"}`}
    >
      {content}
    </Link>
  );
}

// `sessions` comes from sessionsForDay(): [{ cinema, groups: [{ label, showtimes }] }]
export default function CinemaSessions({ sessions, now }) {
  return (
    <div className="space-y-5">
      {sessions.map(({ cinema, groups }) => (
        <article key={cinema._id} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <header className="border-b border-line px-5 py-4 sm:px-6">
            <h3 className="text-lg font-extrabold">{cinema.name}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {[cinema.location, cinema.city].filter(Boolean).join(", ")}
            </p>
          </header>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h4 className="mb-3 text-sm font-bold text-ink">{group.label}</h4>
                <div className="flex flex-wrap gap-3">
                  {group.showtimes.map((show) => (
                    <ShowtimeChip key={show._id} show={show} now={now} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}