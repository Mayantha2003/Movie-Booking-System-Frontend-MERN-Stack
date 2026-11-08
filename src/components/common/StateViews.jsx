import Button from "./Button";
import { AlertIcon } from "./Icons";

export const LoadingState = ({ label = "Loading…", fullScreen = false }) => (
  <div
    role="status"
    className={`flex flex-col items-center justify-center gap-3 text-muted ${fullScreen ? "min-h-screen" : "py-20"}`}
  >
    <span className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
    <span className="text-sm">{label}</span>
  </div>
);

export const EmptyState = ({ title = "Nothing here yet", message, action }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
    <h3 className="text-lg font-bold">{title}</h3>
    {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message = "We couldn't load this.", onRetry }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-14 text-center">
    <span className="text-danger"><AlertIcon /></span>
    <p className="max-w-md text-sm text-muted">{message}</p>
    {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
  </div>
);