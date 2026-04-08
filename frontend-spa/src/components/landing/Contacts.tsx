import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap');

  .contact-section {
    background: radial-gradient(ellipse at top, #2a2318 0%, #1a1610 40%, #0f0e0b 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 5rem 1rem;
    position: relative;
    overflow: hidden;
    font-family: 'Lato', sans-serif;
  }

  .contact-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(180, 140, 60, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(180, 140, 60, 0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  .contact-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(180, 140, 60, 0.5);
    border-radius: 999px;
    padding: 0.45rem 1.2rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #c9a84c;
    text-transform: uppercase;
    margin-bottom: 2rem;
    background: rgba(180, 140, 60, 0.06);
    backdrop-filter: blur(4px);
  }

  .contact-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.4rem, 6vw, 4.2rem);
    font-weight: 900;
    color: #f0ece4;
    line-height: 1.1;
    margin-bottom: 1.2rem;
  }

  .contact-title span {
    color: #c9a84c;
    font-style: italic;
  }

  .contact-subtitle {
    color: rgba(240, 236, 228, 0.55);
    font-size: 1.05rem;
    font-weight: 300;
    line-height: 1.7;
    max-width: 480px;
    margin: 0 auto 3rem;
  }

  .contact-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(180, 140, 60, 0.2);
    border-radius: 16px;
    padding: 2rem 1.5rem;
    transition: all 0.35s ease;
    cursor: default;
    height: 100%;
  }

  .contact-card:hover {
    background: rgba(180, 140, 60, 0.07);
    border-color: rgba(180, 140, 60, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(180, 140, 60, 0.15);
  }

  .contact-card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
  }

  .contact-card-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(201, 168, 76, 0.7);
    margin-bottom: 0.5rem;
  }

  .contact-card-value {
    font-size: 1rem;
    font-weight: 700;
    color: #f0ece4;
    word-break: break-all;
  }

  .btn-reserve {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: linear-gradient(135deg, #c9a84c 0%, #a8813a 100%);
    color: #0f0e0b;
    border: none;
    border-radius: 8px;
    padding: 0.85rem 2rem;
    font-family: 'Lato', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    margin-top: 2.5rem;
  }

  .btn-reserve:hover {
    background: linear-gradient(135deg, #d9b85c 0%, #b8914a 100%);
    color: #0f0e0b;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(180, 140, 60, 0.35);
    text-decoration: none;
  }

  .divider-line {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #c9a84c, transparent);
    margin: 0 auto 2rem;
  }
`;

interface ContactInfo {
  icon: string;
  label: string;
  value: string;
}

const contactData: ContactInfo[] = [
  {
    icon: "📞",
    label: "Teléfono",
    value: "(555) 123-4567",
  },
  {
    icon: "✉️",
    label: "Email",
    value: "info@alorycosmetology.com",
  },
  {
    icon: "📍",
    label: "Ubicación",
    value: "Av. Reforma 123, CDMX",
  },
];

const Contacts: React.FC = () => {
  return (
    <>
      <style>{styles}</style>
      <section id="contacto" className="contact-section">
        <div className="container">
          <div className="text-center">

            {/* Badge */}
            <div className="d-flex justify-content-center">
              <span className="contact-badge">
                ✦ Contáctanos
              </span>
            </div>

            {/* Heading */}
            <h2 className="contact-title">
              ¿Lista para <span>Transformarte?</span>
            </h2>

            <div className="divider-line" />

            {/* Subtitle */}
            <p className="contact-subtitle">
              Agenda tu cita hoy y descubre el lujo de la cosmetología profesional en Alory Cosmetology
            </p>

            {/* Contact Cards */}
            <div className="row g-3 justify-content-center mb-2">
              {contactData.map((item) => (
                <div key={item.label} className="col-12 col-sm-6 col-md-4">
                  <div className="contact-card text-center">
                    <span className="contact-card-icon">{item.icon}</span>
                    <p className="contact-card-label">{item.label}</p>
                    <p className="contact-card-value mb-0">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div>
              <a href="#reservar" className="btn-reserve">
                ☆ &nbsp;Reservar Ahora
              </a>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contacts;
