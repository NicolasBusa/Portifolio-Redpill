import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Link, Mail } from "lucide-react";
import type { Content } from "@/lib/content";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const icons = { github: GithubIcon, linkedin: LinkedinIcon, email: Mail, link: Link };

function ContactLink({
  label,
  sublabel,
  icon: Icon,
  href,
  delay,
}: {
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number }>;
  href?: string;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = (e: React.MouseEvent) => {
    if (!href || reduced || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    e.preventDefault();
    clearTimeout(timer.current);
    setClicked(true);
    timer.current = setTimeout(() => {
      setClicked(false);
      window.location.assign(href);
    }, 1200);
  };

  return (
    <motion.a
      href={href || undefined}
      onClick={handleClick}
      onMouseEnter={() => setHovered(Boolean(href))}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.5, delay }}
      className="portfolio-contact flex items-center gap-5 p-5 transition-all duration-200 relative overflow-hidden"
      style={{
        border: hovered ? "1px solid #00FF41" : "1px solid #003B18",
        background: hovered ? "rgba(0,255,65,0.04)" : "rgba(0,8,2,0.6)",
        boxShadow: hovered ? "0 0 20px rgba(0,255,65,0.1)" : "none",
        textDecoration: "none",
      }}
    >
      {hovered && !reduced && (
        <motion.div
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 0.5 }}
          className="matrix-only absolute top-0 bottom-0 w-16 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.06), transparent)" }}
        />
      )}

      <div style={{ color: hovered ? "#00FF41" : "#72A582", transition: "color 0.2s", flexShrink: 0 }}>
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1 break-words">
        {clicked ? (
          <motion.div role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00FF41", letterSpacing: "0.2em" }}
          >
            INICIANDO CONEXÃO...
            <br />
            <span style={{ color: "#00CC33" }}>CONEXÃO ESTABELECIDA.</span>
          </motion.div>
        ) : (
          <>
            <div className="portfolio-contact-label"
              style={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                color: hovered ? "#00FF41" : "#00CC33",
                letterSpacing: "0.2em",
                textShadow: hovered ? "0 0 8px #00FF41" : "none",
                transition: "all 0.2s",
              }}
            >
              {label}
            </div>
            <div className="portfolio-contact-detail" style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#72A582", letterSpacing: "0.1em", marginTop: 2 }}>
              {sublabel}
            </div>
          </>
        )}
      </div>

      <div
        className="matrix-only"
        style={{
          fontFamily: "monospace",
          fontSize: "0.6rem",
          color: hovered ? "#00FF41" : "#001A09",
          letterSpacing: "0.15em",
          transition: "color 0.2s",
        }}
      >
        {">>"}
      </div>
    </motion.a>
  );
}

export function ContactSection({ contacts, copy }: { contacts: Content["contacts"]; copy: Content["copy"] }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-10%" });

  return (
    <section className="portfolio-section relative py-24 md:py-32 px-6" style={{ zIndex: 1 }}>
      <div
        className="matrix-only absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,59,24,0.05) 0%, transparent 70%)" }}
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div ref={headerRef} className="portfolio-section-header mb-14 text-center">
          <motion.div
            className="matrix-only"
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.4em", marginBottom: 12 }}
          >
            05 / CONTATO
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              color: "#00FF41",
              fontWeight: 700,
              textShadow: "0 0 30px rgba(0,255,65,0.3)",
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            {copy.contactTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ color: "#81918A", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto" }}
          >
            {copy.contactDescription}
          </motion.p>
        </div>

        {/* Contact links — each handles its own whileInView */}
        <div className="portfolio-contact-list space-y-3 max-w-lg mx-auto">
          {contacts.map((social, i) => (
            <ContactLink key={social.id} {...social} icon={icons[social.icon]} delay={i * 0.1} />
          ))}
        </div>

        {/* Easter egg */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="portfolio-secret-hint" style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.3em" }}>
            <span className="matrix-only">{"// "}</span>Siga o coelho branco
          </div>
        </motion.div>
      </div>
    </section>
  );
}
