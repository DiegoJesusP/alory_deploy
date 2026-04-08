import type { ServiceCardItem } from '@/types/service.types';
import ServiceCard from './ServiceCard';

interface Props {
  services: ServiceCardItem[];
}

export default function ServicesCarousel({ services }: Props) {
  return (
    <section id="servicios" className="py-16 px-4" style={{ background: "linear-gradient(180deg, #fffaf1 0%, #fff 100%)" }}>
      <div className="container">
        <div className="text-center mb-10">
          <p className="uppercase tracking-[0.18em] text-[0.75rem] text-[#9a814e] font-semibold mb-2">Catálogo</p>
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2a1f14" }}>
            Servicios Diseñados Para Ti
          </h2>
          <p className="text-[#6a5b47] mt-3 mx-auto" style={{ maxWidth: "620px" }}>
            Selecciona tratamientos faciales, corporales y experiencias de bienestar con atención personalizada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
        </div>
      </div>
    </section>
  );
}
