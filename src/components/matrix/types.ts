import { defaultHologramSettings, type HologramSettings, type Quality } from "@/lib/hologram-settings";

export type ResolvedQuality = Exclude<Quality, "auto">;

export interface HologramConfig extends HologramSettings {
  videoSrc: string;
  posterSrc?: string;
  /** Optional white-on-black matte. The bundled matte matches the typing video. */
  maskSrc?: string;
  useVideoAlpha?: boolean;
  primaryColor: string;
  materializationDuration: number;
  maxDpr: number;
  mobileDensity: number;
}

export const defaultConfig: HologramConfig = {
  ...defaultHologramSettings,
  videoSrc: "/media/typing.mp4",
  posterSrc: "/media/typing-poster.jpg",
  primaryColor: "#00ff41",
  materializationDuration: 3,
  maxDpr: 1.75,
  mobileDensity: 0.48,
};
