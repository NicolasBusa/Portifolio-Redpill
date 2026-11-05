import { createSilhouetteMask } from "./mask"
import type { FrameState } from "./ParticleRenderer"
import type { HologramConfig, ResolvedQuality } from "./types"

/** Low-cost, video-driven fallback for browsers without vertex-texture WebGL. */
export class CanvasRenderer {
  readonly kind = "Canvas" as const
  count = 0
  private ctx: CanvasRenderingContext2D
  private sample = document.createElement("canvas")
  private sampler: CanvasRenderingContext2D
  private mask: Uint8ClampedArray
  private width = 0
  private height = 0
  private lastTime = -1
  private pixels: Uint8ClampedArray | null = null
  private alive = true
  private matte: CanvasImageSource = createSilhouetteMask()
  private gridKey = ""

  constructor(
    private canvas: HTMLCanvasElement,
    config: HologramConfig,
  ) {
    this.ctx = canvas.getContext("2d")!
    this.sample.width = 240
    this.sample.height = 135
    this.sampler = this.sample.getContext("2d", { willReadFrequently: true })!
    this.sampler.drawImage(this.matte, 0, 0, 240, 135)
    this.mask = this.sampler.getImageData(0, 0, 240, 135).data
    if (config.maskSrc) {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => {
        if (!this.alive) return
        this.matte = image
        this.gridKey = ""
      }
      image.src = config.maskSrc
    }
  }

  resize(width: number, height: number, config: HologramConfig) {
    const dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr, 1.5)
    this.width = width
    this.height = height
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  render(
    video: HTMLVideoElement,
    config: HologramConfig,
    quality: ResolvedQuality,
    state: FrameState,
  ) {
    if (video.readyState < 2) return
    const mobile = this.width < 600 ? config.mobileDensity : 1
    const columns = Math.max(
      90,
      Math.min(
        320,
        Math.round(
          { high: 240, medium: 190, low: 140 }[quality] *
            Math.sqrt(config.particleDensity * mobile),
        ),
      ),
    )
    const rows = Math.round((columns * 9) / 16)
    if (this.gridKey !== `${columns}`) {
      this.gridKey = `${columns}`
      this.sample.width = columns
      this.sample.height = rows
      this.sampler.drawImage(this.matte, 0, 0, columns, rows)
      this.mask = this.sampler.getImageData(0, 0, columns, rows).data
      this.pixels = null
    }
    if (this.lastTime !== video.currentTime || !this.pixels) {
      this.sampler.clearRect(0, 0, columns, rows)
      this.sampler.drawImage(video, 0, 0, columns, rows)
      this.pixels = this.sampler.getImageData(0, 0, columns, rows).data
      this.lastTime = video.currentTime
    }
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    const width = Math.min(this.width, (this.height * 16) / 9)
    const height = (width * 9) / 16
    const left = (this.width - width) / 2
    const top = (this.height - height) / 2
    ctx.fillStyle = config.primaryColor
    const size = config.particleSize * Math.max(1, width / columns / 1.4)
    ctx.font = `${size * 3}px monospace`
    this.count = 0
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const i = (y * columns + x) * 4
        const brightness =
          (this.pixels[i] * 0.299 +
            this.pixels[i + 1] * 0.587 +
            this.pixels[i + 2] * 0.114) /
          255
        if (
          brightness < 0.025 ||
          (config.useVideoAlpha ? this.pixels[i + 3] : this.mask[i]) < 128
        )
          continue
        const seed = ((x * 127 + y * 319) % 1000) / 1000
        if (state.assemble < seed) continue
        let px = left + (x / columns) * width
        let py = top + (y / rows) * height
        const disperse = (1 - state.assemble) ** 2 + state.decode
        px += Math.sin(seed * 100 + state.time) * disperse * width * 0.2
        py += Math.cos(seed * 70 + state.time) * disperse * height * 0.4
        const dx = px - ((state.pointer[0] + 1) / 2) * this.width
        const dy = py - ((1 - state.pointer[1]) / 2) * this.height
        const distance = Math.hypot(dx, dy)
        const force =
          Math.max(0, 1 - distance / 90) ** 2 * config.interactionStrength * 20
        if (distance > 0 && !state.reducedMotion) {
          px += (dx / distance) * force
          py += (dy / distance) * force
        }
        ctx.globalAlpha = Math.min(
          1,
          Math.pow(brightness, 1.2) * (1.8 + config.glowIntensity * 0.4),
        )
        if (seed > 0.985) {
          ctx.fillText(
            "01<>/{}"[Math.floor(seed * 100 + state.time) % 7],
            px,
            py,
          )
        } else ctx.fillRect(px, py, size, size)
        this.count++
      }
    }
    ctx.globalAlpha = 1
  }

  dispose() {
    this.alive = false
    this.pixels = null
    this.sample.width = 0
  }
}
