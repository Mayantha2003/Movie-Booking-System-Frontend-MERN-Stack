import { useId, useState, type ReactNode } from "react";

const control =
  "w-full rounded-lg border bg-[#0b0f19] px-3.5 text-sm text-white placeholder:text-gray-500 transition " +
  "focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50";

const tone = (error?: string) => (error ? "border-rose-500/70" : "border-white/10 focus:border-red-500");

type FieldType = "text" | "email" | "tel" | "url" | "number" | "date" | "time" | "password" | "textarea" | "select" | "checkbox";

interface Option { value: string; label: string; }

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  type?: FieldType;
  options?: Option[];
  className?: string;
  name?: string;
  value?: string | number | readonly string[] | undefined;
  checked?: boolean;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  required?: boolean;
  rows?: number;
  onChange?: (event: any) => void;
  onBlur?: (event: any) => void;
}

type FieldProps = BaseFieldProps;

// Labelled dark input / select / textarea / checkbox with an error or hint line.
//   type: text | email | tel | url | number | date | time | password | textarea | select | checkbox
//   options (select): [{ value, label }]
export default function Field({
  label, error, hint, optional = false, type = "text", options = [], className = "", ...props
}: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  if (type === "checkbox") {
    return (
      <div className={className}>
        <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#0b0f19] px-3.5 py-3 text-sm text-gray-200">
          <input id={id} type="checkbox" aria-describedby={describedBy}
            className="size-4 accent-red-600" {...props} />
          {label}
        </label>
        {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }

  const common = { id, "aria-invalid": Boolean(error), "aria-describedby": describedBy, ...props };

  let input: ReactNode;
  if (type === "textarea") {
    input = <textarea rows={4} className={`${control} ${tone(error)} py-2.5`} {...common} />;
  } else if (type === "select") {
    input = (
      <select className={`${control} ${tone(error)} h-11 appearance-none pr-9`} {...common}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else {
    const isPassword = type === "password";
    input = (
      <div className="relative">
        <input
          type={isPassword && visible ? "text" : type}
          className={`${control} ${tone(error)} h-11 ${isPassword ? "pr-16" : ""}`}
          {...common}
        />
        {isPassword && (
          <button type="button" onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-gray-400 hover:text-white">
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-200">
        {label}
        {optional && <span className="text-xs font-normal text-gray-500">Optional</span>}
      </label>
      {type === "select" ? (
        <div className="relative">
          {input}
          <span aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">▾</span>
        </div>
      ) : input}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-rose-300">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}