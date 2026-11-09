import type { ReactNode } from "react";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

interface BookingShellProps {
  children: ReactNode;
}

export default function BookingShell({ children }: BookingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
