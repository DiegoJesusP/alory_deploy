import React from "react";

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: "linear-gradient(180deg, #1a1a1a 0%, #111111 100%)",
    borderTop: "1px solid #b8973a55",
    color: "#e8d9a0",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    letterSpacing: "0.04em",
    padding: "2.5rem 1rem 1.5rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    marginBottom: "0.25rem",
  },
  logoIcon: {
    width: 38,
    height: 38,
    fill: "#c9a84c",
    flexShrink: 0,
  },
  brandName: {
    fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
    fontWeight: 600,
    color: "#c9a84c",
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    lineHeight: 1.1,
  },
  brandBold: {
    fontWeight: 700,
  },
  tagline: {
    fontSize: "0.65rem",
    letterSpacing: "0.22em",
    color: "#9a8350",
    textTransform: "uppercase" as const,
    marginBottom: "1.6rem",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #b8973a33",
    margin: "0 auto 1.4rem",
    maxWidth: 340,
  },
  socialLink: {
    color: "#c9a84c",
    textDecoration: "none",
    fontSize: "0.82rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    transition: "color 0.2s, opacity 0.2s",
    padding: "0.3rem 0.5rem",
  },
  copyright: {
    fontSize: "0.78rem",
    color: "#c9a84c",
    marginBottom: "0.25rem",
  },
  since: {
    fontSize: "0.68rem",
    color: "#7a6a3a",
    letterSpacing: "0.1em",
    fontStyle: "italic",
  },
};

interface SocialLink {
  label: string;
  href: string;
}

const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/alory.cosmetology/?locale=es_LA" },
  { label: "Instagram", href: "https://www.instagram.com/alorycosmetology/" },
  { label: "WhatsApp", href: "https://wa.me/" },
];

const SparkleIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    aria-hidden="true"
  >
    <path d="M24 4 L26.5 20 L44 22 L26.5 24 L24 44 L21.5 24 L4 22 L21.5 20 Z" />
    <path d="M36 6 L37 11 L42 12 L37 13 L36 18 L35 13 L30 12 L35 11 Z" />
  </svg>
);

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div className="container">

        <div className="text-center">
          <div style={styles.logo}>
            <SparkleIcon style={styles.logoIcon} />
            <span style={styles.brandName}>
              <span style={styles.brandBold}>Alory</span> Cosmetology
            </span>
          </div>
          <p style={styles.tagline}>Wellness Center</p>

          <hr style={styles.divider} />

          <nav aria-label="Social media links">
            <div className="d-flex flex-wrap justify-content-center gap-1 mb-4">
              {socialLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLAnchorElement).style.color = "#e8d9a0")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLAnchorElement).style.color = "#c9a84c")
                  }
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <hr style={styles.divider} />

          <p style={styles.copyright}>
            © {year} Alory Cosmetology. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;