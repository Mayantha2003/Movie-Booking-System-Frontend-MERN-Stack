import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { ROLES } from "../utils/roles";
import { getErrorMessage } from "../service/errorMessage";
import { validateLogin } from "../utils/validators";

import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import Banner from "../components/auth/Banner";
import Button from "../components/common/Button";

// Only staff accounts may sign in from this page.
const STAFF_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const AdminLogin = () => {
  const { login } = useAuth();

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validateLogin(values);
    setErrors(found);
    setServerError("");

    if (Object.keys(found).length) return;

    setSubmitting(true);

    try {
      // acceptRoles makes the check happen before anything is stored, so a
      // customer who types their details here never gets a session at all.
      // On success GuestRoute redirects by role (ADMIN -> /admin/dashboard,
      // SUPER_ADMIN -> /super-admin/dashboard).
      await login(values.username.trim(), values.password, {
        acceptRoles: STAFF_ROLES,
      });
    } catch (error) {
      setServerError(
        error.code === "ROLE_NOT_ALLOWED"
          ? "Access denied! Admin account required."
          : getErrorMessage(error, "Admin login failed.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Sign in to manage your cinema system."
    >
      {serverError && <Banner>{serverError}</Banner>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Admin Username"
          name="username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="Enter admin username"
          autoComplete="username"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter password"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          loading={submitting}
          className="w-full"
        >
          Admin Login
        </Button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;