import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "../common/Icons";

// Labelled input with an error message. type="password" gets a show/hide toggle.
const FormField = ({ label, error, hint, type = "text", className = "", ...props }) => {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70
            transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${isPassword ? "pr-11" : ""}
            ${error ? "border-danger" : "border-line focus:border-primary"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-ink"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
};

export default FormField;