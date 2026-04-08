import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getHomePathByRole } from "@/router/role-home";

const sections = [
  { label: "Inicio", id: "inicio" },
  { label: "Servicios", id: "servicios" },
  { label: "Nosotros", id: "nosotros" },
  { label: "Contacto", id: "contacto" },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false);

  const goToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ctaPath = isAuthenticated && user ? getHomePathByRole(user.role) : "/login";
  const ctaLabel = isAuthenticated && user ? "Ir al panel" : "Administracion";

  const handleCtaClick = () => {
    if (ctaPath !== "/login") {
      navigate(ctaPath);
      return;
    }

    if (isNavigatingToLogin) return;

    setIsNavigatingToLogin(true);
    window.setTimeout(() => {
      navigate("/login", { state: { fromLandingAdmin: true } });
    }, 220);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#dfd2bb] bg-[#f8f4ec]/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 md:px-8">
          <button
            type="button"
            className="flex h-full items-center justify-center text-left"
            onClick={() => goToSection("inicio")}
            aria-label="Ir al inicio"
          >
            <p className="m-0 block text-[0.82rem] uppercase tracking-[0.3em] leading-none text-[#9a814e]">Alory</p>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => goToSection(section.id)}
                className="text-sm font-medium text-[#5a4a33] transition hover:text-[#b8962e]"
              >
                {section.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleCtaClick}
            disabled={isNavigatingToLogin}
            aria-busy={isNavigatingToLogin}
            className="rounded-full border border-[#b8962e] px-4 py-2 text-sm font-semibold text-[#8b6c2d] transition hover:bg-[#b8962e] hover:text-white disabled:cursor-wait disabled:opacity-75"
          >
            {ctaLabel}
          </button>
        </div>
      </header>

      {isNavigatingToLogin ? <div aria-hidden="true" className="landing-login-transition" /> : null}
    </>
  );
}