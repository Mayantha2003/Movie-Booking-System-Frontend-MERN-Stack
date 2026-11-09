import { describeDay } from "../../utils/booking";

interface DateStripProps {
  days: string[];
  selected: string;
  onSelect: (key: string) => void;
  now: Date;
}

export default function DateStrip({ days, selected, onSelect, now }: DateStripProps) {
  return (
    <div role="tablist" aria-label="Show date" className="flex gap-2 overflow-x-auto pb-1">
      {days.map((key) => {
        const d = describeDay(key, now);
        const active = key === selected;

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(key)}
            className={`flex w-[84px] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition ${
              active
                ? "border-primary bg-primary text-white shadow-glow"
                : "border-line bg-card text-muted hover:border-primary/60 hover:text-ink"
            }`}
          >
            <span className="text-xs font-semibold">{d.month}</span>
            <span className="text-2xl font-extrabold leading-tight">{d.day}</span>
            <span className="text-xs font-medium">{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}
