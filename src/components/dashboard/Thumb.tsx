import { useState } from "react";

interface ThumbProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

// Small image with a neutral fallback if the link is missing or broken.
export default function Thumb({ src, alt = "", fallback = "🎬", className = "size-12 rounded-lg" }: ThumbProps) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <span aria-hidden="true" className={`grid shrink-0 place-items-center bg-white/10 text-lg ${className}`}>
        {fallback}
      </span>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`shrink-0 object-cover ${className}`} />;
}