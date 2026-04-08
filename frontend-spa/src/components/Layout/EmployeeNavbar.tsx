import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Clientes", to: "/dashboard/clientes" },
  { label: "Citas", to: "/dashboard/citas" },
];

export default function EmployeeNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesion cerrada");
      navigate("/", { replace: true });
    } catch {
      toast.error("No se pudo cerrar sesion");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#dfd2bb] bg-[#f8f4ec]/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <button
          type="button"
          className="flex h-full items-center justify-center text-left"
          onClick={() => navigate("/dashboard")}
          aria-label="Ir al panel empleado"
        >
          <p className="m-0 block text-[0.82rem] uppercase tracking-[0.3em] leading-none text-[#9a814e]">Alory</p>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium !no-underline hover:!no-underline focus:!no-underline focus-visible:!no-underline active:!no-underline visited:!no-underline outline-none transition focus-visible:rounded-sm ${
                  isActive
                    ? "!text-[#8b6c2d] visited:!text-[#8b6c2d] active:!text-[#8b6c2d] focus-visible:!text-[#8b6c2d]"
                    : "!text-[#5a4a33] visited:!text-[#5a4a33] active:!text-[#5a4a33] focus-visible:!text-[#5a4a33] hover:!text-[#b8962e]"
                }`
              }
              end={link.to === "/dashboard"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-[#b8962e] px-4 py-2 text-sm font-semibold text-[#8b6c2d] transition hover:bg-[#b8962e] hover:text-white"
        >
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}