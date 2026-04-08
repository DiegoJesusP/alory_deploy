import { useEffect, useState } from "react";
import LandingNavbar from "./../../components/landing/LandingNavbar";
import Hero from "./../../components/landing/Hero";
import ServicesCarousel from "./../../components/landing/ServicesCarousel";
import About from "./../../components/landing/About";
import Contacts from "./../../components/landing/Contacts";
import Footer from "./../../components/landing/Footer";
import type { ServiceCardItem, ServiceEntity } from "./../../types/service.types";
import { getPublicActiveServices } from "@/services/serviceService";

interface Props {
  services?: ServiceCardItem[];
}

export default function LandingPage({ services = [] }: Props) {
  const [apiServices, setApiServices] = useState<ServiceCardItem[]>([]);

  const defaultServices: ServiceCardItem[] = [
    {
      id: '1',
      title: 'Faciales',
      description: 'Tratamientos premium',
      price: 'Desde $120',
      imageUrl: '...'
    },
    {
      id: '2',
      title: 'Belleza',
      description: 'Maquillaje y más',
      price: 'Desde $80',
      imageUrl: '...'
    }
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        const activeServices = await getPublicActiveServices();
        const mapped = activeServices.map((service: ServiceEntity) => ({
          id: service.id,
          title: service.name,
          description: service.description?.trim() || "Servicio profesional en Alory.",
          price: `$${Number(service.price).toFixed(2)}`,
          imageUrl: service.image?.trim() || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop"
        }));

        setApiServices(mapped);
      } catch {
        setApiServices([]);
      }
    };

    void loadServices();
  }, []);

  const displayServices = services.length ? services : apiServices.length ? apiServices : defaultServices;

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="inicio" style={{ backgroundColor: "#f8f4ec" }}>
      <LandingNavbar />

      <Hero
        onReserve={() => scrollToSection("contacto")}
        onServices={() => scrollToSection("servicios")}
      />

      <ServicesCarousel services={displayServices} />
      <About />
      <Contacts />

      <Footer />
    </div>
  );
}
