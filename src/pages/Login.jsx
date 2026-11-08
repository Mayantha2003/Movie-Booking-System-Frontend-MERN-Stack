import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../service/errorMessage";
import { validateLogin } from "../utils/validators";
import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import Banner from "../components/auth/Banner";
import Button from "../components/common/Button";

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();

  const [values, setValues] = useState({ username: location.state?.username ?? "", password: "" });
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
    const found = validateLogin(values);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      // No navigate() here on purpose. login() stores the session and sets the
      // user from the backend's response; GuestRoute then redirects by that
      // user's role (USER -> /, ADMIN -> /admin/dashboard,
      // SUPER_ADMIN -> /super-admin/dashboard).
      await login(values.username.trim(), values.password);
    } catch (error) {
      setServerError(getErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to book tickets and see your bookings."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary-hover hover:underline">Create an account</Link>
        </>
      }
    >
      {location.state?.registered && <Banner tone="success">Account created. You can log in now.</Banner>}
      {serverError && <Banner>{serverError}</Banner>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Username" name="username" autoComplete="username" value={values.username}
          onChange={handleChange} error={errors.username} placeholder="Your username" />
        <FormField label="Password" name="password" type="password" autoComplete="current-password"
          value={values.password} onChange={handleChange} error={errors.password} placeholder="Your password" />
        <Button type="submit" loading={submitting} className="w-full">Log in</Button>
      </form>
    </AuthLayout>
  );
};

export default Login;