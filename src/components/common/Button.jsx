const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-glow",
  secondary: "border border-line bg-card text-ink hover:border-primary",
  ghost: "text-muted hover:bg-card hover:text-ink",
};
const sizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-12 px-8 text-base" };

const Button = ({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition
      disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading && (
      <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    )}
    {children}
  </button>
);

export default Button;