import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const features = [
  {
    icon: "✦",
    label: "Profesionales Certificados",
  },
  {
    icon: "✦",
    label: "Atención Personalizada",
  },
  {
    icon: "✦",
    label: "Productos Premium",
  },
];

const styles: Record<string, React.CSSProperties> = {
  section: {
    backgroundColor: "#f5f0e8",
    padding: "80px 0",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    aspectRatio: "4/3",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imageBadge: {
    position: "absolute",
    bottom: "18px",
    right: "18px",
    backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(6px)",
    borderRadius: "50px",
    padding: "6px 16px",
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#7a6a50",
    fontFamily: "'Lato', sans-serif",
    fontWeight: 600,
  },
  heading: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontWeight: 700,
    fontSize: "clamp(2rem, 4vw, 2.8rem)",
    color: "#2c2418",
    letterSpacing: "-0.01em",
    marginBottom: "1.2rem",
    lineHeight: 1.1,
  },
  accent: {
    color: "#b89a5e",
  },
  divider: {
    width: "48px",
    height: "2px",
    backgroundColor: "#b89a5e",
    marginBottom: "1.5rem",
  },
  body: {
    fontFamily: "'Lato', sans-serif",
    fontSize: "1rem",
    lineHeight: 1.8,
    color: "#5a4f3e",
    marginBottom: "2.5rem",
    fontWeight: 400,
  },
  featureCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #e8dfc8",
    borderLeft: "4px solid #b89a5e",
    borderRadius: "12px",
    padding: "16px 22px",
    marginBottom: "12px",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "default",
  },
  featureIcon: {
    color: "#b89a5e",
    fontSize: "1rem",
    flexShrink: 0,
  },
  featureLabel: {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#2c2418",
    letterSpacing: "0.02em",
    margin: 0,
  },
};

const About: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const fadeStyle = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        .alory-feature-card:hover {
          transform: translateX(6px);
          box-shadow: 0 6px 24px rgba(184,154,94,0.15) !important;
        }
      `}</style>

      <section id="nosotros" style={styles.section} ref={sectionRef}>
        <div className="container">
          <div className="row align-items-center g-5">

            <div className="col-12 col-md-5" style={fadeStyle(0)}>
              <div style={styles.imageWrapper}>
                <img
                  src="https://cdn.aarp.net/content/dam/aarp/entertainment/beauty-and-style/2018/08/1140-candlelight-esp.jpg"
                  alt="Ambiente ALORY"
                  style={styles.img}
                />
                <span style={styles.imageBadge}>ALORY</span>
              </div>
            </div>

            <div className="col-12 col-md-7">

              <div style={fadeStyle(0.1)}>
                <h2 style={styles.heading}>
                  Sobre <span style={styles.accent}>Nosotros</span>
                </h2>
                <div style={styles.divider} />
              </div>

              <div style={fadeStyle(0.2)}>
                <p style={styles.body}>
                  En <strong>ALORY</strong> creamos experiencias donde la
                  estética avanzada y el bienestar integral se encuentran. Cada
                  tratamiento facial y corporal es personalizado, diseñado para
                  cuidar tu piel, relajar tu cuerpo y devolver equilibrio a tu
                  mente. Los cuales se complementan con aromaterapia, música
                  relajante y en cortesía una infusión herbal relajante.
                </p>
              </div>

              <div>
                {features.map((f, i) => (
                  <div
                    key={f.label}
                    className="alory-feature-card"
                    style={{ ...styles.featureCard, ...fadeStyle(0.3 + i * 0.1) }}
                  >
                    <span style={styles.featureIcon}>{f.icon}</span>
                    <p style={styles.featureLabel}>{f.label}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
