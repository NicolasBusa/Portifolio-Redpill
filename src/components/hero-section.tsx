import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MatrixRain } from "./matrix-rain";
import { MatrixHologram } from "./matrix-hologram";
import type { Content } from "@/lib/content";

function useTypingEffect(lines: string[], enabled: boolean, speed = 35, startDelay = 0) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [enabled, startDelay]);

  useEffect(() => {
    if (!enabled || !started) return;
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];
    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar + 1);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [enabled, started, currentLine, currentChar, lines, speed]);

  return { displayedLines, isTyping: currentLine < lines.length };
}

function GlitchTitle({ text, visible, animateGlitch }: { text: string; visible: boolean; animateGlitch: boolean }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!visible || !animateGlitch) return;
    const t1 = setTimeout(() => setGlitching(true), 200);
    const t2 = setTimeout(() => setGlitching(false), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible, animateGlitch]);

  return (
    <div className="relative inline-block max-w-full break-words">
      <motion.h1
        id="hero-title"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
        style={{
          fontFamily: "monospace",
          fontSize: "var(--hero-title-size)",
          fontWeight: 700,
          color: "#E8FFE8",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textShadow: glitching
            ? "3px 0 #00FF41, -3px 0 #00CC33, 0 0 20px #00FF41"
            : "0 0 30px rgba(0,255,65,0.3)",
          position: "relative",
        }}
      >
        {text}
      </motion.h1>
      {/* Glitch layers */}
      {glitching && (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              fontFamily: "monospace",
              fontSize: "var(--hero-title-size)",
              fontWeight: 700,
              color: "#00FF41",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              opacity: 0.5,
              clipPath: "inset(10% 0 70% 0)",
              transform: "translateX(-4px)",
              pointerEvents: "none",
            }}
          >
            {text}
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              fontFamily: "monospace",
              fontSize: "var(--hero-title-size)",
              fontWeight: 700,
              color: "#00CC33",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              opacity: 0.4,
              clipPath: "inset(60% 0 10% 0)",
              transform: "translateX(4px)",
              pointerEvents: "none",
            }}
          >
            {text}
          </div>
        </>
      )}
    </div>
  );
}

