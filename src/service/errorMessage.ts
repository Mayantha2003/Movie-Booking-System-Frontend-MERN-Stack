import axios from "axios";

// Turns any thrown value into a message that is safe to show to the user.
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data as { message?: string } | undefined;
      return data?.message || fallback;
    }
    if (error.request) {
      return "Cannot reach the server. Please check your connection and try again.";
    }
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};