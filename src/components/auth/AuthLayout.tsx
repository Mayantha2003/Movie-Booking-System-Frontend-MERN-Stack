import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}

const AuthLayout = ({ title, subtitle, footer, children, compact = false }: AuthLayoutProps) => (
  <main className="flex min-h-screen items-start justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_25%),linear-gradient(135deg,#0b1220_0%,#111827_35%,#151f30_100%)] px-4 py-6 text-white sm:px-6 sm:py-5 lg:items-center lg:px-8">
    <div className="mx-auto grid w-full max-w-6xl gap-4 overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/35 backdrop-blur-sm lg:-translate-y-4 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
      <div className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 p-6 sm:min-h-[280px] sm:p-8 lg:min-h-[540px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_25%)]" />
        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-primary/90">
            Movie Booking
          </div>
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight text-white">
            Access your next unforgettable screening.
          </h2>
        </div>

        <div className="relative z-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary shadow-lg shadow-primary/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6" aria-hidden="true">
                <path d="M4 8V6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V8" />
                <path d="M4 8h16v9.5A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5V8Z" />
                <path d="M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300">Cinema</p>
              <p className="text-lg font-semibold text-white">Smart booking</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            Manage bookings, discover premieres, and keep every seat reservation on track.
          </p>
        </div>
      </div>

      <div className={`flex items-center justify-center ${compact ? "p-4 sm:p-5 lg:p-6" : "p-5 sm:p-8 lg:p-10"}`}>
        <div className="w-full max-w-md">
          <div className={compact ? "mb-4" : "mb-8"}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-primary">Welcome</p>
            <h1 className={`${compact ? "text-2xl" : "text-3xl"} font-black text-white`}>{title}</h1>
            {subtitle && <p className={`${compact ? "mt-1 leading-5" : "mt-2 leading-6"} text-sm text-slate-300`}>{subtitle}</p>}
          </div>

          {children}

          {footer && (
            <div className={`${compact ? "mt-3 pt-3" : "mt-7 pt-5"} border-t border-white/10 text-center text-sm text-slate-300`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
);

export default AuthLayout;
