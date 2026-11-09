import type { ReactNode } from "react";

interface BannerProps {
  tone?: "success" | "error" | "info";
  children: ReactNode;
  className?: string;
}

const toneClasses = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  error: "border-red-500/25 bg-red-500/10 text-red-100",
  info: "border-primary/25 bg-primary/10 text-primary-foreground",
};

const Banner = ({ tone = "info", children, className = "" }: BannerProps) => (
  <div
    className={`rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm ${toneClasses[tone]} ${className}`.trim()}
    role="status"
  >
    {children}
  </div>
);

export default Banner;
