// Turns any axios error into a message that is safe to show to the user.
//   - Server answered   -> the backend's own { message }
//   - No answer at all  -> a "cannot reach the server" message
//   - Anything else     -> the error's message, or the fallback
export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (error?.response) {
    return error.response.data?.message || fallback;
  }
  if (error?.request) {
    return "Cannot reach the server. Please check your connection and try again.";
  }
  return error?.message || fallback;
};