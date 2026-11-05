import { useRef } from "react";
import { motion, useInView } from "motion/react";
import type { Content } from "@/lib/content";
import { ProjectCard } from "./project-card";

export function ProjectsSection({ projects, copy, github, simulated }: { projects: Content["projects"]; copy: Content["copy"]; github?: string; simulated: boolean }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-10%" });
  const ctaRef = useRef<HTMLDivElement>(null);
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-10%" });

  return (
    <section
      className="portfolio-section relative py-24 md:py-32 px-6"
      style={{ zIndex: 1, background: "rgba(0,5,2,0.4)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="portfolio-section-header mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isHeaderInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="matrix-only flex items-center gap-4 mb-2"
          >
            <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.4em" }}>
              03 / PROJETOS
            </span>
            <div className="flex-1 max-w-32 h-px" style={{ background: "#003B18" }} />
          </motion.div>
          <motion.h2 className="matrix-section-title"
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
              marginBottom: 8,
            }}
          >
            {copy.projectsTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isHeaderInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#72A582", letterSpacing: "0.15em" }}
          >
            <span className="matrix-only">{"> "}</span>{copy.projectsDescription}{" "}
            <span className="matrix-only" style={{ color: "#00FF41" }}>{projects.length} {projects.length === 1 ? "registro encontrado" : "registros encontrados"}</span>
          </motion.p>
        </div>

        {/* Projects grid — each card handles its own whileInView */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} simulated={simulated} />
          ))}
        </div>

        {projects.length === 0 && <p className="mt-6 text-[#81918A]">Nenhum projeto publicado ainda.</p>}

        {/* Footer CTA */}
        <div ref={ctaRef} className="mt-14 flex flex-col items-center gap-4">
          <motion.div
            className="matrix-only"
            initial={{ opacity: 0 }}
            animate={isCtaInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#72A582", letterSpacing: "0.3em" }}
          >
            {"Fim do arquivo"}
          </motion.div>
          {github && <motion.a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="portfolio-action inline-flex items-center gap-3 transition-all duration-200"
            style={{
              fontFamily: "monospace",
              fontSize: "0.72rem",
              color: "#72A582",
              border: "1px solid #003B18",
              padding: "10px 24px",
              textDecoration: "none",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.color = "#00FF41";
              t.style.borderColor = "#00FF41";
              t.style.boxShadow = "0 0 15px rgba(0,255,65,0.2)";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.color = "#72A582";
              t.style.borderColor = "#003B18";
              t.style.boxShadow = "none";
            }}
          >
            <span className="matrix-only">{">"}</span> Ver perfil no GitHub
          </motion.a>}
        </div>
      </div>
    </section>
  );
}
