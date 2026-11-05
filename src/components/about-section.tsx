import { useRef } from "react";
import { motion, useInView } from "motion/react";

import type { Content } from "@/lib/content";

function TerminalPanel({ profile, simulated }: { profile: Content["profile"]; simulated: boolean }) {
  const rows = [
    { key: "STATUS", label: "Status", value: "Disponível", color: "#00FF41" },
    { key: "ROLE", label: "Ocupação", value: profile.role },
    { key: "EDUCATION", label: "Formação", value: profile.education },
    { key: "ACADEMIC", label: "Instituição", value: profile.institution + " · Semestre " + profile.semester },
    { key: "ORIGIN", label: "Localização", value: profile.location },
    { key: "UPTIME", label: "Disponibilidade", value: "24/7" },
  ];
  const facts = [
    { num: profile.year, label: "Ano acadêmico" },
    { num: profile.semester, label: "Semestre" },
    { num: profile.institution, label: "Instituição" },
    { num: "∞", label: "Curiosidade" },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <div
      ref={ref}
      className="portfolio-profile-card rounded-sm overflow-hidden"
      style={{
        border: "1px solid #003B18",
        background: "rgba(0, 8, 2, 0.8)",
        boxShadow: "0 0 30px rgba(0,255,65,0.05), inset 0 0 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Terminal header */}
      <div
        className="portfolio-profile-header flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid #003B18", background: "rgba(0,20,5,0.5)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#00FF41", boxShadow: "0 0 6px #00FF41", animation: "matrixBlink 2s ease-in-out infinite" }}
          />
          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#72A582", letterSpacing: "0.2em" }}>
            {simulated ? "Perfil" : "USER_PROFILE.exe"}
          </span>
        </div>
        <span className="matrix-only" style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582" }}>v1.0.0</span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2.5">
        {rows.map((row, i) => (
          <motion.div
            key={row.key}
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.08 }}
            className="portfolio-profile-row flex items-center gap-3"
          >
            <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#72A582", letterSpacing: "0.15em", minWidth: 80 }}>
              {simulated ? row.label : row.key}
            </span>
            <span className="matrix-only" style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#72A582" }}>:</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                color: row.color || "#00CC33",
                letterSpacing: "0.1em",
                textShadow: row.color ? `0 0 8px ${row.color}` : "none",
              }}
            >
              {row.value}
            </span>
          </motion.div>
        ))}

        <div className="my-4" style={{ borderTop: "1px solid #001A09" }} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {facts.map((fact, i) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              className="portfolio-profile-stat min-w-0 break-words p-3 rounded-sm"
              style={{ border: "1px solid #001A09", background: "rgba(0,255,65,0.02)" }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.4rem",
                  color: "#00FF41",
                  fontWeight: 700,
                  textShadow: "0 0 10px #00FF41",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {fact.num}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#72A582", letterSpacing: "0.15em" }}>
                {fact.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
          className="matrix-only mt-4 space-y-1.5"
        >
          <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.2em" }}>
            SYSTEM_LOAD
          </div>
          <div className="h-1 rounded-full" style={{ background: "#001A09" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "72%" } : {}}
              transition={{ duration: 1.4, delay: 1.0, ease: "easeOut" }}
              style={{ background: "linear-gradient(to right, #003B18, #00FF41)", boxShadow: "0 0 6px #00FF41" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function AboutSection({ profile, copy, simulated }: { profile: Content["profile"]; copy: Content["copy"]; simulated: boolean }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-10%" });

  return (
    <section
      className="portfolio-section relative py-24 md:py-32 px-6"
      style={{ zIndex: 1, background: "rgba(0,5,2,0.6)" }}
    >
      {/* Section label */}
      <div ref={headerRef} className="portfolio-section-header max-w-6xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isHeaderInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="matrix-only flex items-center gap-4 mb-2"
        >
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.4em" }}>
            02 / SOBRE
          </span>
          <div className="flex-1 max-w-32 h-px" style={{ background: "#003B18" }} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "monospace",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            color: "#00FF41",
            fontWeight: 700,
            textShadow: "0 0 20px rgba(0,255,65,0.3)",
            letterSpacing: "-0.02em",
          }}
        >
          {copy.aboutTitle}
        </motion.h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Text */}
        <div className="space-y-6">
          <div
            className="matrix-only"
            style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#72A582", letterSpacing: "0.3em", marginBottom: 16 }}
          >
            {"> Carregando biografia…"}
          </div>
          {profile.bio.map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="mb-4 leading-relaxed"
              style={{ color: "#81918A", fontSize: "0.92rem" }}
            >
              {text}
            </motion.p>
          ))}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a
              href="#contact"
              className="portfolio-action inline-flex items-center gap-3 transition-all duration-200"
              style={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                color: "#00CC33",
                letterSpacing: "0.15em",
                border: "1px solid #003B18",
                padding: "10px 20px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                t.style.color = "#000000";
                t.style.background = "#00CC33";
                t.style.boxShadow = "0 0 20px rgba(0,204,51,0.4)";
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                t.style.color = "#00CC33";
                t.style.background = "transparent";
                t.style.boxShadow = "none";
              }}
            >
              <span className="matrix-only">{">"}</span>
              <span>{copy.aboutButton}</span>
              <span className="matrix-only" style={{ animation: "matrixBlink 1s step-end infinite" }}>_</span>
            </a>
          </motion.div>
        </div>

        {/* Right: Terminal panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <TerminalPanel profile={profile} simulated={simulated} />
        </motion.div>
      </div>
    </section>
  );
}
