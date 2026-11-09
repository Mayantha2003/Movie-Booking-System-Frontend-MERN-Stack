
// Helpers shared by the record forms. A field looks like:
//
// { name, label, type, required?, optional?, half?, hint?, placeholder?, min?, max?, step?,
//   integer?, options? (array or (values) => array), lockOnEdit?, onlyOnEdit?, resets? }
//
// type: text | email | tel | url | image | number | date | time | textarea | select | checkbox | list
//
// "list" is a comma separated text box that is sent to the API as an array.

export type FormFieldType = "text" | "email" | "tel" | "url" | "password" | "image" | "number" | "date" | "time" | "textarea" | "select" | "checkbox" | "list";

export interface FormOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  optional?: boolean;
  half?: boolean;
  hint?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  integer?: boolean;
  options?: FormOption[] | ((values: Record<string, unknown>) => FormOption[]);
  lockOnEdit?: boolean;
  onlyOnEdit?: boolean;
  createOnly?: boolean;
  resets?: string[];
  defaultValue?: string | boolean;
  uppercase?: boolean;
  kind?: "poster" | "banner";
}

export type FormValues = Record<string, string | boolean | number | null | undefined>;

const idOf = (v: unknown): unknown => (v && typeof v === "object" && "_id" in v && typeof (v as { _id?: unknown })._id !== "undefined" ? (v as { _id: unknown })._id : v);

// Empty form values
export const emptyValues = (fields: FormField[]): FormValues =>
  Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "checkbox"
        ? Boolean(f.defaultValue ?? false)
        : f.defaultValue ?? "",
    ])
  ) as FormValues;

// API record -> form values
export const recordToForm = (fields: FormField[], record: Record<string, unknown> | null | undefined): FormValues =>
  Object.fromEntries(
    fields.map((f) => {
      const v = idOf(record?.[f.name]);

      if (f.type === "checkbox") return [f.name, Boolean(v)];
      if (f.type === "list") return [f.name, Array.isArray(v) ? v.join(", ") : ""];
      if (f.type === "date") return [f.name, v ? String(v).slice(0, 10) : ""];

      return [f.name, v ?? ""];
    })
  ) as FormValues;

const isEmpty = (v: unknown): boolean => v === "" || v === null || v === undefined;

// Validate form fields
export const validateFields = (fields: FormField[], values: FormValues, editing: boolean): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const f of fields) {
    if ((f.onlyOnEdit && !editing) || (f.createOnly && editing)) continue;

    const v = values[f.name];

    if (f.type === "checkbox") continue;

    if (f.required && (isEmpty(v) || (typeof v === "string" && !v.trim()))) {
      errors[f.name] = `${f.label} is required.`;
      continue;
    }

    if (isEmpty(v)) continue;

    if (f.type === "number") {
      const n = Number(v);

      if (Number.isNaN(n)) {
        errors[f.name] = "Enter a valid number.";
      } else if (f.integer && !Number.isInteger(n)) {
        errors[f.name] = `${f.label} must be a whole number.`;
      } else if (f.min != null && n < f.min) {
        errors[f.name] = `${f.label} must be at least ${f.min}.`;
      } else if (f.max != null && n > f.max) {
        errors[f.name] = `${f.label} must be ${f.max} or less.`;
      }
    } else if (
      (f.type === "url" || f.type === "image") &&
      typeof v === "string" &&
      !/^https?:\/\/\S+$/i.test(v.trim())
    ) {
      errors[f.name] = "Enter a full link starting with http:// or https://.";
    } else if (
      f.type === "email" &&
      typeof v === "string" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ) {
      errors[f.name] = "Enter a valid email address.";
    }
  }

  return errors;
};

// Form values -> API body
// Empty optional values are left out when creating and
// cleared ("", null, []) when editing.
export const formToPayload = (fields: FormField[], values: FormValues, editing: boolean): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  for (const f of fields) {
    if (f.onlyOnEdit && !editing) continue;

    const v = values[f.name];

    if (f.type === "checkbox") {
      body[f.name] = Boolean(v);
    } else if (f.type === "list") {
      body[f.name] = String(v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (f.type === "number") {
      if (!isEmpty(v)) body[f.name] = Number(v);
      else if (editing) body[f.name] = null;
    } else {
      const text = typeof v === "string" ? v.trim() : v;

      if (!isEmpty(text)) body[f.name] = text;
      else if (editing && !f.required) body[f.name] = "";
    }
  }

  return body;
};
