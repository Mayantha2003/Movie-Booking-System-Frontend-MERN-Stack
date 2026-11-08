import { useState } from "react";
import Modal from "../dashboard/Modal";
import Field from "../dashboard/Field";
import Notice from "../dashboard/Notice";
import { createAdmin } from "../../service/superAdmin";
import { getErrorMessage } from "../../service/errorMessage";
import { validateCreateAdmin } from "../../utils/validators";

const EMPTY = { first_name: "", last_name: "", username: "", email: "", phone: "", password: "" };

// onCreated(message) is called after the backend confirms the new admin.
export default function CreateAdminModal({ onClose, onCreated }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateCreateAdmin(values);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const res = await createAdmin(values);
      onCreated(res.message || "Admin created successfully!");
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not create the admin. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create admin account" description="The new admin can sign in at the Admin Portal straight away."
      onClose={onClose} dismissible={!submitting}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && <Notice tone="error">{serverError}</Notice>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" name="first_name" value={values.first_name} onChange={handleChange}
            error={errors.first_name} autoComplete="off" autoFocus />
          <Field label="Last name" name="last_name" value={values.last_name} onChange={handleChange}
            error={errors.last_name} autoComplete="off" />
        </div>
        <Field label="Username" name="username" value={values.username} onChange={handleChange}
          error={errors.username} autoComplete="off" hint="At least 3 characters. Used to sign in." />
        <Field label="Email" name="email" type="email" value={values.email} onChange={handleChange}
          error={errors.email} autoComplete="off" />
        <Field label="Phone" name="phone" type="tel" optional value={values.phone} onChange={handleChange}
          error={errors.phone} autoComplete="off" placeholder="+94 77 123 4567" />
        <Field label="Password" name="password" type="password" value={values.password} onChange={handleChange}
          error={errors.password} autoComplete="new-password" hint="At least 8 characters." />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={submitting}
            className="h-11 rounded-lg border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {submitting ? "Creating…" : "Create admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}