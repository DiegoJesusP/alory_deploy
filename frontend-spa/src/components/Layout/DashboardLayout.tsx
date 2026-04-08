import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "./AdminNavbar";
import EmployeeNavbar from "./EmployeeNavbar";

interface Props {
  children: ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-neutral-50">
      {isAdmin ? <AdminNavbar /> : <EmployeeNavbar />}

      <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;