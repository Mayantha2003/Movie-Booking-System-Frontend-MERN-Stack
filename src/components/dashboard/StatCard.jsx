// Same card as the original Admin dashboard stats, with a loading state.
export default function StatCard({ title, value, icon, hint, loading = false, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#111827] p-6 transition hover:border-white/20 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <span className="text-2xl" aria-hidden="true">{icon}</span>
      </div>
      {loading ? (
        <div className="h-9 w-28 animate-pulse rounded-lg bg-white/10" aria-label="Loading" />
      ) : (
        <h2 className="truncate text-3xl font-bold">{value}</h2>
      )}
      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}