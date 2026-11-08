const TONES = {
  green: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  red: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  blue: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  gray: "bg-gray-500/15 text-gray-300 ring-gray-400/30",
};

export default function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${TONES[tone] ?? TONES.gray}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}