import { Link } from "react-router-dom";
import { CheckIcon } from "../common/Icons";

const STEPS = ["Choose cinema", "Select seats", "Review & details", "Confirmation"];

interface BookingStepperProps {
  current: number;
  backTo?: string;
}

export default function BookingStepper({ current, backTo }: BookingStepperProps) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        {backTo && (
          <Link to={backTo} className="flex h-14 shrink-0 items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink">
            <span aria-hidden="true">←</span> Back
          </Link>
        )}

        <ol aria-label="Booking progress" className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto sm:gap-3">
          {STEPS.map((label, i) => {
            const number = i + 1;
            const done = number < current;
            const active = number === current;

            return (
              <li key={label} aria-current={active ? "step" : undefined} className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span
                  className={`flex h-14 items-center gap-2 border-b-2 text-sm font-semibold transition ${
                    active ? "border-primary text-ink" : done ? "border-transparent text-ink" : "border-transparent text-muted"
                  }`}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                      done ? "bg-success text-white" : active ? "bg-primary text-white" : "bg-card text-muted ring-1 ring-line"
                    }`}
                  >
                    {done ? <CheckIcon /> : number}
                  </span>
                  <span className={active ? "" : "hidden sm:inline"}>{label}</span>
                </span>
                {number < STEPS.length && <span aria-hidden="true" className="text-muted/60">›</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
