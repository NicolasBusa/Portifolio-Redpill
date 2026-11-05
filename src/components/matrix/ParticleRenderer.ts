import { createGlyphAtlas, createSilhouetteMask } from "./mask"
import { fragmentShader, vertexShader } from "./shaders"
import type { HologramConfig, ResolvedQuality } from "./types"

export interface FrameState {
  time: number
  assemble: number
  decode: number
  pointer: [number, number]
  reducedMotion: boolean
}

export class ParticleRenderer {
  readonly kind = "WebGL" as const
  count = 0
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private buffer: WebGLBuffer
  private textures: WebGLTexture[] = []
  private uniforms: Record<string, WebGLUniformLocation | null> = {}
  private scale: [number, number] = [1, 1]
  private gridKey = ""
  private lastVideoTime = -1
  private disposed = false
  private matte: HTMLCanvasElement
  private dpr = 1

  constructor(
    private canvas: HTMLCanvasElement,
    config: HologramConfig,
  ) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
      premultipliedAlpha: false,
    })
    if (!gl || gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 3)
      throw new Error("Vertex texture sampling unavailable")
    this.gl = gl
    const shaders: WebGLShader[] = []
    try {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, vertexShader],
        [gl.FRAGMENT_SHADER, fragmentShader],
      ] as const) {
        const shader = gl.createShader(type)!
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(
            gl.getShaderInfoLog(shader) || "Shader compilation failed",
          )
      }
      this.program = gl.createProgram()!
      shaders.forEach((s) => gl.attachShader(this.program, s))
      gl.linkProgram(this.program)
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        const message =
          gl.getProgramInfoLog(this.program) || "Shader link failed"
        gl.deleteProgram(this.program)
        throw new Error(message)
      }
    } finally {
      shaders.forEach((s) => gl.deleteShader(s))
    }
    gl.useProgram(this.program)
    this.buffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    for (const [name, offset] of [
      ["aUv", 0],
      ["aSeed", 8],
    ] as const) {
      const location = gl.getAttribLocation(this.program, name)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 16, offset)
    }
    for (const name of [
      "Video",
      "Mask",
      "Start",
      "Glyphs",
      "Scale",
      "Resolution",
      "Pointer",
      "Time",
      "Assemble",
      "Decode",
      "Size",
      "Dpr",
      "Strength",
      "LoopMix",
      "Alpha",
      "Color",
      "Glow",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(this.program, `u${name}`)
    }
    this.matte = createSilhouetteMask()
    const initial = document.createElement("canvas")
    initial.width = initial.height = 2
    for (const [i, source] of [
      initial,
      this.matte,
      initial,
      createGlyphAtlas(),
    ].entries()) {
      const texture = gl.createTexture()!
      this.textures.push(texture)
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      )
    }
    gl.uniform1i(this.uniforms.Video, 0)
    gl.uniform1i(this.uniforms.Mask, 1)
    gl.uniform1i(this.uniforms.Start, 2)
    gl.uniform1i(this.uniforms.Glyphs, 3)
    if (config.posterSrc) this.loadTexture(config.posterSrc, 2)
    if (config.maskSrc) this.loadTexture(config.maskSrc, 1)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.clearColor(0, 0, 0, 0)
  }

  private loadTexture(src: string, unit: number) {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      if (this.disposed) return
      const gl = this.gl
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, this.textures[unit])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    }
    image.src = src
  }

  resize(width: number, height: number, config: HologramConfig) {
    this.dpr = Math.min(
      window.devicePixelRatio || 1,
      config.maxDpr,
      width < 600 ? 1.5 : 2,
    )
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    const aspect = width / height
    this.scale = aspect > 16 / 9 ? [16 / 9 / aspect, 1] : [1, aspect / (16 / 9)]
  }

  render(
    video: HTMLVideoElement,
    config: HologramConfig,
    quality: ResolvedQuality,
    state: FrameState,
  ) {
    const gl = this.gl
    const mobile = this.canvas.clientWidth < 600
    const columns = Math.round(
      { high: 690, medium: 490, low: 310 }[quality] *
        Math.sqrt(config.particleDensity * (mobile ? config.mobileDensity : 1)),
    )
    if (`${columns}` !== this.gridKey) {
      this.gridKey = `${columns}`
      const rows = Math.round((columns * 9) / 16)
      const data = new Float32Array(columns * rows * 4)
      let random = 713
      const next = () => {
        random = (random * 16807) % 2147483647
        return random / 2147483647
      }
      for (let y = 0, i = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++, i += 4) {
          data[i] = (x + 0.5 + (next() - 0.5) * 0.55) / columns
          data[i + 1] = (y + 0.5 + (next() - 0.5) * 0.55) / rows
          data[i + 2] = next()
          data[i + 3] = next()
        }
      }
      this.count = columns * rows
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    }
    if (video.readyState >= 2 && this.lastVideoTime !== video.currentTime) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.textures[0])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      this.lastVideoTime = video.currentTime
    }
    const u = this.uniforms
    gl.uniform2f(u.Scale, ...this.scale)
    gl.uniform2f(u.Resolution, this.canvas.width, this.canvas.height)
    gl.uniform2f(u.Pointer, ...state.pointer)
    gl.uniform1f(u.Time, state.reducedMotion ? 0 : state.time)
    gl.uniform1f(u.Assemble, state.assemble)
    gl.uniform1f(u.Decode, state.decode)
    const projectedWidth = this.canvas.clientWidth * this.scale[0]
    gl.uniform1f(
      u.Size,
      config.particleSize * Math.max(1, projectedWidth / columns / 1.3),
    )
    gl.uniform1f(u.Dpr, this.dpr)
    gl.uniform1f(
      u.Strength,
      state.reducedMotion ? 0 : config.interactionStrength,
    )
    gl.uniform1f(
      u.LoopMix,
      config.posterSrc && video.duration > 1
        ? Math.max(0, 1 - (video.duration - video.currentTime) / 0.4)
        : 0,
    )
    gl.uniform1f(u.Alpha, config.useVideoAlpha ? 1 : 0)
    gl.uniform1f(u.Glow, config.glowIntensity)
    const hex = config.primaryColor.replace("#", "")
    gl.uniform3f(
      u.Color,
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    )
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, this.count)
  }

  dispose() {
    this.disposed = true
    this.textures.forEach((t) => this.gl.deleteTexture(t))
    this.gl.deleteBuffer(this.buffer)
    this.gl.deleteProgram(this.program)
  }
}
