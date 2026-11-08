import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../service/errorMessage";

// Loads data once and exposes { status, data, error, reload, mutate }.
//   status: "loading" | "ready" | "error"
//   reload():    fetch again (shows the loading state)
//   mutate(fn):  change the loaded data locally (e.g. after delete / toggle)
// `fetcher` must be a stable function (a module-level service function).
export default function useRemote(fetcher, errorFallback = "Could not load data.") {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((res) => {
        if (!cancelled) setState({ status: "ready", data: res.data, error: "" });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: "error", data: null, error: getErrorMessage(error, errorFallback) });
        }
      });

    return () => { cancelled = true; };
  }, [fetcher, errorFallback, attempt]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: "loading", error: "" }));
    setAttempt((n) => n + 1);
  }, []);

  const mutate = useCallback(
    (fn) => setState((s) => (s.data ? { ...s, data: fn(s.data) } : s)),
    []
  );

  return { ...state, reload, mutate };
}