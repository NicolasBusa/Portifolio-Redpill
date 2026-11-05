import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&<>{}[]|";

interface Drop {
  y: number;
  speed: number;
  length: number;
  chars: string[];
  opacity: number;
}

export function MatrixRain({
  intensity = 1,
  style,
}: {
  intensity?: number;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const FS = canvas.clientWidth < 640 ? 18 : 14;
    let drops: Drop[] = [];
    let animId = 0;
    let visible = false;
    let lastPaint = 0;

    const rchar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    const init = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const cols = Math.floor(canvas.width / FS);
      drops = Array.from({ length: cols }, () => ({
        y: Math.random() * -canvas.height,
        speed: (Math.random() * 1.4 + 0.4) * intensity,
        length: Math.floor(Math.random() * 22 + 6),
        chars: Array.from({ length: 30 }, rchar),
        opacity: Math.random() * 0.5 + 0.5,
      }));
    };

    const draw = (time: number) => {
      animId = requestAnimationFrame(draw);
      const elapsed = lastPaint ? time - lastPaint : 16.67;
      if (elapsed < 31 && lastPaint) return;
      lastPaint = time;
      const step = Math.min(elapsed / 16.67, 4);

      // Fade trail
      ctx.fillStyle = "rgba(0, 5, 2, 0.065)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.font = `${FS}px "Courier New", monospace`;

      drops.forEach((drop, i) => {
        const x = i * FS + FS / 2;

        for (let j = 0; j < drop.length; j++) {
          const y = drop.y - j * FS;
          if (y < 0 || y > canvas.height) continue;

          // Randomly mutate chars
          if (Math.random() < 0.04) drop.chars[j] = rchar();

          const ratio = 1 - j / drop.length;

          if (j === 0) {
            // Bright head
            ctx.fillStyle = `rgba(210, 255, 220, ${drop.opacity})`;
          } else if (j === 1) {
            ctx.fillStyle = `rgba(0, 255, 65, ${drop.opacity * 0.9})`;
          } else if (j < 4) {
            ctx.fillStyle = `rgba(0, 220, 55, ${ratio * drop.opacity * 0.75})`;
          } else {
            ctx.fillStyle = `rgba(0, 160, 35, ${ratio * drop.opacity * 0.45})`;
          }

          ctx.fillText(drop.chars[j], x, y);
        }

        drop.y += drop.speed * step;

        if (drop.y - drop.length * FS > canvas.height) {
          drop.y = Math.random() * -200 - 20;
          drop.speed = (Math.random() * 1.4 + 0.4) * intensity;
          drop.length = Math.floor(Math.random() * 22 + 6);
          drop.opacity = Math.random() * 0.5 + 0.5;
        }
      });

    };

    const sync = () => {
      if (document.hidden || !visible || media.matches) {
        cancelAnimationFrame(animId);
        animId = 0;
        if (media.matches) ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (!animId) {
        lastPaint = 0;
        animId = requestAnimationFrame(draw);
      }
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resize = new ResizeObserver(init);

    resize.observe(canvas);
    intersection.observe(canvas);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    init();

    return () => {
      resize.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      cancelAnimationFrame(animId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="matrix-decorative-motion fixed inset-0 h-full w-full pointer-events-none"
      style={{ zIndex: 0, ...style }}
    />
  );
}
