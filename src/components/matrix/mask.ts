/**
 * A conservative, hand-authored garbage matte for this shot, not AI segmentation.
 * It removes the desk/watermark; video luminance and edges resolve detail inside it.
 * A different composition should supply its own maskSrc (or useVideoAlpha).
 */
export function createSilhouetteMask() {
  const canvas = document.createElement("canvas")
  canvas.width = 960
  canvas.height = 540
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, 960, 540)
  ctx.fillStyle = "#fff"
  ctx.filter = "blur(3px)"
  const outline = [
    [0.18, 0.93],
    [0.175, 0.78],
    [0.19, 0.62],
    [0.21, 0.49],
    [0.27, 0.44],
    [0.34, 0.42],
    [0.35, 0.34],
    [0.345, 0.23],
    [0.35, 0.12],
    [0.39, 0.025],
    [0.45, 0.015],
    [0.5, 0.055],
    [0.535, 0.15],
    [0.55, 0.28],
    [0.54, 0.38],
    [0.51, 0.44],
    [0.57, 0.46],
    [0.61, 0.55],
    [0.65, 0.68],
    [0.67, 0.76],
    [0.7, 0.6],
    [0.715, 0.57],
    [0.94, 0.565],
    [0.945, 0.6],
    [0.87, 0.965],
    [0.85, 0.99],
    [0.62, 0.99],
    [0.47, 0.955],
    [0.25, 0.955],
  ]
  ctx.beginPath()
  outline.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * 960, y * 540)
    else ctx.lineTo(x * 960, y * 540)
  })
  ctx.closePath()
  ctx.fill()
  return canvas
}

export function createGlyphAtlas() {
  const chars = "01{}<>/+=:;アイウエカキサシタナハマヤラ"
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 32
  const ctx = canvas.getContext("2d")!
  ctx.font = "24px monospace"
  ctx.fillStyle = "#fff"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  for (let i = 0; i < 32; i++)
    ctx.fillText(chars[i % chars.length], i * 32 + 16, 17)
  return canvas
}
