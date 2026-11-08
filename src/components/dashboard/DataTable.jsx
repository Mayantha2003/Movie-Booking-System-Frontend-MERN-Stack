const TONES = {
  neutral: "text-gray-300 hover:bg-white/10",
  ok: "text-emerald-300 hover:bg-emerald-500/10",
  warn: "text-amber-300 hover:bg-amber-500/10",
  danger: "text-rose-300 hover:bg-rose-500/10",
};

// Small outlined action button used in table rows.
export function RowButton({ tone = "neutral", ...props }) {
  return (
    <button type="button" {...props}
      className={`rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${TONES[tone]}`} />
  );
}

function Skeleton() {
  return (
    <div className="divide-y divide-white/10" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="size-10 animate-pulse rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-48 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-28 animate-pulse rounded bg-white/5" />
          </div>
          <div className="hidden h-6 w-20 animate-pulse rounded-full bg-white/10 sm:block" />
        </div>
      ))}
    </div>
  );
}

function Message({ title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      {text && <p className="max-w-sm text-sm text-gray-400">{text}</p>}
      {action}
    </div>
  );
}

// columns: [{ key, header, render(row), hideOnMobile?, className? }]  (the first column is the row's title)
// status:  "loading" | "ready" | "error"
export default function DataTable({
  columns, rows, status, error, onRetry, rowKey = (r) => r._id, actions,
  emptyTitle = "Nothing here yet", emptyText, filtered = false,
}) {
  if (status === "loading") return <Skeleton />;

  if (status === "error") {
    return (
      <Message title="We couldn't load this" text={error}
        action={
          <button type="button" onClick={onRetry}
            className="mt-3 h-10 rounded-lg bg-white/10 px-5 text-sm font-semibold hover:bg-white/15">
            Try again
          </button>
        } />
    );
  }

  if (rows.length === 0) {
    return filtered
      ? <Message title="No matches" text="Try a different search or filter." />
      : <Message title={emptyTitle} text={emptyText} />;
  }

  const [first, ...rest] = columns;
  const mobileRest = rest.filter((c) => !c.hideOnMobile);

  return (
    <>
      {/* Tablet / desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-400">
              {columns.map((c) => <th key={c.key} scope="col" className="px-6 py-3 font-medium">{c.header}</th>)}
              {actions && <th scope="col" className="px-6 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-white/[0.03]">
                {columns.map((c) => (
                  <td key={c.key} className={`px-6 py-4 text-sm text-gray-300 ${c.className ?? ""}`}>{c.render(row)}</td>
                ))}
                {actions && <td className="px-6 py-4"><div className="flex flex-wrap gap-2">{actions(row)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones */}
      <ul className="divide-y divide-white/10 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="space-y-3 px-5 py-4">
            <div className="min-w-0 text-sm text-white">{first.render(row)}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {mobileRest.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-xs text-gray-500">{c.header}</dt>
                  <dd className="mt-0.5 break-words text-sm text-gray-200">{c.render(row)}</dd>
                </div>
              ))}
            </dl>
            {actions && <div className="flex flex-wrap gap-2 pt-1">{actions(row)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}