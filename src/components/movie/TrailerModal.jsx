import { useEffect } from "react";

// Plays a YouTube trailer. Closes with Escape, the × button or a click outside.
const TrailerModal = ({ videoId, title, onClose }) => {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="truncate text-lg font-bold text-white">{title} · Trailer</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trailer"
            className="grid size-10 place-items-center rounded-lg text-2xl text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;