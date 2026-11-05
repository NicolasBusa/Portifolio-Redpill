export const vertexShader = `
precision highp float;
attribute vec2 aUv;
attribute vec2 aSeed;
uniform sampler2D uVideo;
uniform sampler2D uMask;
uniform sampler2D uStart;
uniform vec2 uScale;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform mediump float uTime;
uniform float uAssemble;
uniform float uDecode;
uniform float uSize;
uniform float uDpr;
uniform float uStrength;
uniform float uLoopMix;
uniform float uAlpha;
varying mediump float vLight;
varying mediump float vSeed;
varying mediump float vGlyph;
varying mediump float vVisibility;

float luma(vec2 uv) {
  vec3 c = mix(texture2D(uVideo, uv).rgb, texture2D(uStart, uv).rgb, uLoopMix);
  return dot(c, vec3(.299, .587, .114));
}
void main() {
  float brightness = luma(aUv);
  vec2 texel = vec2(1.0 / 960.0, 1.0 / 540.0) * 1.6;
  float edge = abs(luma(aUv + vec2(texel.x, 0.0)) - luma(aUv - vec2(texel.x, 0.0)))
             + abs(luma(aUv + vec2(0.0, texel.y)) - luma(aUv - vec2(0.0, texel.y)));
  float mask = mix(texture2D(uMask, aUv).r, texture2D(uVideo, aUv).a, uAlpha);
  float threshold = smoothstep(.004, .021, brightness);
  vVisibility = mask * threshold;
  vSeed = aSeed.x;
  vGlyph = step(.978, aSeed.y);
  float scan = pow(max(0.0, sin(aUv.y * 54.0 - uTime * 1.1)), 24.0);
  float flicker = .88 + .12 * sin(aSeed.x * 240.0 + uTime * 2.3);
  float shadowSignal = smoothstep(.006, .08, brightness) * (1.0 - smoothstep(.12, .3, brightness)) * .23;
  float contourGain = mix(4.0, 1.8, smoothstep(.12, .3, brightness));
  vLight = (pow(brightness, 1.35) * 2.25 + shadowSignal + edge * contourGain + threshold * .035 + scan * .055) * flicker;
  vLight *= .88 + aSeed.y * .24;
  vec2 p = vec2(aUv.x * 2.0 - 1.0, 1.0 - aUv.y * 2.0) * uScale;
  float remaining = 1.0 - uAssemble;
  float angle = aSeed.x * 62.83 + remaining * 3.0;
  vec2 scatter = vec2(cos(angle), sin(angle)) * (.25 + aSeed.y * 1.1);
  float settle = remaining * remaining + sin(uAssemble * 16.0 + aSeed.y * 2.0) * remaining * .035;
  p += scatter * settle;
  p += vec2(sin(aSeed.y * 50.0 + uTime), cos(aSeed.x * 32.0 + uTime * .8)) * uDecode * (.12 + aSeed.x * .45);
  p += scatter * uDecode * .35;
  vec2 delta = (p - uPointer) * vec2(uResolution.x / uResolution.y, 1.0);
  float dist = length(delta);
  float repulse = pow(max(0.0, 1.0 - dist / .26), 2.0) * uStrength;
  p += normalize(delta + vec2(.0001)) * repulse * .065;
  p.x += sin(aUv.y * 700.0 + uTime * .5) * .0007;
  gl_Position = vec4(p, 0.0, 1.0);
  float glyphSize = mix(1.0, 3.05, vGlyph);
  gl_PointSize = clamp(uSize * uDpr * glyphSize * (.8 + min(vLight, 1.2) * .3), 1.0, 14.0);
  vVisibility *= smoothstep(aSeed.x * .55, aSeed.x * .55 + .35, uAssemble);
  if (vVisibility < .015) gl_Position = vec4(3.0, 3.0, 0.0, 1.0);
}
`

export const fragmentShader = `
precision mediump float;
uniform sampler2D uGlyphs;
uniform vec3 uColor;
uniform float uGlow;
uniform float uTime;
varying float vLight;
varying float vSeed;
varying float vGlyph;
varying float vVisibility;
void main() {
  vec2 p = gl_PointCoord - .5;
  float point = exp(-dot(p, p) * 6.0);
  float index = mod(floor(vSeed * 32.0) + floor(uTime * .65 + vSeed * 3.0), 32.0);
  float glyph = texture2D(uGlyphs, vec2((index + gl_PointCoord.x) / 32.0, gl_PointCoord.y)).a;
  float shape = mix(point, glyph, vGlyph);
  float alpha = shape * vVisibility * min(vLight, 1.0);
  vec3 color = mix(uColor, vec3(.5, 1.0, .5), clamp(vLight - .5, 0.0, .6));
  gl_FragColor = vec4(color * (.7 + uGlow * .65), alpha * .88);
}
`
