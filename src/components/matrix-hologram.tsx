"use client";

import { useEffect, useRef, useState } from "react";
import type { HologramSettings } from "@/lib/hologram-settings";
import { CanvasRenderer } from "./matrix/CanvasRenderer";
import { ParticleRenderer } from "./matrix/ParticleRenderer";
import { defaultConfig, type ResolvedQuality } from "./matrix/types";
import "./matrix-hologram.css";

type Phase = "initializing" | "materializing" | "live" | "decoding" | "static" | "unavailable";
const outside: [number, number] = [10, 10];
const decodeDuration = 2.2;
const noop = () => {};

export function MatrixHologram({ settings }: { settings: HologramSettings }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const configRef = useRef(defaultConfig);
  const wakeRef = useRef(noop);
  const decodeRef = useRef(noop);
  const [phase, setPhase] = useState<Phase>("initializing");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    configRef.current = { ...defaultConfig, ...settings };
    wakeRef.current();
  }, [settings]);

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    const attachCanvas = () => {
      const canvas = document.createElement("canvas");
      canvas.className = "hologram-canvas";
      canvas.setAttribute("aria-hidden", "true");
      stage.prepend(canvas);
      return canvas;
    };
    let canvas = attachCanvas();
    let renderer: ParticleRenderer | CanvasRenderer;
    try {
      renderer = new ParticleRenderer(canvas, configRef.current);
    } catch {
      canvas.remove();
      canvas = attachCanvas();
      try {
        renderer = new CanvasRenderer(canvas, configRef.current);
      } catch {
        canvas.remove();
        const frame = requestAnimationFrame(() => setPhase("unavailable"));
        return () => cancelAnimationFrame(frame);
      }
    }
    stage.dataset.renderer = renderer.kind;

    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const viewportQuality = (): ResolvedQuality =>
      innerWidth < 640 ? "low" : innerWidth < 1100 ? "medium" : "high";
    let deviceQuality = viewportQuality();
    let adaptive = deviceQuality;
    let reduced = media.matches;
    let visible = false;
    let ready = false;
    let disposed = false;
    let contextLost = false;
    let raf = 0;
    let elapsed = 0;
    let decodeStart = -Infinity;
    let lastFrame = 0;
    let sampleTime = 0;
    let frames = 0;
    let slowSamples = 0;
    let lastPhase: Phase = "initializing";
    let pointer = outside;
    let target = outside;

    function updatePhase(next: Phase) {
      if (next === lastPhase) return;
      lastPhase = next;
      setPhase(next);
    }

    function active() {
      return !disposed && !contextLost && visible && !document.hidden && ready;
    }

    function stop() {
      video!.pause();
      cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
      sampleTime = 0;
      frames = 0;
    }

    function play() {
      if (!video!.paused) return;
      void video!.play().then(() => {
        if (!disposed) setNotice("");
      }).catch(() => {
        if (active() && !reduced && video!.paused) setNotice("Clique para ativar a animação.");
      });
    }

    function tick(now: number) {
      raf = 0;
      if (!active()) return;
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
      lastFrame = now;
      const config = configRef.current;
      if (!reduced) elapsed += delta * config.animationSpeed;
      const initialization = Math.min(0.8, config.materializationDuration * 0.27);
      const assemble = reduced ? 1 : elapsed < initialization
        ? (0.02 * elapsed) / initialization
        : Math.min(1, 0.02 + (0.98 * (elapsed - initialization)) / (config.materializationDuration - initialization));
      const age = elapsed - decodeStart;
      const decoding = !reduced && age < decodeDuration;
      const decode = decoding ? Math.sin(Math.PI * Math.max(0, age) / decodeDuration) ** 1.7 : 0;
      pointer = [
        pointer[0] + (target[0] - pointer[0]) * 0.1,
        pointer[1] + (target[1] - pointer[1]) * 0.1,
      ];
      const quality = config.quality === "auto" ? adaptive : config.quality;
      if (stage!.dataset.quality !== quality) stage!.dataset.quality = quality;
      renderer.render(video!, config, quality, {
        time: elapsed, assemble, decode, pointer, reducedMotion: reduced,
      });
      updatePhase(reduced ? "static" : decoding ? "decoding" : assemble < 1 ? "materializing" : "live");

      frames++;
      if (!sampleTime) sampleTime = now;
      if (now - sampleTime > 1000) {
        slowSamples = (frames * 1000) / (now - sampleTime) < 38 ? slowSamples + 1 : 0;
        if (slowSamples >= 3 && config.quality === "auto") {
          adaptive = adaptive === "high" ? "medium" : "low";
          slowSamples = 0;
        }
        sampleTime = now;
        frames = 0;
      }
      if (!reduced) raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (!active()) return;
      video!.playbackRate = configRef.current.animationSpeed;
      if (reduced) video!.pause();
      else play();
      if (!raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(tick);
      }
    }

    function resize() {
      const next = viewportQuality();
      if (next !== deviceQuality) {
        deviceQuality = next;
        adaptive = next;
        slowSamples = 0;
      }
      const { width, height } = stage!.getBoundingClientRect();
      if (width > 0 && height > 0) renderer.resize(width, height, configRef.current);
      wake();
    }

    wakeRef.current = wake;
    decodeRef.current = () => {
      if (!active() || reduced || elapsed - decodeStart < decodeDuration) return;
      elapsed = Math.max(elapsed, configRef.current.materializationDuration);
      decodeStart = elapsed;
      wake();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else stop();
    });
    intersection.observe(stage);
    const onVisibility = () => { if (document.hidden) stop(); else wake(); };
    const onMotion = () => { reduced = media.matches; wake(); };
    const onReady = () => { ready = true; wake(); };
    const onError = () => { stop(); ready = false; updatePhase("unavailable"); };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduced) return;
      const rect = stage.getBoundingClientRect();
      const next: [number, number] = [
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((event.clientY - rect.top) / rect.height) * 2,
      ];
      if (target === outside) pointer = next;
      target = next;
    };
    const onLeave = () => { target = outside; };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      onError();
    };

    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMotion);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("error", onError);
    stage.addEventListener("pointermove", onPointer, { passive: true });
    stage.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("webglcontextlost", onContextLost);
    if (video.readyState >= 2) onReady();
    else if (video.error) onError();
    resize();

    return () => {
      disposed = true;
      wakeRef.current = noop;
      decodeRef.current = noop;
      stop();
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("error", onError);
      stage.removeEventListener("pointermove", onPointer);
      stage.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  const unavailable = phase === "unavailable";
  const canDecode = phase === "materializing" || phase === "live" || phase === "decoding";
  return (
    <div className="matrix-hologram" data-phase={phase}>
      <div className="hologram-stage" ref={stageRef} role="img" aria-label="Holograma em partículas de Nicolas digitando">
        <video
          ref={videoRef}
          src={defaultConfig.videoSrc}
          muted loop playsInline preload="auto"
          className="hologram-video"
          aria-hidden="true"
        />
        {phase === "initializing" && <span className="hologram-message">Inicializando holograma…</span>}
        {unavailable && <span className="hologram-message">Holograma indisponível neste navegador.</span>}
      </div>
      <div className="hologram-controls">
        <button type="button" className="hologram-decode" disabled={!canDecode} aria-disabled={phase === "decoding" || undefined} onClick={() => decodeRef.current()}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
            <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span>Click to decode</span>
          <i aria-hidden="true" />
        </button>
        <span className={notice || phase === "static" ? "hologram-status" : "sr-only"} role="status">
          {notice || (phase === "static" ? "Movimento reduzido" : phase === "decoding" ? "Reconstruindo holograma…" : "")}
        </span>
      </div>
    </div>
  );
}