export function HeroSection({ visible = true, profile, copy, hologram, simulated, onReturn }: {
  visible?: boolean; profile: Content["profile"]; copy: Content["copy"]; hologram: Content["hologram"];
  simulated: boolean; onReturn: () => void;
}) {
  const typingLines = useMemo(() => profile.heroLines.map((line) => "> " + line), [profile.heroLines]);
  const reduced = Boolean(useReducedMotion() && visible);
  const { displayedLines, isTyping } = useTypingEffect(typingLines, visible && !reduced && !simulated, 32, 400);
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (simulated || reduced || !visible || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.bottom <= 0) return;
      setParallax({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 10,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reduced, visible, simulated]);

  return (
    <section
      ref={containerRef}
      className="matrix-hero relative min-h-svh flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {!simulated && visible && <>
        {/* Matrix rain background */}
        <div
          className="absolute inset-0"
          style={{ opacity: 0.18, zIndex: 0, pointerEvents: "none" }}
        >
          <MatrixRain intensity={0.9} style={{ position: "absolute" }} />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
            zIndex: 1,
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #000000)", zIndex: 1 }}
        />
      </>}

      <div className="matrix-hero-grid">
        <motion.div
          style={{
            transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`,
            transition: "transform 0.1s ease-out",
            zIndex: 2,
            position: "relative",
          }}
          className="matrix-hero-copy"
        >
          {/* System label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hero-eyebrow mb-6"
            style={{
              fontFamily: "monospace",
              fontSize: "0.72rem",
              color: "#00FF41",
              letterSpacing: "0.3em",
              textShadow: "0 0 10px #00FF41",
            }}
          >
            {simulated ? "Portfólio pessoal" : "> SYSTEM.USER_PROFILE"}
          </motion.div>

          {/* Name with glitch */}
          <div className="mb-6">
            <GlitchTitle text={profile.name} visible={visible} animateGlitch={!reduced && !simulated} />
          </div>

          {/* Typing lines */}
          <noscript><p className="text-[#81918A]">{typingLines.join(" ")}</p></noscript>
          {simulated ? <div className="simulated-hero-intro">
            {profile.heroLines.map((line, i) => <p key={i}>{line}</p>)}
          </div> : <>
            <p className="sr-only">{typingLines.join(" ")}</p>
            <div className="matrix-hero-typing mb-10 min-h-[5rem] max-w-full break-words text-left inline-block" aria-hidden="true">
              {(reduced ? typingLines : displayedLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-0"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
                    color: i === 0 ? "#00FF41" : i === 1 ? "#00CC33" : "#81918A",
                    letterSpacing: "0.03em",
                    lineHeight: 1.8,
                    textShadow: i < 2 ? "0 0 8px currentColor" : "none",
                  }}
                >
                  {line}
                  {i === displayedLines.length - 1 && isTyping && !reduced && (
                    <span
                      className="inline-block w-2 h-4 ml-1"
                      style={{ background: "#00FF41", animation: "matrixBlink 0.7s step-end infinite" }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </>}

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="matrix-hero-actions flex flex-wrap gap-4"
          >
            <MatrixButton href="#projects" primary>
              {simulated ? copy.projectsButton : `[ ${copy.projectsButton} ]`}
            </MatrixButton>
            <MatrixButton href="#contact">
              {simulated ? copy.contactButton : `[ ${copy.contactButton} ]`}
            </MatrixButton>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="matrix-hero-stats flex flex-wrap gap-8"
          >
            {[
              [profile.year, "Ano acadêmico"],
              [profile.semester, "Semestre"],
              [profile.institution, "Instituição"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.5rem",
                    color: "#00FF41",
                    fontWeight: 700,
                    textShadow: "0 0 10px #00FF41",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    color: "#72A582",
                    letterSpacing: "0.2em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <div className="matrix-hero-hologram">
          {simulated ? (
            <figure className="simulated-media">
              <video
                src="/media/mundo-simulado.mp4"
                poster="/media/mundo-simulado-poster.jpg"
                aria-label="Nicolas Busa digitando"
                muted
                playsInline
                autoPlay={!reduced}
                loop
                controls
                preload="metadata"
              />
              <figcaption>
                <button type="button" className="simulated-return" onClick={() => {
                  document.getElementById("hero-title")?.focus({ preventScroll: true });
                  onReturn();
                }}>Voltar para a Matrix</button>
              </figcaption>
            </figure>
          ) : visible && <MatrixHologram settings={hologram} />}
        </div>
      </div>

      {!simulated && <>
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 2 }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.55rem",
              color: "#72A582",
              letterSpacing: "0.3em",
            }}
          >
            ROLE PARA EXPLORAR
          </div>
          <div className="w-px h-10 relative overflow-hidden" style={{ background: "#003B18" }}>
            <motion.div
              className="absolute w-full"
              style={{ height: "50%", background: "#00FF41" }}
              animate={reduced ? { y: "50%" } : { y: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Corner decorations */}
        <CornerDecorations />
      </>}
    </section>
  );
}

function MatrixButton({
  children,
  href,
  primary = false,
}: {
  children: React.ReactNode;
  href: string;
  primary?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      className={primary ? "hero-button hero-button-primary" : "hero-button"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "monospace",
        fontSize: "0.78rem",
        letterSpacing: "0.1em",
        color: hovered ? "#000000" : primary ? "#00FF41" : "#00CC33",
        background: hovered
          ? primary
            ? "#00FF41"
            : "#00CC33"
          : "transparent",
        border: `1px solid ${primary ? "#00FF41" : "#00CC33"}`,
        padding: "12px 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: hovered
          ? `0 0 20px ${primary ? "#00FF41" : "#00CC33"}, 0 0 40px ${primary ? "rgba(0,255,65,0.3)" : "rgba(0,204,51,0.2)"}`
          : `0 0 8px ${primary ? "rgba(0,255,65,0.2)" : "rgba(0,204,51,0.1)"}`,
      }}
    >
      {children}
    </a>
  );
}

function CornerDecorations() {
  return (
    <>
      {/* Top left */}
      <div className="absolute top-20 left-6 pointer-events-none" style={{ zIndex: 2 }}>
        <div style={{ width: 20, height: 20, borderTop: "1px solid #003B18", borderLeft: "1px solid #003B18" }} />
      </div>
      {/* Top right */}
      <div className="absolute top-20 right-6 pointer-events-none" style={{ zIndex: 2 }}>
        <div style={{ width: 20, height: 20, borderTop: "1px solid #003B18", borderRight: "1px solid #003B18" }} />
      </div>
      {/* Bottom left */}
      <div className="absolute bottom-20 left-6 pointer-events-none" style={{ zIndex: 2 }}>
        <div style={{ width: 20, height: 20, borderBottom: "1px solid #003B18", borderLeft: "1px solid #003B18" }} />
      </div>
      {/* Bottom right */}
      <div className="absolute bottom-20 right-6 pointer-events-none" style={{ zIndex: 2 }}>
        <div style={{ width: 20, height: 20, borderBottom: "1px solid #003B18", borderRight: "1px solid #003B18" }} />
      </div>
    </>
  );
}
