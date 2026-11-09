import { memo } from "react";

const SEAT_STYLES = {
  booked: "cursor-not-allowed border-transparent bg-white/[0.06] text-muted/40",
  selected: "scale-110 border-primary bg-primary text-white shadow-glow",
  available: "border-line bg-card text-muted hover:-translate-y-0.5 hover:border-primary hover:text-white",
  vip: "border-amber-400/60 bg-amber-400/10 text-amber-200 hover:-translate-y-0.5 hover:bg-amber-400/25",
} as const;

interface SeatDef {
  id: string;
  row: string;
  number: number;
}

interface SeatProps {
  seat: SeatDef;
  vip: boolean;
  booked: boolean;
  selected: boolean;
  onToggle: (seatId: string) => void;
}

const Seat = memo(function Seat({ seat, vip, booked, selected, onToggle }: SeatProps) {
  const state = booked ? "booked" : selected ? "selected" : vip ? "vip" : "available";
  const label = booked ? "booked" : selected ? "selected" : "available";

  return (
    <button
      type="button"
      disabled={booked}
      aria-pressed={selected}
      aria-label={`Seat ${seat.id}${vip ? ", VIP" : ""}, ${label}`}
      onClick={() => onToggle(seat.id)}
      className={`grid size-7 place-items-center rounded-t-lg rounded-b-sm border text-[10px] font-bold transition duration-150 sm:size-8 sm:text-xs ${SEAT_STYLES[state]}`}
    >
      {booked ? "✕" : seat.number}
    </button>
  );
});

const LEGEND = [
  ["border-line bg-card", "Available"],
  ["border-primary bg-primary", "Selected"],
  ["border-transparent bg-white/[0.06]", "Booked"],
  ["border-amber-400/60 bg-amber-400/10", "VIP"],
] as const;

interface SeatMapProps {
  rows: Array<{ row: string; vip: boolean; seats: SeatDef[] }>;
  booked: Set<string>;
  selected: string[];
  onToggle: (seatId: string) => void;
}

export default function SeatMap({ rows, booked, selected, onToggle }: SeatMapProps) {
  const selectedSet = new Set(selected);

  return (
    <div>
      <div className="overflow-x-auto pb-3">
        <div className="mx-auto w-max px-3">
          <div aria-hidden="true" className="mx-auto mb-10 w-4/5">
            <div className="h-12 rounded-t-[50%] border-t-4 border-primary bg-gradient-to-b from-primary/30 to-transparent shadow-[0_-14px_36px_-10px_rgba(209,13,50,0.7)]" />
            <p className="mt-2 text-center text-xs text-muted">All eyes this way, the screen is here</p>
          </div>

          {rows.map((r, index) => {
            const mid = r.seats.length >= 8 ? Math.ceil(r.seats.length / 2) : r.seats.length;
            const startsVip = r.vip && !rows[index - 1]?.vip;

            const renderSeat = (seat: SeatDef) => (
              <Seat
                key={seat.id}
                seat={seat}
                vip={r.vip}
                booked={booked.has(seat.id)}
                selected={selectedSet.has(seat.id)}
                onToggle={onToggle}
              />
            );

            return (
              <div key={r.row}>
                {startsVip && (
                  <div className="my-4 flex items-center gap-3 text-xs font-semibold text-amber-300">
                    <span className="h-px flex-1 bg-amber-400/30" />
                    VIP
                    <span className="h-px flex-1 bg-amber-400/30" />
                  </div>
                )}

                <div role="group" aria-label={`Row ${r.row}`} className="my-1.5 flex items-center justify-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-muted">{r.row}</span>
                  <div className="flex gap-1.5 sm:gap-2">
                    {r.seats.slice(0, mid).map(renderSeat)}
                    {mid < r.seats.length && <span aria-hidden="true" className="w-4 sm:w-7" />}
                    {r.seats.slice(mid).map(renderSeat)}
                  </div>
                  <span className="w-6 text-center text-xs font-bold text-muted">{r.row}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-muted">
        {LEGEND.map(([style, label]) => (
          <li key={label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-5 rounded-t-md rounded-b-sm border ${style}`} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
