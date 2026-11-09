import FormField from "../auth/FormField";

interface GuestDetailsFormProps {
  values: { name: string; email: string; phone: string };
  errors: Partial<Record<"name" | "email" | "phone", string>>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GuestDetailsForm({ values, errors, onChange }: GuestDetailsFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Full name"
        name="name"
        autoComplete="name"
        value={values.name}
        onChange={onChange}
        error={errors.name}
        placeholder="Your full name"
        className="sm:col-span-2"
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={onChange}
        error={errors.email}
        placeholder="you@example.com"
        hint="Your booking ID is shown on the next page."
      />
      <FormField
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={onChange}
        error={errors.phone}
        placeholder="+94 77 123 4567"
      />
    </div>
  );
}
