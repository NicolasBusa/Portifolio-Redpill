import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { id: "01", label: "Início", href: "hero" },
  { id: "02", label: "Sobre", href: "about" },
  { id: "03", label: "Projetos", href: "projects" },
  { id: "04", label: "Habilidades", href: "skills" },
  { id: "05", label: "Contato", href: "contact" },
];

function NavLink({
  id,
  label,
  href,
  active,
  onClick,
}: {
  id: string;
  label: string;
  href: string;
  active: boolean;
  onClick: (href: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`#${href}`}
      aria-current={active ? "location" : undefined}
      onClick={() => onClick(href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="portfolio-nav-link relative flex items-center gap-1.5 group transition-all duration-200"
      style={{
        fontFamily: "monospace",
        fontSize: "0.68rem",
        letterSpacing: "0.15em",
        color: active ? "#00FF41" : hovered ? "#00FF41" : "#81918A",
        textShadow: (active || hovered) ? "0 0 10px #00FF41" : "none",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
      }}
    >
      <span className="matrix-only" style={{ color: "#72A582", fontSize: "0.6rem" }}>{id}</span>
      <span className="matrix-only">/</span>
      <span>{label}</span>
      {/* Blinking cursor on hover/active */}
      <AnimatePresence>
        {(hovered || active) && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="matrix-only inline-block overflow-hidden"
            style={{
              width: 6,
              height: 12,
              background: "#00FF41",
              animation: "matrixBlink 0.7s step-end infinite",
              marginLeft: 2,
            }}
          />
        )}
      </AnimatePresence>
      {/* Bottom line */}
      <motion.div
        className="matrix-only absolute -bottom-1 left-0 h-px"
        initial={{ width: 0 }}
        animate={{ width: (hovered || active) ? "100%" : 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: "#00FF41", boxShadow: "0 0 6px #00FF41" }}
      />
    </a>
  );
}

export function Nav({ visible = true, simulated }: { visible?: boolean; simulated: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      // Determine active section
      const sections = ["hero", "about", "projects", "skills", "contact"];
      let current = "hero";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4) current = id;
        }
      }
      if (document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 2) current = "contact";
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <motion.nav
      aria-label="Navegação principal"
      onKeyDown={(event) => { if (event.key === "Escape") closeMenu(); }}
      initial={{ opacity: 0, y: -30 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="portfolio-nav fixed top-0 left-0 right-0 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-500"
      style={{
        zIndex: 100,
        background: scrolled
          ? "rgba(0, 5, 2, 0.92)"
          : "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid #003B18" : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <a
        href="#hero"
        onClick={closeMenu}
        className="portfolio-brand flex items-center gap-2"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: "#00FF41",
            letterSpacing: "0.1em",
            textShadow: "0 0 10px #00FF41",
          }}
        >
          NB
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: "#72A582",
          }}
        >
          .exe
        </span>
      </a>

      {/* Desktop links */}
      <div className="portfolio-nav-links hidden md:flex items-center gap-7">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            {...link}
            label={simulated ? link.label : link.label.toUpperCase()}
            active={activeSection === link.href}
            onClick={closeMenu}
          />
        ))}
      </div>

      {/* Terminal button */}
      <div className="hidden md:flex items-center gap-4">
        <button
          type="button"
          aria-label="Abrir terminal"
          onClick={() => {
            const event = new CustomEvent("toggle-terminal");
            window.dispatchEvent(event);
          }}
          className="portfolio-nav-terminal matrix-js-only transition-all duration-200"
          style={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            color: "#72A582",
            border: "1px solid #003B18",
            padding: "5px 12px",
            background: "transparent",
            cursor: "pointer",
            letterSpacing: "0.15em",
          }}
          onMouseEnter={(e) => {
            const t = e.currentTarget;
            t.style.color = "#00FF41";
            t.style.borderColor = "#00FF41";
            t.style.boxShadow = "0 0 10px rgba(0,255,65,0.3)";
          }}
          onMouseLeave={(e) => {
            const t = e.currentTarget;
            t.style.color = "#72A582";
            t.style.borderColor = "#003B18";
            t.style.boxShadow = "none";
          }}
        >
          <span className="matrix-only">{"> _"}</span><span className="simulated-only">Terminal</span>
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Menu de navegação"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="matrix-js-only md:hidden flex flex-col gap-1.5 p-2"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={
              mobileOpen
                ? i === 0
                  ? { rotate: 45, y: 8 }
                  : i === 1
                  ? { opacity: 0 }
                  : { rotate: -45, y: -8 }
                : { rotate: 0, y: 0, opacity: 1 }
            }
            className="w-5 h-px"
            style={{ background: "#00FF41" }}
          />
        ))}
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={simulated ? { duration: 0 } : undefined}
            className="portfolio-mobile-menu absolute top-full left-0 right-0 py-6 px-6 flex flex-col gap-4"
            style={{
              background: "rgba(0, 5, 2, 0.98)",
              borderBottom: "1px solid #003B18",
              backdropFilter: "blur(16px)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={closeMenu}
                aria-current={activeSection === link.href ? "location" : undefined}
                className="portfolio-nav-link text-left transition-colors duration-200"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  color: activeSection === link.href ? "#00FF41" : "#81918A",
                  letterSpacing: "0.15em",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span className="matrix-only" style={{ color: "#72A582" }}>{link.id}/</span> {simulated ? link.label : link.label.toUpperCase()}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
