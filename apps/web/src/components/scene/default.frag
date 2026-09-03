// A clean, graphic cosmic rift. This deliberately avoids a ray-marched noise
// field: the important silhouette is made from smooth analytic shapes so it
// stays legible at every resolution instead of turning into static. The tear
// itself opens onto a second space — a warm sunlit system seen through the
// aperture — built from the same analytic discipline.

// star.glsl is prepended at compile time; it carries the precision block and
// the starField() that shapes the middle of the rift.

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
  // The tear opens into a four-pointed star at its centre. Tracking the seam
  // keeps the star fixed to the rift as the seam wavers.
  float sparkle = starField(vec2(p.x - seam(p), p.y));

#ifdef RIFT_STAR_ONLY
  // The rift is nothing but the star — no tails running off the top and
  // bottom. Everything else in the scene is unchanged.
  edgeDistance = sparkle;
  return 1.0 - smoothstep(-0.008, 0.012, sparkle);
#else
  // p.y spans +/-1, so the taper and the cap both run past the frame: the tear
  // still narrows towards its ends, but bleeds off the top and bottom edges
  // instead of terminating on screen.
  float y = abs(p.y);
  float taper = smoothstep(1.7, 0.14, y);
  float halfWidth = mix(0.012, 0.105, taper * taper);
  float slit = abs(p.x - seam(p)) - halfWidth;
  float capped = max(slit, y - 1.6);

  edgeDistance = min(slit, sparkle);
  return 1.0 - smoothstep(-0.008, 0.012, min(capped, sparkle));
#endif
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

// ——— The space beyond the tear ———
// The rift no longer opens onto flat black: through the aperture there is a
// second space with its own sun, a tilted orbital plane, and a dark body
// circling it. It is built from the same analytic shells and bands as the
// outer scene — no noise — but on a warm palette nothing on our side uses,
// so the interior reads as somewhere else, not a darker patch of here.

// All interior periods divide the 256 s uniform wrap (2*PI / 256), so the
// slow drifts never jump when u_time wraps around.
const float INTERIOR_W = 0.0245437;

// The interior's orbital plane leans against our screen axes: the space
// beyond has its own horizon, not ours.
const float INTERIOR_TILT = -0.38;

float sq(float x) {
  return x * x;
}

