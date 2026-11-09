export const safeImageUrl = (url: unknown): string => {
  if (typeof url !== "string") return "";
  const value = url.trim();
  return /^https?:\/\/\S+$/i.test(value) ? value : "";
};

export const formatDuration = (minutes: number): string => {
  const n = Number(minutes);
  if (!Number.isFinite(n) || n <= 0) return "";
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const getYouTubeId = (url: string): string => {
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
