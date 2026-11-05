import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/lib/content";

function GithubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function ImageWithFallback({ src, alt, style }: { src: string; alt: string; style: React.CSSProperties }) {
  const [didError, setDidError] = useState(false);
  return didError ? (
    <div className="flex items-center justify-center bg-black w-full h-full">
      <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#72A582", letterSpacing: "0.2em" }}>
        Imagem indisponível
      </span>
    </div>
  ) : (
    <Image fill src={src} alt={alt} sizes="(max-width: 767px) 100vw, 550px" className="object-cover" style={style} onError={() => setDidError(true)} />
  );
}

export function ProjectCard({ project, index, simulated }: { project: Project; index: number; simulated: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [scanActive, setScanActive] = useState(false);
  const scanTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(scanTimer.current), []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || reduced || simulated) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / rect.height;
    const y = -(e.clientX - rect.left - rect.width / 2) / rect.width;
    setTilt({ x: x * 6, y: y * 6 });
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (reduced || simulated) return;
    setScanActive(true);
    clearTimeout(scanTimer.current);
    scanTimer.current = setTimeout(() => setScanActive(false), 1000);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const projectCode = `PROJECT_${String(index + 1).padStart(3, "0")}`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="portfolio-project-card relative overflow-hidden"
      style={{
        border: hovered ? "1px solid #00FF41" : "1px solid #003B18",
        background: "rgba(0, 8, 2, 0.9)",
        boxShadow: hovered
          ? "0 0 30px rgba(0,255,65,0.15), 0 0 60px rgba(0,255,65,0.05), inset 0 0 30px rgba(0,255,65,0.02)"
          : "0 0 10px rgba(0,0,0,0.5)",
        transform: reduced || simulated ? undefined : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? "translateY(-4px)" : "translateY(0)"}`,
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s ease-out",
      }}
    >
      {/* Scan line effect */}
      {scanActive && !simulated && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-8"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(0,255,65,0.06), transparent)" }}
          />
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <motion.div
          animate={hovered && !simulated ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {project.imageUrl ? <ImageWithFallback
            src={project.imageUrl}
            alt={project.imageAlt || project.name}
            style={{
              filter: simulated ? "none" : hovered
                ? "brightness(0.5) saturate(0.6) hue-rotate(100deg)"
                : "brightness(0.4) saturate(0.5) hue-rotate(100deg)",
              transition: "filter 0.3s ease",
            }}
          /> : <div className="grid h-full place-items-center text-xs text-[#72A582]">Sem imagem de capa</div>}
        </motion.div>
        <div
          className="matrix-only absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,8,2,0.3) 0%, rgba(0,8,2,0.9) 100%)" }}
        />
        <div
          className="matrix-only absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)",
          }}
        />
        <div className="matrix-only absolute top-3 left-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF41", boxShadow: "0 0 6px #00FF41" }} />
          <span style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#00FF41", letterSpacing: "0.2em" }}>
            {projectCode}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="portfolio-project-badge"
            style={{
              fontFamily: "monospace",
              fontSize: "0.55rem",
              color: "#00CC33",
              letterSpacing: "0.2em",
              border: "1px solid #003B18",
              padding: "2px 8px",
              background: "rgba(0,8,2,0.8)",
            }}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          style={{
            fontFamily: "monospace",
            fontSize: "1rem",
            color: hovered ? "#00FF41" : "#E8FFE8",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textShadow: hovered ? "0 0 10px #00FF41" : "none",
            marginBottom: 8,
            transition: "color 0.2s, text-shadow 0.2s",
          }}
        >
          {project.name}
        </h3>

        <p style={{ color: "#81918A", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: 12 }}>
          {project.description}
        </p>

        {project.longDescription && <button type="button" className="portfolio-details matrix-js-only mb-2 text-left text-xs text-[#72A582]" aria-expanded={expanded || hovered} onClick={() => setExpanded((value) => !value)}>
          {simulated ? (expanded ? "Recolher" : "Detalhes") : (expanded ? "[ RECOLHER ]" : "[ DETALHES ]")}
        </button>}
        <AnimatePresence>
          {project.longDescription && (hovered || expanded) && (
            <motion.p
              initial={simulated ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={simulated ? undefined : { opacity: 0, height: 0 }}
              transition={simulated ? { duration: 0 } : undefined}
              style={{
                color: "#72A582",
                fontSize: "0.78rem",
                lineHeight: 1.6,
                marginBottom: 12,
                overflow: "hidden",
                fontFamily: "monospace",
              }}
            >
              <span className="matrix-only">{"> "}</span>{project.longDescription}
            </motion.p>
          )}
        </AnimatePresence>

        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#72A582", letterSpacing: "0.25em", marginBottom: 8 }}>
          Tecnologias
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="portfolio-project-tag"
              style={{
                fontFamily: "monospace",
                fontSize: "0.62rem",
                color: "#00CC33",
                border: "1px solid #003B18",
                padding: "2px 8px",
                background: "rgba(0,59,24,0.1)",
                letterSpacing: "0.05em",
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4" style={{ borderTop: "1px solid #001A09" }}>
          {!project.liveUrl && !project.repoUrl ? <span className="text-xs text-[#72A582]">Links a cadastrar</span> : null}
          {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 transition-all duration-200"
            style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#72A582", textDecoration: "none", letterSpacing: "0.15em" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00FF41")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#72A582")}
          >
            <ExternalLink size={11} />
            <span>Ver demonstração</span>
          </a>) : null}
          {project.liveUrl && project.repoUrl ? <div className="w-px h-3" style={{ background: "#001A09" }} /> : null}
          {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 transition-all duration-200"
            style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#72A582", textDecoration: "none", letterSpacing: "0.15em" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00FF41")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#72A582")}
          >
            <GithubIcon size={11} />
            <span>Código-fonte</span>
          </a>) : null}
        </div>
      </div>
    </motion.div>
  );
}
