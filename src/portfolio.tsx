"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { MatrixRain } from "./components/matrix-rain";
import { IntroSequence } from "./components/intro-sequence";
import { Nav } from "./components/nav";
import { HeroSection } from "./components/hero-section";
import { AboutSection } from "./components/about-section";
import { SkillsSection } from "./components/skills-section";
import { ProjectsSection } from "./components/projects-section";
import { ContactSection } from "./components/contact-section";
import { TerminalWidget } from "./components/terminal-widget";
import { Footer } from "./components/footer";
import type { Content } from "@/lib/content";
import "./simulated-world.css";

const worldKey = "portfolio_world";

function MatrixCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = cursor.current;
    const root = element?.closest(".portfolio");
    if (!element || !root) return;
    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const hide = () => root.removeAttribute("data-custom-cursor");
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse") return;
      element.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
      const target = event.target;
      element.toggleAttribute("data-pointer", target instanceof Element && Boolean(target.closest("a, button, [role=button]")));
      if (!root.hasAttribute("data-custom-cursor")) root.setAttribute("data-custom-cursor", "");
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    media.addEventListener("change", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
      media.removeEventListener("change", hide);
    };
  }, []);
  return <div className="matrix-cursor" aria-hidden="true" ref={cursor}><i /><b /></div>;
}

// Horizontal scanning line
function ScanLine() {
  return (
    <div
      aria-hidden="true"
      className="matrix-decorative-motion fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.03), transparent)",
          animation: "scanLine 8s linear infinite",
        }}
      />
    </div>
  );
}

export default function Portfolio({ content: data }: { content: Content }) {
  const [intro, setIntro] = useState(false);
  const [ready, setReady] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const content = useRef<HTMLElement>(null);
  const changeWorld = useCallback((next: boolean) => {
    setSimulated(next);
    try {
      if (next) sessionStorage.setItem(worldKey, "simulated");
      else sessionStorage.removeItem(worldKey);
    } catch {
      // Switching worlds still works when browser storage is restricted.
    }
  }, []);
  const handleIntroComplete = useCallback((focus = false) => {
    setIntro(false);
    setReady(true);
    if (focus) content.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const frame = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem(worldKey) === "simulated") {
          setSimulated(true);
          setReady(true);
          return;
        }
        if (!media.matches && !location.hash && document.activeElement === document.body && !sessionStorage.getItem("matrix_intro_done")) {
          sessionStorage.setItem("matrix_intro_done", "1");
          setIntro(true);
          return;
        }
      } catch {
        // Keep content available when browser storage is restricted.
      }
      setReady(true);
    });
    const onMotionChange = () => { if (media.matches) handleIntroComplete(); };
    media.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", onMotionChange);
    };
  }, [handleIntroComplete]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="portfolio min-h-screen overflow-x-clip bg-black" data-world={simulated ? "simulated" : "matrix"}>
        <a className="matrix-skip" href="#conteudo" onFocus={() => { if (intro) handleIntroComplete(); }}>Ir para o conteúdo</a>
        {!simulated && (ready || intro) && <>
          <MatrixCursor />
          <ScanLine />
          {intro ? <IntroSequence intro={data.intro} onComplete={handleIntroComplete} /> : null}
          <MatrixRain intensity={0.6} style={{ opacity: 0.12 }} />
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)", zIndex: 2 }}
          />
        </>}
        <Nav visible={ready} simulated={simulated} />
        <main id="conteudo" ref={content} tabIndex={-1} className="relative z-[3]">
          <div id="hero"><HeroSection profile={data.profile} copy={data.copy} hologram={data.hologram} visible={ready} simulated={simulated} onReturn={() => changeWorld(false)} /></div>
          <div id="about"><AboutSection profile={data.profile} copy={data.copy} simulated={simulated} /></div>
          <div id="projects"><ProjectsSection projects={data.projects} copy={data.copy} simulated={simulated} github={data.contacts.find((contact) => contact.icon === "github" && /^https?:/.test(contact.href))?.href} /></div>
          <div id="skills"><SkillsSection skills={data.skills} copy={data.copy} simulated={simulated} /></div>
          <div id="contact"><ContactSection contacts={data.contacts} copy={data.copy} /></div>
        </main>
        <Footer name={data.profile.name} note={data.copy.footer} />
        {ready ? <TerminalWidget profile={data.profile} projects={data.projects} simulated={simulated} onWorldChange={changeWorld} /> : null}
      </div>
    </MotionConfig>
  );
}
