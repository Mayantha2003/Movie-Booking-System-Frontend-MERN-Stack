export const formatNumber = (v) => Number(v || 0).toLocaleString("en-LK");
export const formatMoney = (v) => `Rs. ${Number(v || 0).toLocaleString("en-LK")}`;

export const formatDate = (date, { utc = false } = {}) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", ...(utc ? { timeZone: "UTC" } : {}),
  });
};

// "14:30" -> "2:30 PM". Values that already contain AM/PM are left alone.
export const formatTime = (t) => {
  if (!t) return "—";
  if (/am|pm/i.test(t)) return t;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const fullName = (p) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.username || "—";

export const initialOf = (p) =>
  (p?.first_name || p?.username || "?").charAt(0).toUpperCase();