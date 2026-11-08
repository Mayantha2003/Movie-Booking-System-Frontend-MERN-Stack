// Only full http(s) links are used as images. Anything else (empty, "undefined",
// a relative path, a javascript: link) returns "" so the placeholder is shown.
export const safeImageUrl = (url) => {
  if (typeof url !== "string") return "";
  const value = url.trim();
  return /^https?:\/\/\S+$/i.test(value) ? value : "";
};

// 109 -> "1h 49m", 45 -> "45m"
export const formatDuration = (minutes) => {
  const n = Number(minutes);
  if (!Number.isFinite(n) || n <= 0) return "";
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// Returns the 11 character video id of a YouTube link, or "" if it is not one.
export const getYouTubeId = (url) => {
  if (typeof url !== "string") return "";
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id = "";

    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
      else {
        const [, kind, value] = u.pathname.split("/");
        if (["embed", "shorts", "live", "v"].includes(kind)) id = value || "";
      }
    }
    return /^[\w-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
};