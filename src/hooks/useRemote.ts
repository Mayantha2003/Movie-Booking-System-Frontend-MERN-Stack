import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../service/errorMessage";
import type { ApiResponse } from "../types/api";

export type RemoteStatus = "loading" | "ready" | "error";

export default function useRemote<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  errorFallback = "Could not load data."
) {
  const [state, setState] = useState<{ status: RemoteStatus; data: T | null; error: string }>({
    status: "loading",
    data: null,
    error: "",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((res) => {
        if (!cancelled) setState({ status: "ready", data: res.data, error: "" });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ status: "error", data: null, error: getErrorMessage(error, errorFallback) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, errorFallback, attempt]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: "loading", error: "" }));
    setAttempt((n) => n + 1);
  }, []);

  const mutate = useCallback((fn: (current: T) => T) => {
    setState((s) => (s.data ? { ...s, data: fn(s.data) } : s));
  }, []);

  return { ...state, reload, mutate };
}
