import { useRef } from "react";
import { motion, useInView } from "motion/react";

import type { Content } from "@/lib/content";

function SkillModule({ name, delay }: { name: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      className="portfolio-skill group relative cursor-default"
      style={{
        border: "1px solid #003B18",
        padding: "8px 14px",
        background: "rgba(0,20,5,0.4)",
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget as HTMLDivElement;
        t.style.borderColor = "#00FF41";
        t.style.boxShadow = "0 0 12px rgba(0,255,65,0.2), inset 0 0 12px rgba(0,255,65,0.03)";
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget as HTMLDivElement;
        t.style.borderColor = "#003B18";
        t.style.boxShadow = "none";
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF41", boxShadow: "0 0 4px #00FF41" }} />
        <span className="portfolio-skill-name" style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00CC33", letterSpacing: "0.1em" }}>
          {name}
        </span>
      </div>
    </motion.div>
  );
}

export function SkillsSection({ skills, copy, simulated }: { skills: Content["skills"]; copy: Content["copy"]; simulated: boolean }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-10%" });
  const footerRef = useRef<HTMLDivElement>(null);
  const isFooterInView = useInView(footerRef, { once: true, margin: "-10%" });

  let globalIndex = 0;

  return (
    <section className="portfolio-section relative py-24 md:py-32 px-6" style={{ zIndex: 1 }}>
      {/* Background grid */}
      <div
        className="matrix-only absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,59,24,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,59,24,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }}
      />

      <div className="max-w-6xl mx-auto relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div ref={headerRef} className="portfolio-section-header mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isHeaderInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="matrix-only flex items-center gap-4 mb-2"
          >
            <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.4em" }}>
              04 / HABILIDADES
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
            {copy.skillsTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#72A582", letterSpacing: "0.2em", marginTop: 8 }}
          >
            <span className="matrix-only">{"> "}</span>{copy.skillsDescription}
          </motion.p>
        </div>

        {/* Categories — each module uses whileInView independently */}
        <div className="portfolio-skill-groups space-y-10">
          {skills.map((cat, ci) => (
            <motion.div
              key={cat.id}
              className="portfolio-skill-group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.5, delay: ci * 0.05 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="portfolio-skill-heading"
                  style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#00FF41", letterSpacing: "0.3em", textShadow: "0 0 6px #00FF41" }}
                >
                  <span className="matrix-only">[</span>{cat.name}<span className="matrix-only">]</span>
                </span>
                <div className="matrix-only flex-1 h-px" style={{ background: "linear-gradient(to right, #003B18, transparent)" }} />
                <span className="matrix-only" style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#72A582", letterSpacing: "0.2em" }}>
                  {cat.modules.length} {cat.modules.length === 1 ? "módulo carregado" : "módulos carregados"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {cat.modules.map((mod) => {
                  const idx = globalIndex++;
                  return <SkillModule key={idx} name={simulated ? mod : mod.toUpperCase()} delay={idx * 0.04} />;
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom status */}
        <div ref={footerRef} className="matrix-only mt-14 pt-8 flex items-center gap-4" style={{ borderTop: "1px solid #001A09" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isFooterInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#00FF41", boxShadow: "0 0 6px #00FF41", animation: "matrixBlink 2s ease-in-out infinite" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#72A582", letterSpacing: "0.2em" }}>
              Módulos operacionais
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
