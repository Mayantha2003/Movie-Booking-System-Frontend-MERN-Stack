import { useState } from "react";
import { safeImageUrl } from "../../utils/media";

interface PlaceholderProps {
  title?: string;
  className?: string;
}

const Placeholder = ({ title, className = "" }: PlaceholderProps) => (
  <div
    role="img"
    aria-label={title ? `${title} (no poster)` : "No poster"}
    className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1E293B] via-[#151F30] to-[#7F0A1E] p-4 text-center ${className}`}
  >
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </svg>
    {title && <span className="line-clamp-3 text-sm font-extrabold leading-snug text-white/90">{title}</span>}
  </div>
);

interface MoviePosterProps {
  movie?: { poster?: string; title?: string };
  className?: string;
}

const MoviePoster = ({ movie, className = "" }: MoviePosterProps) => {
  const src = safeImageUrl(movie?.poster);
  const [failedSrc, setFailedSrc] = useState("");

  if (!src || failedSrc === src) return <Placeholder title={movie?.title} className={className} />;

  return (
    <img
      src={src}
      alt={`${movie?.title ?? "Movie"} poster`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  );
};

export default MoviePoster;
