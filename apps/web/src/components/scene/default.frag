// A clean, graphic cosmic rift. This deliberately avoids a ray-marched noise
// field: the important silhouette is made from smooth analytic shapes so it
// stays legible at every resolution instead of turning into static.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_audioLevel;

#define PI 3.14159265

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// A handful of very short, independently chosen rift segments misalign at a
// time. The time gate is intentionally sparse, so this reads as a fault in the
// tear rather than a layer of animated noise.
float glitchBurst(float y) {
  float tick = floor(u_time * 0.65);
  float phase = fract(u_time * 0.65);
  float event = step(0.77, hash21(vec2(tick, 1.7)));
  float duration = 1.0 - smoothstep(0.035, 0.10, phase);
  float segment = step(0.56, hash21(vec2(tick, floor((y + 1.0) * 12.0))));
  return event * duration * segment;
}

// Sparse, crisp stars rather than full-screen grain. A single star can occupy
// each cell, and only a small, deterministic subset of cells are lit.
float stars(vec2 p, float scale) {
  vec2 cell = floor(p * scale);
  vec2 f = fract(p * scale) - 0.5;
  float seed = hash21(cell);
  vec2 offset = vec2(hash21(cell + 4.7), hash21(cell + 9.2)) - 0.5;
  float d = length(f - offset * 0.72);
  float point = 1.0 - smoothstep(0.008, 0.025, d);
  return point * step(0.965, seed) * (0.55 + 0.45 * sin(u_time * (0.7 + seed) + seed * 22.0));
}

// The seam of the tear is intentionally irregular, but its motion is slow and
// continuous: it reads as stressed spacetime, not procedural turbulence.
float seam(vec2 p) {
  float tick = floor(u_time * 0.65);
  float lane = floor((p.y + 1.0) * 12.0);
  float direction = hash21(vec2(tick, lane)) * 2.0 - 1.0;
  return 0.030 * sin(p.y * 7.0 + 0.35 * sin(u_time * 0.25)) +
         0.018 * sin(p.y * 17.0 - u_time * 0.18) +
         u_audioLevel * 0.004 * sin(p.y * 58.0 - u_time * 13.0) +
         glitchBurst(p.y) * direction * 0.028;
}

float riftMask(vec2 p, out float edgeDistance) {
  float y = abs(p.y);
  float taper = smoothstep(0.98, 0.14, y);
  float halfWidth = mix(0.012, 0.105, taper * taper);
  edgeDistance = abs(p.x - seam(p)) - halfWidth;
  float capped = max(edgeDistance, y - 0.92);
  return 1.0 - smoothstep(-0.008, 0.012, capped);
}

// Smooth curling bands behind the rupture. They supply scale and motion without
// covering the whole screen in texture.
vec3 accretion(vec2 p) {
  float r = length(p * vec2(0.82, 1.18));
  float a = atan(p.y, p.x);
  float spiral = a + 2.8 * log(r + 0.16) - u_time * 0.13;
  float bandA = exp(-36.0 * pow(r - (0.43 + 0.050 * sin(spiral * 2.0)), 2.0));
  float bandB = exp(-62.0 * pow(r - (0.62 + 0.035 * sin(spiral * 3.0 + 1.4)), 2.0));
  float sweep = smoothstep(-0.95, 0.7, sin(a - 0.45));
  float cut = smoothstep(1.20, 0.20, r);
  vec3 hot = vec3(1.15, 0.18, 0.045) * bandA;
  vec3 electric = vec3(0.06, 0.42, 1.28) * bandB;
  return (hot + electric) * cut * (0.18 + 0.82 * sweep);
}

vec3 background(vec2 p) {
  float vignette = dot(p, p);
  vec3 sky = mix(vec3(0.006, 0.008, 0.035), vec3(0.018, 0.035, 0.095),
                 exp(-1.4 * vignette));

  // Two broad, low-frequency veils give the void depth without noise.
  float blueVeil = exp(-7.0 * pow(p.y + 0.34 + 0.11 * sin(p.x * 2.1), 2.0));
  float redVeil = exp(-10.0 * pow(p.y - 0.48 - 0.08 * sin(p.x * 3.0), 2.0));
  sky += vec3(0.015, 0.075, 0.21) * blueVeil * (0.25 + 0.75 * exp(-p.x * p.x));
  sky += vec3(0.11, 0.009, 0.045) * redVeil * 0.45;

  float starfield = stars(p + vec2(u_time * 0.002, 0.0), 21.0) +
                    stars(p * 1.7 - vec2(u_time * 0.001, 0.0), 34.0) * 0.65;
  return sky + vec3(0.52, 0.70, 1.0) * starfield;
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
  p.y -= 0.04;

  // Audio only agitates the seam itself (in seam()), leaving the surrounding
  // accretion aura absolutely still and making each pulse feel contained.
  float audioPulse = min(u_audioLevel, 1.0);

  // Weak lensing pulls distant light into a curve around the rupture.
  vec2 lensVector = p - vec2(0.0, 0.02);
  float lensFalloff = exp(-3.0 * dot(lensVector, lensVector));
  vec2 warped = p + normalize(lensVector + vec2(0.0001, 0.0)) * 0.055 * lensFalloff;

  float edgeDistance;
  float voidMask = riftMask(p, edgeDistance);
  vec3 col = background(warped);
  col += accretion(warped);

  float yFade = smoothstep(0.98, 0.14, abs(p.y));
  float nearEdge = exp(-abs(edgeDistance) * 42.0) * yFade;
  float outerGlow = exp(-max(edgeDistance, 0.0) * 9.0) * yFade;
  float flicker = 0.72 + 0.28 * sin(p.y * 36.0 - u_time * 1.6);

  // Split-color ionisation makes both lips of the void feel physically torn.
  float side = step(seam(p), p.x);
  vec3 leftFire = vec3(1.35, 0.095, 0.018);
  vec3 rightFire = vec3(0.025, 0.43, 1.55);
  vec3 rim = mix(leftFire, rightFire, side);
  float travellingPulse = 0.5 + 0.5 * sin(p.y * 58.0 - u_time * 13.0);
  float glitchTrace = glitchBurst(p.y) *
                      (1.0 - smoothstep(0.012, 0.045, abs(edgeDistance)));
  col += rim * nearEdge *
         (1.6 + 1.4 * flicker + audioPulse * travellingPulse * 0.28);
  col += rim * glitchTrace * 0.65;
  col += mix(leftFire, rightFire, 0.5) * outerGlow * 0.20;

  // A black core with just enough reflected, dying light to preserve the
  // contour; applying it last gives a genuinely bottomless central tear.
  col = mix(col, vec3(0.0002, 0.0004, 0.0012), voidMask);
  col += rim * nearEdge * voidMask * 0.20;

  // Filmic compression retains the bright rim's colour instead of clipping it
  // to flat white, then a light gamma lift preserves the deep-space blacks.
  col = col / (1.0 + col);
  col = pow(col, vec3(0.82));
  gl_FragColor = vec4(col, 1.0);
}
