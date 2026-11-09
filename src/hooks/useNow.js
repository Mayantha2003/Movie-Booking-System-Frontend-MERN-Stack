import { useEffect, useState } from "react";

// Returns the current time and refreshes it every `intervalMs`,
// so showtimes flip to "Lapsed" while the page stays open.
export default function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}