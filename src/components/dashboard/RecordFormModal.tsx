
import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import Field from "./Field";
import ImageField from "./ImageField";
import Notice from "./Notice";
import { getErrorMessage } from "../../service/errorMessage";
import { emptyValues, recordToForm, validateFields, formToPayload, type FormField, type FormValues } from "./form";

export type RecordFormField = FormField;
export type RecordFormPayload = Record<string, unknown>;
export type SaveResult = { message?: string };

interface RecordFormModalProps {
  noun: string;
  fields: RecordFormField[];
  record?: Record<string, unknown> | null;
  validate?: (values: FormValues, editing: boolean) => Record<string, string>;
  buildPayload?: (body: RecordFormPayload, values: FormValues, editing: boolean) => RecordFormPayload;
  onSave: (body: RecordFormPayload) => Promise<SaveResult>;
  onSaved: (message: string) => void;
  onClose: () => void;
  wide?: boolean;
}

// Create / edit dialog built from a list of field definitions (see form.js).
//   record: the row being edited (null = creating)
//   validate(values, editing) -> { field: message }   extra page-specific rules
//   buildPayload(body, values, editing) -> body       final tweaks before sending
//   onSave(body) -> Promise<response>                 throws on API errors
export default function RecordFormModal({
  noun, fields, record, validate, buildPayload, onSave, onSaved, onClose, wide = true,
}: RecordFormModalProps) {
  const editing = Boolean(record);
  const [values, setValues] = useState<FormValues>(() => (editing ? recordToForm(fields, record) : emptyValues(fields)));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setValue = (field: RecordFormField, value: string | boolean | number | null | undefined) => {
    setValues((v) => {
      const next: FormValues = { ...v, [field.name]: value };
      (field.resets ?? []).forEach((n) => { next[n] = ""; });
      return next;
    });
    if (errors[field.name]) setErrors((er) => ({ ...er, [field.name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    const validation = { ...validateFields(fields, values, editing), ...(validate?.(values, editing) ?? {}) };
    const found = validation as Record<string, string | undefined>;
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setSubmitting(true);
    try {
      let body: RecordFormPayload = formToPayload(fields, values, editing);
      if (buildPayload) body = buildPayload(body, values, editing);
      const res = await onSave(body);
      onSaved(res.message || `${noun} saved.`);
    } catch (error) {
      setServerError(getErrorMessage(error, `Could not save the ${noun.toLowerCase()}. Please try again.`));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}
      onClose={onClose}
      dismissible={!submitting}
      size={wide ? "max-w-2xl" : "max-w-lg"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && <Notice tone="error">{serverError}</Notice>}

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => {
            if ((f.onlyOnEdit && !editing) || (f.createOnly && editing)) return null;

            if (f.type === "image") {
              const rawValue = values[f.name] as unknown;
              const imageValue = typeof rawValue === "string" ? rawValue : "";
              return (
                <ImageField
                  key={f.name}
                  label={f.label}
                  kind={f.kind}
                  optional={!f.required}
                  hint={f.hint}
                  error={typeof errors[f.name] === "string" ? errors[f.name] : undefined}
                  value={imageValue}
                  onChange={(v) => setValue(f, v)}
                  className={f.half ? "" : "sm:col-span-2"}
                />
              );
            }

            const options = typeof f.options === "function" ? f.options(values) : f.options;
            const isCheckbox = f.type === "checkbox";
            const type = f.type === "list" ? "text" : f.type;
            const rawValue = values[f.name] as unknown;
            const fieldValue = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : "";

            return (
              <Field
                key={f.name}
                label={f.label}
                type={type}
                options={options}
                optional={!f.required && !isCheckbox}
                hint={f.hint ?? (f.type === "list" ? "Separate items with commas." : undefined)}
                error={typeof errors[f.name] === "string" ? errors[f.name] : undefined}
                placeholder={f.placeholder}
                min={f.min}
                max={f.max}
                step={f.step}
                disabled={editing && f.lockOnEdit}
                autoComplete="off"
                className={f.half ? "" : "sm:col-span-2"}
                {...(isCheckbox
                  ? { checked: Boolean(values[f.name]), onChange: (e) => setValue(f, (e.target as HTMLInputElement).checked) }
                  : { value: fieldValue as string | number | readonly string[] | undefined, onChange: (e) => setValue(f, f.uppercase ? (e.target as HTMLInputElement).value.toUpperCase() : (e.target as HTMLInputElement).value) })}
              />
            );
          })}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={submitting}
            className="h-11 rounded-lg border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {submitting ? "Saving…" : editing ? "Save changes" : `Add ${noun.toLowerCase()}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
