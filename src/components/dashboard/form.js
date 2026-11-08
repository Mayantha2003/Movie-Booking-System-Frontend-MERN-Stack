
// Helpers shared by the record forms. A field looks like:
//
// { name, label, type, required?, optional?, half?, hint?, placeholder?, min?, max?, step?,
//   integer?, options? (array or (values) => array), lockOnEdit?, onlyOnEdit?, resets? }
//
// type: text | email | tel | url | image | number | date | time | textarea | select | checkbox | list
//
// "list" is a comma separated text box that is sent to the API as an array.

const idOf = (v) => (v && typeof v === "object" && v._id ? v._id : v);

// Empty form values
export const emptyValues = (fields) =>
  Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "checkbox"
        ? Boolean(f.defaultValue ?? false)
        : f.defaultValue ?? "",
    ])
  );

// API record -> form values
export const recordToForm = (fields, record) =>
  Object.fromEntries(
    fields.map((f) => {
      const v = idOf(record?.[f.name]);

      if (f.type === "checkbox") return [f.name, Boolean(v)];
      if (f.type === "list") return [f.name, Array.isArray(v) ? v.join(", ") : ""];
      if (f.type === "date") return [f.name, v ? String(v).slice(0, 10) : ""];

      return [f.name, v ?? ""];
    })
  );

const isEmpty = (v) => v === "" || v === null || v === undefined;

// Validate form fields
export const validateFields = (fields, values, editing) => {
  const errors = {};

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
      !/^https?:\/\/\S+$/i.test(v.trim())
    ) {
      errors[f.name] = "Enter a full link starting with http:// or https://.";
    } else if (
      f.type === "email" &&
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
export const formToPayload = (fields, values, editing) => {
  const body = {};

  for (const f of fields) {
    if (f.onlyOnEdit && !editing) continue;

    const v = values[f.name];

    if (f.type === "checkbox") {
      body[f.name] = Boolean(v);
    } else if (f.type === "list") {
      body[f.name] = String(v)
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
