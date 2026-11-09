import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../service/errorMessage";
import { validateRegister } from "../utils/validators";

import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import Banner from "../components/auth/Banner";
import Button from "../components/common/Button";

interface RegisterValues {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const empty: RegisterValues = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<RegisterValues>(empty);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues((v) => ({
      ...v,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((er) => ({
        ...er,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const found = validateRegister(values);
    setErrors(found);
    setServerError("");

    if (Object.keys(found).length) return;

    const payload: Record<string, string> = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      username: values.username.trim(),
      password: values.password,
    };

    if (values.email.trim()) {
      payload.email = values.email.trim();
    }

    if (values.phone.trim()) {
      payload.phone = values.phone.trim();
    }

    setSubmitting(true);

    try {
      await register(payload);

      navigate("/login", {
        replace: true,
        state: { registered: true, username: payload.username },
      });
    } catch (error) {
      setServerError(getErrorMessage(error, "Registration failed. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and enjoy your movie experience."
      compact
      footer={
        <>
          <span className="text-muted">Already have an account?</span>{" "}
          <Link to="/login" className="font-bold text-primary transition hover:text-primary-hover hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="mb-2 text-center">
        <div className="mx-auto mb-1.5 grid size-10 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7V4h3l2 3h4l2-3h3v3" />
            <path d="M4 7h16v13H4z" />
            <path d="M9 7v13M15 7v13" />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Movie Booking System</p>
      </div>

      {serverError && (
        <div className="mb-5">
          <Banner>{serverError}</Banner>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-2 [&_input]:h-10 [&_label]:mb-1"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <FormField
            label="First name"
            name="first_name"
            autoComplete="given-name"
            value={values.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />

          <FormField
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            value={values.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />
        </div>

        <FormField
          label="Username"
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          hint="You will use this to log in."
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <FormField
            label="Email (optional)"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            label="Phone (optional)"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
          />
        </div>

        <div className="border-t border-line pt-2">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">Security Information</p>

          <div className="grid gap-2.5 lg:grid-cols-2">
            <FormField
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              hint="At least 8 characters."
            />

            <FormField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>
        </div>

        <div className="pt-1">
          <Button type="submit" loading={submitting} className="w-full">
            Create Account
          </Button>
        </div>

        <p className="text-center text-xs leading-4 text-muted">
          By creating an account, you can manage your movie bookings and enjoy a better booking experience.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
