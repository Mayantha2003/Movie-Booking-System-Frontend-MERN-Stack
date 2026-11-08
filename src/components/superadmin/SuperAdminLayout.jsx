import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white md:flex">
      <SuperAdminSidebar />
      <main className="min-w-0 flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}