vec2 tilt2(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// Dust glints for the interior: the same cell trick as stars(), with a size
// knob — the space beyond wants coarser, warmer motes than the outer
// pinpricks, and their scale contrast is part of what sells the depth.
float glints(vec2 p, float scale, float radius, float gate) {
  vec2 cell = floor(p * scale);
  vec2 f = fract(p * scale) - 0.5;
  float seed = hash21(cell + 31.7);
  vec2 offset = vec2(hash21(cell + 3.1), hash21(cell + 8.6)) - 0.5;
  float d = length(f - offset * 0.7);
  float point = 1.0 - smoothstep(radius * 0.35, radius, d);
  float twinkle = 0.62 + 0.38 * sin(u_time * (0.5 + seed) + seed * 39.0);
  return point * step(gate, seed) * twinkle;
}

vec3 interior(vec2 p, float edgeDistance) {
  // The camera beyond the tear sways slowly, and each depth shifts by a
  // different fraction of the sway. The differential slide of the layers
  // against the fixed silhouette is the parallax that makes the aperture read
  // as a window rather than a decal.
  vec2 sway = vec2(
    sin(u_time * (4.0 * INTERIOR_W)) +
      0.55 * sin(u_time * (7.0 * INTERIOR_W) + 1.9),
    cos(u_time * (3.0 * INTERIOR_W)) +
      0.55 * sin(u_time * (6.0 * INTERIOR_W) + 4.1)
  ) * 0.045;

  // The distant sun sits just off the aperture's axis, so the view reads as
  // looking at something rather than down a gunsight.
  vec2 focus = vec2(0.04, 0.05);

  // Three depths: the sun's neighbourhood, a nearer veil, and the far dust.
  vec2 deep = p - focus - sway * 0.35;
  vec2 near = p - focus - sway * 0.90;
  vec2 far = p - sway * 0.15;

  // Its own light: a white-gold core inside an amber corona — clearly warmer
  // than anything on our side. It breathes on its own and answers the chant
  // the way the seam does, so the beyond feels inhabited.
  float breath = 1.0 + 0.09 * sin(u_time * (6.0 * INTERIOR_W) + 0.7) +
                 0.30 * min(u_audioLevel, 1.0);
  // The falloffs are tight because the whole view is only ~0.3 units across:
  // the sun has to be a compact object inside darkness, not a wash that fills
  // the aperture.
  float r2 = dot(deep, deep);
  vec3 col = vec3(0.020, 0.009, 0.006);
  col += vec3(0.30, 0.115, 0.035) * exp(-40.0 * r2) * 0.42;
  col += vec3(0.85, 0.38, 0.10) * exp(-110.0 * r2) * 0.9;
  col += vec3(1.30, 0.98, 0.60) * exp(-260.0 * r2) * 2.2 * breath;
  col += vec3(1.40, 1.30, 1.10) * exp(-900.0 * r2) * 1.4 * breath;

  // A far colder sun, deep in the lower limb: proof the space beyond holds
  // more than one light. It sits so close to the silhouette that the sway
  // slides it behind the lip and back out again.
  vec2 toCompanion = deep - vec2(-0.08, -0.21);
  float c2 = dot(toCompanion, toCompanion);
  col += vec3(0.45, 0.65, 1.05) * exp(-700.0 * c2) * 0.35;
  col += vec3(0.75, 0.88, 1.15) * exp(-2600.0 * c2) * 0.7;

  // The sun's orbital plane is the interior's horizon: a faint warm lane with
  // a shimmer travelling along it, and a thin blazing flare line straight
  // through the sun — an edge-on disc catching its light.
  vec2 plane = tilt2(deep, INTERIOR_TILT);
  float shimmer = 0.78 + 0.22 * sin(plane.x * 16.0 - u_time * (5.0 * INTERIOR_W));
  float bandFall = exp(-sq(plane.y * 10.0)) * exp(-1.9 * abs(plane.x));
  col += vec3(0.60, 0.22, 0.07) * bandFall * shimmer * 0.35;
  col += vec3(1.05, 0.55, 0.22) * exp(-sq(plane.y * 26.0)) *
         exp(-2.2 * abs(plane.x)) * 0.9 * breath;

  // A dust lane curling around the sun, read in silhouette against the
  // corona: the interior's structure comes from darkness, not more glow.
  float rDeep = length(deep);
  float aDeep = atan(deep.y, deep.x);
  float spiralDeep = aDeep + 3.0 * log(rDeep + 0.05) - u_time * (2.0 * INTERIOR_W);
  float duskLane = exp(-300.0 * sq(rDeep - (0.115 + 0.030 * sin(spiralDeep * 2.0))));
  col *= 1.0 - duskLane * 0.4 * smoothstep(0.05, 0.09, rDeep);

  // Far dust behind everything: finer and denser than the outer starfield, so
  // the space beyond reads as receding much further than ours.
  col += vec3(1.0, 0.82, 0.58) * glints(far + vec2(37.0, 11.0), 44.0, 0.10, 0.905) * 0.8;

  // The dark body circling the sun in the tilted plane. On the near half of
  // its orbit it swells and blocks the light outright; on the far half it
  // shrinks and the corona washes over it. A backlit limb keeps it legible
  // whenever it strays from the glare.
  float orbitPhase = u_time * (3.0 * INTERIOR_W) + 2.1;
  vec2 orbitPos =
    tilt2(vec2(cos(orbitPhase), sin(orbitPhase) * 0.34) * 0.150, INTERIOR_TILT);
  float front = smoothstep(0.25, -0.25, sin(orbitPhase));
  float orbR = mix(0.026, 0.046, front);
  vec2 orbVec = deep - orbitPos;
  float dOrb = length(orbVec);
  float body = 1.0 - smoothstep(orbR * 0.82, orbR, dOrb);
  col *= 1.0 - body * mix(0.38, 0.94, front);
  // When the body stands clear of the sun, only its sunward limb catches
  // light; as it transits, the backlight wraps all the way around and the
  // silhouette burns as an annular-eclipse ring.
  vec2 sunward = -normalize(orbitPos + vec2(1e-4, 0.0));
  float limbGlow = exp(-sq((dOrb - orbR) * 70.0));
  float facing = max(dot(normalize(orbVec + vec2(1e-5, 0.0)), sunward), 0.0);
  float wrap = mix(1.0, facing * facing, smoothstep(0.05, 0.16, length(orbitPos)));
  col += vec3(1.25, 0.70, 0.32) * limbGlow * wrap * (0.30 + 0.85 * front);

  // A nearer counter-rotating shell and coarse motes pass in front of the
  // body, which is why they are added after it.
  float rNear = length(near);
  float aNear = atan(near.y, near.x);
  float spiralNear = aNear - 2.6 * log(rNear + 0.07) + u_time * (3.0 * INTERIOR_W);
  float shellB = exp(-80.0 * sq(rNear - (0.235 + 0.050 * sin(spiralNear * 3.0 + 1.3))));
  col += vec3(0.42, 0.11, 0.10) * shellB * 0.5;
  col += vec3(1.0, 0.70, 0.45) * glints(near * 0.8 + vec2(5.0, 71.0), 26.0, 0.16, 0.945) * 0.5;

  // The throat of the tear shades the view near the lips: the interior dims
  // where it meets the silhouette, which both seats it behind the aperture
  // and gives the ionised rim something dark to burn against.
  col *= 1.0 - 0.45 * exp(edgeDistance * 30.0);
  return col;
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

#ifdef RIFT_STAR_ONLY
  // Nothing to fade vertically: the lips stay evenly lit to their points, and
  // the star's field — which grows slowly along its own axes — is left to draw
  // them out into the thin threads running off the top and bottom.
  float yFade = 1.0;
#else
  float yFade = smoothstep(1.7, 0.14, abs(p.y));
#endif
  float nearEdge = exp(-abs(edgeDistance) * 42.0) * yFade;
  float outerGlow = exp(-max(edgeDistance, 0.0) * 9.0) * yFade;
#ifdef RIFT_STAR_ONLY
  // Contain the broad halo radially so only the thin threads reach out, rather
  // than the whole glow smearing into full-height tails.
  outerGlow *= exp(-2.5 * dot(p, p));
#endif
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

  // The core is no longer bottomless black: the tear opens onto another
  // space. Only pixels the mask can see pay for the interior, and applying it
  // last keeps the aperture cleanly bounded by the silhouette.
  vec3 beyond = vec3(0.0002, 0.0004, 0.0012);
  if (voidMask > 0.002) {
    beyond = interior(p, edgeDistance);
  }
  col = mix(col, beyond, voidMask);
  col += rim * nearEdge * voidMask * 0.26;

  // Filmic compression retains the bright rim's colour instead of clipping it
  // to flat white, then a light gamma lift preserves the deep-space blacks.
  col = col / (1.0 + col);
  col = pow(col, vec3(0.82));
  gl_FragColor = vec4(col, 1.0);
}
