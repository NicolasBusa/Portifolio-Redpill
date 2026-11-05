export const hologramQualities = ["auto", "high", "medium", "low"] as const;
export type Quality = (typeof hologramQualities)[number];

export const signalControls = {
  particleDensity: { label: "Densidade das partículas", min: 0.4, max: 1.5, step: 0.05 },
  particleSize: { label: "Tamanho das partículas", min: 0.7, max: 2.4, step: 0.05 },
  glowIntensity: { label: "Luminosidade", min: 0.3, max: 2, step: 0.05 },
  animationSpeed: { label: "Velocidade do movimento", min: 0.3, max: 1.6, step: 0.05 },
  interactionStrength: { label: "Influência do cursor", min: 0, max: 1.5, step: 0.05 },
} as const;

export type SignalKey = keyof typeof signalControls;
export type HologramSettings = Record<SignalKey, number> & { quality: Quality };

export const defaultHologramSettings: HologramSettings = {
  quality: "auto",
  particleDensity: 1,
  particleSize: 1.7,
  glowIntensity: 1,
  animationSpeed: 1,
  interactionStrength: 0.65,
};
