import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

interface HeroProps {
  title?: string;
  titleHighlight?: string;
  description?: string;
  scheduleLabel?: string;
  scheduleTime?: string;
  photoUrl?: string;
  onReserve?: () => void;
  onServices?: () => void;
}

const Hero: React.FC<HeroProps> = ({
  title = "Tu bienestar merece",
  titleHighlight = "lo mejor",
  description = "Descubre una experiencia de cosmetología y bienestar diseñada para ti. Tratamientos personalizados en un espacio de lujo y armonía.",
  scheduleLabel = "Horario",
  scheduleTime = "Lun - Dom  9:00 – 21:00",
  photoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTadG1kNcW00S9Lc4-0Ky2e9G89suoIFJgqwQ&s",
  onReserve,
  onServices,
}) => {
  return (
    <section className="d-flex align-items-center" style={{ minHeight: "92vh", background: "linear-gradient(180deg, #f8f4ec 0%, #f4ede1 100%)", fontFamily: "'Jost', sans-serif", paddingTop: "4.5rem" }}>
      <div className="container">
        <div className="row align-items-center g-5">
          
          <div className="col-12 col-lg-6">
            <p style={{ color: "#8a7448", letterSpacing: "0.12em", fontSize: "0.78rem", textTransform: "uppercase", marginBottom: "0.7rem", fontWeight: 600 }}>
              Alory Cosmetology
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,3.7rem)", fontWeight: 700, color: "#2a1f14", marginBottom: "1rem", lineHeight: 1.08 }}>
              {title} <span style={{ color: "#b8962e" }}>{titleHighlight}</span>
            </h1>
            <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.06rem)", color: "#4a3a29", lineHeight: 1.75, maxWidth: 520 }}>{description}</p>

            <div className="d-flex flex-wrap gap-3 my-4">
              <button 
                className="btn text-white" 
                style={{ backgroundColor: "#b8962e", borderRadius: "999px", padding: "0.72rem 1.55rem", fontWeight: 600, boxShadow: "0 10px 20px rgba(138,111,48,0.25)" }}
                onClick={onReserve}
              >
                Reservar cita
              </button>
              <button
                className="btn btn-outline"
                style={{ borderColor: "#b8962e", color: "#8b6c2d", borderRadius: "999px", padding: "0.72rem 1.45rem", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.75)" }}
                onClick={onServices}
              >
                Ver Servicios
              </button>
            </div>

            <div className="d-inline-flex align-items-center gap-2 p-2 bg-white border rounded" style={{ fontSize: "0.85rem", color: "#3d2e1e", borderColor: "#e4d7ba", boxShadow: "0 8px 22px rgba(36,21,4,0.08)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8962e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#8a7060" }}>{scheduleLabel}</div>
                <div style={{ fontWeight: 600 }}>{scheduleTime}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <img 
              src={photoUrl} 
              alt="Experiencia Alory" 
              className="img-fluid rounded-4" 
              style={{ objectFit: "cover", width: "100%", maxHeight: "640px", boxShadow: "0 18px 50px rgba(40,24,6,0.20)", border: "3px solid rgba(255,255,255,0.65)" }}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;