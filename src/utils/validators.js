const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9\s-]{7,15}$/;

export const validateLogin = ({ username, password }) => {
  const errors = {};
  if (!username.trim()) errors.username = "Enter your username.";
  if (!password) errors.password = "Enter your password.";
  return errors;
};

export const validateRegister = (v) => {
  const errors = {};
  if (!v.first_name.trim()) errors.first_name = "First name is required.";
  if (!v.last_name.trim()) errors.last_name = "Last name is required.";
  if (v.username.trim().length < 3) errors.username = "Username must be at least 3 characters.";
  if (v.email.trim() && !EMAIL.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (v.phone.trim() && !PHONE.test(v.phone.trim())) errors.phone = "Enter a valid phone number.";
  if (v.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (v.confirmPassword !== v.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
};

export const validateCreateAdmin = (v) => {
  const errors = {};
  if (!v.first_name.trim()) errors.first_name = "First name is required.";
  if (!v.last_name.trim()) errors.last_name = "Last name is required.";
  if (v.username.trim().length < 3) errors.username = "Username must be at least 3 characters.";
  if (!v.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (v.phone.trim() && !PHONE.test(v.phone.trim())) errors.phone = "Enter a valid phone number.";
  if (v.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
};