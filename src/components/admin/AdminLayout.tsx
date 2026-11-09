
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
