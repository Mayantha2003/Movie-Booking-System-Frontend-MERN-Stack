export const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
);

export const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4.5" />
    <path d="M3 22c0-5 4-8 9-8s9 3 9 8z" />
  </svg>
);

export const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z" />
  </svg>
);

export const PlayIcon = ({ size = 56 }) => (
  <span
    className="flex items-center justify-center rounded-full bg-[#C8102E] text-white shadow-lg"
    style={{ width: size, height: size }}
  >
    <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4l14 8-14 8z" />
    </svg>
  </span>
);

export const ClapperLogo = () => (
  <svg width="34" height="34" viewBox="0 0 64 64">
    <rect x="6" y="26" width="52" height="32" rx="5" fill="#C8102E" />
    <path d="M6 22 L10 10 L58 14 L56 26 L6 26Z" fill="#C8102E" />
    <path d="M14 12 L22 13 L18 25 L10 25Z M28 13 L36 14 L32 25 L24 25Z M42 14 L50 15 L46 25 L38 25Z" fill="#fff" />
    <path d="M26 33 L26 51 L42 42Z" fill="#fff" />
  </svg>
);