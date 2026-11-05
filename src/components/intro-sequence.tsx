import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MatrixRain } from "./matrix-rain";

import type { Content } from "@/lib/content";

const lineDelays = [300, 1600, 3000, 4200, 5500];
const lineColors = ["#00FF41", "#00FF41", "#00CC33", "#00CC33", "#E8FFE8"];

function TypingLine({
  text,
  startDelay,
  color,
}: {
  text: string;
  startDelay: number;
  color: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 28);
    return () => clearTimeout(t);
  }, [started, displayed, text]);

  if (!started && displayed.length === 0) return null;

  return (
    <div className="flex items-center gap-2 break-words" style={{ fontFamily: "monospace" }}>
      <span style={{ color: "#72A582" }}>{">"}</span>
      <span style={{ color }} className="min-w-0">{displayed}</span>
      {displayed.length < text.length && started && (
        <span
          className="inline-block w-2 h-4 ml-0.5"
          style={{ background: color, animation: "matrixBlink 0.7s step-end infinite" }}
        />
      )}
    </div>
  );
}

type Phase = "boot" | "rain" | "dissolve";

export function IntroSequence({ onComplete, intro }: { onComplete: (focus?: boolean) => void; intro: Content["intro"] }) {
  const rainStart = Math.max(...intro.lines.map((line, index) => lineDelays[index] + line.length * 28)) + 800;
  const dissolveStart = rainStart + 2300;
  const [phase, setPhase] = useState<Phase>("boot");

  useEffect(() => {
    const rain = setTimeout(() => setPhase("rain"), rainStart);
    const dissolve = setTimeout(() => setPhase("dissolve"), dissolveStart);
    const finish = setTimeout(() => onComplete(document.activeElement?.id === "skip-intro"), dissolveStart + 750);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onComplete(true);
    };
    document.addEventListener("keydown", escape);
    return () => {
      clearTimeout(rain);
      clearTimeout(dissolve);
      clearTimeout(finish);
      document.removeEventListener("keydown", escape);
    };
  }, [onComplete, rainStart, dissolveStart]);

  return (
    <motion.div
      aria-label="Inicialização Matrix"
      className="fixed inset-0 flex flex-col"
      animate={{ opacity: phase === "dissolve" ? 0 : 1 }}
      transition={{ duration: 0.75 }}
      style={{
        background: "#000000",
        zIndex: 200,
        animation: "introFailsafe " + (dissolveStart + 1800) + "ms forwards",
      }}
    >
      {/* Rain behind boot text */}
      {phase === "rain" || phase === "dissolve" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <MatrixRain intensity={1.5} style={{ zIndex: 1 }} />
        </motion.div>
      ) : null}

      {/* Boot terminal */}
      {phase === "boot" && (
        <div
          aria-hidden="true"
          className="relative flex flex-col justify-center flex-1 px-8 md:px-16"
          style={{ zIndex: 10 }}
        >
          {/* Top bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center gap-2 px-6 py-3 border-b"
            style={{ borderColor: "#003B18" }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "#00FF41" }} />
            <span
              style={{
                color: "#00FF41",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              {intro.caption}
            </span>
          </div>

          <div className="space-y-3 max-w-2xl">
            {intro.lines.map((line, index) => (
              <TypingLine
                key={index}
                text={line}
                startDelay={lineDelays[index]}
                color={lineColors[index]}
              />
            ))}
          </div>

          {/* Blinking cursor at end */}
          <div
            className="mt-6 flex items-center gap-2"
            style={{ fontFamily: "monospace", color: "#00FF41" }}
          >
            <span style={{ color: "#72A582" }}>{">"}</span>
            <span
              className="inline-block w-2.5 h-5"
              style={{ background: "#00FF41", animation: "matrixBlink 0.7s step-end infinite" }}
            />
          </div>
        </div>
      )}

      {/* Rain phase overlay */}
      {(phase === "rain" || phase === "dissolve") && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 10 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div
              style={{
                fontFamily: "monospace",
                color: "#00FF41",
                fontSize: "clamp(1.2rem, 4vw, 2rem)",
                letterSpacing: "0.5em",
                textShadow: "0 0 20px #00FF41, 0 0 40px #00FF41",
                animation: "matrixGlitch 0.3s infinite",
              }}
            >
              {intro.welcome}
            </div>
            <div
              style={{
                fontFamily: "monospace",
                color: "#00CC33",
                fontSize: "clamp(0.6rem, 2vw, 0.85rem)",
                letterSpacing: "0.4em",
                marginTop: "0.5rem",
                opacity: 0.7,
              }}
            >
              {intro.subtitle}
            </div>
          </motion.div>
        </div>
      )}

      {/* Skip button */}
      <button
        id="skip-intro"
        type="button"
        onClick={() => onComplete(true)}
        className="absolute bottom-6 right-6 transition-all duration-200"
        style={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: "#72A582",
          letterSpacing: "0.2em",
          border: "1px solid #003B18",
          padding: "6px 14px",
          background: "transparent",
          cursor: "pointer",
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.color = "#00FF41";
          (e.target as HTMLButtonElement).style.borderColor = "#00FF41";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.color = "#72A582";
          (e.target as HTMLButtonElement).style.borderColor = "#003B18";
        }}
      >
        PULAR ABERTURA
      </button>
    </motion.div>
  );
}
