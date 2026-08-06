// A clean, graphic cosmic rift. This deliberately avoids a ray-marched noise
// field: the important silhouette is made from smooth analytic shapes so it
// stays legible at every resolution instead of turning into static. The tear
// itself opens onto a second space — a flat black expanse where slender
// strands of light rise like reeds — built from the same discipline.

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

// ——— The grove beyond the tear ———
// Through the aperture there is a flat black expanse facing us: slender
// vertical strands of light rising out of the dark like reeds, beaded with
// dots and dashes, crowned with small sigils, climbed now and then by a
// bright charge, with a whisper of glyph-rain drifting between them. Warm
// candlelight monochrome, cinematic restraint, nothing like the ionised
// colour on our side of the tear.

// All interior periods divide the 256 s uniform wrap (2*PI / 256): drift
// speeds advance whole pattern periods per cycle and every event counter is
// hashed on a ring sized to its tick count, so the wrap lands mid-stride.
const float INTERIOR_W = 0.0245437;

const vec3 TRACE_TINT = vec3(0.88, 0.82, 0.70);
const vec3 SPARK_TINT = vec3(1.30, 1.18, 0.95);

float sq(float x) {
  return x * x;
}

// One strand in its lane: a rising filament of beadwork rooted near the
// floor, crowned with a small sigil, climbed now and then by a bright
// charge. Most strands are in focus — crisp cores under a tight painted
// bloom; a rare one stands fully outside the lens's depth and melts into a
// soft band with a few large bokeh discs; a rare hero outshines its grove.
// Strands gather in loose groves with dead lanes between them.
vec3 strandAt(vec2 q, float lane, float laneW, float salt, float hairline) {
  float grove = step(0.34, hash21(vec2(floor(lane / 3.0), salt + 3.0)));
  float s0 = hash21(vec2(lane, salt));
  if (s0 < 0.58 || grove < 0.5) {
    return vec3(0.0);
  }
  float strandX = (lane + 0.5 + (hash21(vec2(lane, salt + 7.0)) - 0.5) * 0.5) * laneW;
  // The centre of the stage stays clear — the light cone owns it — and the
  // grove conforms to the aperture: each strand roots and tops out inside
  // the star's height at its own x, so nothing wastes itself off-stage.
  float span = pow(abs(strandX) / 0.30, 0.64);
  float reachY = 0.44 * pow(max(1.0 - span, 0.001), 1.5625);
  if (abs(strandX) < 0.035 || reachY < 0.08) {
    return vec3(0.0);
  }

  float yRoot = -reachY * 0.85 + reachY * 0.55 * hash21(vec2(lane, salt + 13.0));
  float yTip = min(yRoot + 0.18 + 0.55 * hash21(vec2(lane, salt + 17.0)),
                   reachY * 0.88);
  float rise = clamp((q.y - yRoot) / (yTip - yRoot), 0.0, 1.0);

  float hero = step(0.93, hash21(vec2(lane, salt + 53.0)));
  float isBokeh = step(0.86, hash21(vec2(lane, salt + 49.0))) * (1.0 - hero);

  // Posture: a slight lean, and a slow bend that carries the tip.
  float bend = (hash21(vec2(lane, salt + 61.0)) - 0.5) * 0.014 *
               sin(u_time * ((3.0 + 2.0 * hero) * INTERIOR_W) +
                   hash21(vec2(lane, salt + 59.0)) * 6.2832);
  float lean = (hash21(vec2(lane, salt + 57.0)) - 0.5) * 0.032;
  float dx = q.x - strandX - lean * (q.y - yRoot) - bend * sq(rise);
  if (abs(dx) > laneW * 1.5) {
    return vec3(0.0);
  }

  float within = smoothstep(yRoot - 0.01, yRoot + 0.06, q.y) *
                 (1.0 - smoothstep(yTip - 0.05, yTip, q.y));

  // Each strand keeps its own tone between amber and pale silver.
  vec3 tint = mix(vec3(0.95, 0.82, 0.62), vec3(0.84, 0.86, 0.88),
                  hash21(vec2(lane, salt + 67.0)));

  float drift = 0.004 * mix(1.0, -1.0, step(0.5, hash21(vec2(lane, salt + 23.0))));
  float surge = 1.0 + 0.45 * min(u_audioLevel, 1.0);
  vec3 col = vec3(0.0);

  if (isBokeh > 0.5) {
    // Outside the depth of field the beadwork melts together: a soft band
    // of light, and a few large discs where its brightest beads would be.
    // Rows of 0.064 give 16 per drift cycle — an integer ring.
    float env = 0.5 + 0.5 * sin(q.y * 9.0 + hash21(vec2(lane, salt + 71.0)) * 6.2832);
    col += tint * exp(-sq(dx / (laneW * 0.30))) * (0.08 + 0.15 * env) * within;
    float ryB = (q.y - drift * u_time) / 0.064;
    float rkB = hash21(vec2(lane * 13.0 + salt, mod(floor(ryB), 16.0)));
    float dyB = (fract(ryB) - 0.5) * 0.064;
    float disc = exp(-(sq(dx) + sq(dyB)) / sq(laneW * 0.28));
    col += tint * disc * step(0.55, rkB) * 0.40 * within;
    col += SPARK_TINT * disc * step(0.90, rkB) * 0.55 * within;
    if (hash21(vec2(lane, salt + 29.0)) > 0.62) {
      float lap = fract(u_time * 0.0625 + hash21(vec2(lane, salt + 31.0)) * 7.0);
      float yCharge = mix(yRoot, yTip, lap);
      col += SPARK_TINT *
             exp(-(sq(dx) + sq(q.y - yCharge)) / sq(laneW * 0.30)) * 0.9 * surge;
    }
    return col;
  }

  // In focus: rows of dots and dashes drifting slowly along the strand,
  // spaced differently per strand. Row heights of 0.016 / 0.0256 / 0.032
  // give 64 / 40 / 32 rows per drift cycle — integer rings, silent wrap.
  float rowPick = hash21(vec2(lane, salt + 43.0));
  float rowH = rowPick < 0.4 ? 0.016 : (rowPick < 0.75 ? 0.0256 : 0.032);
  float ring = rowPick < 0.4 ? 64.0 : (rowPick < 0.75 ? 40.0 : 32.0);
  float ry = (q.y - drift * u_time) / rowH;
  float rowKey = mod(floor(ry), ring);
  float rk = hash21(vec2(lane * 13.0 + salt, rowKey));
  float dy = (fract(ry) - 0.5) * rowH;

  // Bloom is painted, not post-processed: a crisp core inside a tight glow
  // and a faint halo, capped to the lane so a neighbour never clips it.
  float hot = step(0.93, rk);
  float squash = mix(1.0, 0.45, step(0.75, rk) * (1.0 - hot));
  float sigma = hairline *
                mix(0.8, 1.5, hash21(vec2(lane * 13.0 + salt, rowKey + 7.0)));
  float d2 = sq(dx) + sq(dy * squash);
  float bead = (1.1 + 0.7 * hero) * exp(-d2 / sq(sigma)) +
               0.32 * exp(-d2 / sq(min(sigma * 2.6, laneW * 0.22))) +
               0.08 * exp(-d2 / sq(min(sigma * 6.0, laneW * 0.45)));
  float carries = step(0.60, rk);
  col += tint * carries * (1.0 - hot) * bead * 0.48 * within;
  col += SPARK_TINT * carries * hot * bead * 1.35 * within;

  // A faint continuous spine on some strands, and a soft glow at the root.
  col += tint * exp(-sq(dx / (hairline * 0.9))) *
         step(0.55, hash21(vec2(lane, salt + 19.0))) * 0.16 * within;
  col += tint * exp(-(sq(dx / (laneW * 0.8)) + sq((q.y - yRoot) / 0.013))) * 0.30;

  // The floor remembers the strand: a dim mirrored streak below the root.
  float sink = yRoot - q.y;
  col += tint * step(0.0, sink) * exp(-sink * 26.0) *
         exp(-sq(dx / (hairline * 4.0))) * 0.15;

  // A charge climbing the strand as a comet with a fading wake. Lap counts
  // of 12 / 16 / 20 per cycle keep the wrap silent.
  if (hash21(vec2(lane, salt + 29.0)) > 0.62 || hero > 0.5) {
    float lapPick = hash21(vec2(lane, salt + 31.0));
    float laps = lapPick < 0.4 ? 12.0 : (lapPick < 0.75 ? 16.0 : 20.0);
    float lap = fract(u_time * (laps / 256.0) + lapPick * 7.0);
    float yCharge = mix(yRoot, yTip, lap);
    float above = q.y - yCharge;
    float head = exp(-(sq(dx) + sq(above)) / sq(hairline * 2.2));
    float wake = step(above, 0.0) * exp(above * 34.0) *
                 exp(-sq(dx / (hairline * 1.5)));
    col += SPARK_TINT * (head * 1.6 + wake * 0.5) * surge * (1.0 + 0.7 * hero);
  }

  // The sigil crowning the tip — a four-rayed spark, ring, or lozenge — with
  // its own painted bloom, flashing when a signal arrives on a 64-tick ring.
  if (hash21(vec2(lane, salt + 37.0)) > 0.45 || hero > 0.5) {
    vec2 l = (q - vec2(strandX + lean * (yTip - yRoot) + bend, yTip + 0.020)) / 0.020;
    float r2 = dot(l, l);
    if (r2 < 5.0) {
      float pick = hash21(vec2(lane, salt + 41.0));
      float reach = 1.0 - smoothstep(0.15, 1.05, length(l));
      float spark = (exp(-sq(l.x / 0.16)) + exp(-sq(l.y / 0.16))) * reach * reach;
      float stroke = hairline / 0.020;
      float haloRing = exp(-sq((length(l) - 0.55) / (stroke * 1.4)));
      float lozenge = exp(-sq((abs(l.x) + abs(l.y) - 0.65) / (stroke * 1.4)));
      float sigil = mix(spark, mix(haloRing, lozenge, step(0.75, pick)), step(0.5, pick));
      float halo = exp(-r2 / sq(1.6)) * 0.16;
      float flash = step(0.82, hash21(vec2(mod(floor(u_time * 0.25 + pick * 9.0), 64.0),
                                           lane + salt))) *
                    (1.0 - smoothstep(0.02, 0.6, fract(u_time * 0.25 + pick * 9.0)));
      float breathe = 0.7 + 0.3 * sin(u_time * (0.6 + pick) + pick * 31.0);
      col += tint * (sigil * 0.9 + halo) * breathe * (1.0 + 0.6 * hero);
      col += SPARK_TINT * (sigil + halo * 2.0) * flash * 1.6;
    }
  }

  return col;
}

// One depth of the grove. The pixel's lane and both neighbours are tested,
// which is every strand able to reach it.
vec3 strandLayer(vec2 q, float laneW, float salt, float hairline) {
  float lane = floor(q.x / laneW);
  return strandAt(q, lane - 1.0, laneW, salt, hairline) +
         strandAt(q, lane, laneW, salt, hairline) +
         strandAt(q, lane + 1.0, laneW, salt, hairline);
}

// A whisper of glyph-rain: a few columns of small dot-matrix characters
// drifting through the web and re-rolling as they go. Scarce and dim — a
// suggestion of language, not a curtain of it.
vec3 glyphRain(vec2 q) {
  float lane = floor(q.x / 0.055);
  if (hash21(vec2(lane, 77.7)) < 0.82) {
    return vec3(0.0);
  }
  float dir = mix(1.0, -1.0, step(0.5, hash21(vec2(lane, 81.1))));
  // 0.004 * 256 = 32 rows of 0.032 per cycle, matching the 32-row hash ring.
  float y = (q.y + dir * 0.004 * u_time) / 0.032;
  float rowKey = mod(floor(y), 32.0);
  vec2 g = vec2((fract(q.x / 0.055) - 0.5) * 0.055 / 0.024 + 0.5, fract(y));
  if (g.x < 0.0 || g.x > 1.0) {
    return vec3(0.0);
  }
  // Each character re-rolls on its own beat: 64 ticks per cycle, offset per
  // cell so the column never changes all at once.
  float tick = floor(u_time * 0.25 + hash21(vec2(lane, rowKey)) * 7.0);
  float charSeed = hash21(vec2(mod(tick, 64.0) + lane * 3.0, rowKey));
  vec2 sub = floor(g * vec2(3.0, 5.0));
  float on = step(0.42, hash21(vec2(charSeed * 63.0, sub.x + sub.y * 3.0)));
  vec2 dl = fract(g * vec2(3.0, 5.0)) - 0.5;
  float dot5x3 = (1.0 - smoothstep(0.20, 0.38, length(dl))) * on;
  float envelope = 0.60 + 0.40 * sin(q.y * 2.3 + lane * 7.0 + u_time * (2.0 * INTERIOR_W));
  return vec3(0.82, 0.74, 0.58) * dot5x3 * 0.15 * envelope;
}

vec3 interior(vec2 p, float edgeDistance) {
  // The space beyond faces us flat-on. The camera behind the tear drifts
  // sideways, and the two depths of the web shift by different fractions of
  // it: that differential slide against the fixed silhouette is what keeps
  // the flat black reading as a space rather than a poster.
  vec2 sway = vec2(
    sin(u_time * (4.0 * INTERIOR_W)) +
      0.55 * sin(u_time * (7.0 * INTERIOR_W) + 1.9),
    cos(u_time * (3.0 * INTERIOR_W)) +
      0.55 * sin(u_time * (6.0 * INTERIOR_W) + 4.1)
  ) * 0.045;

  // Near-black. A soft shaft of light stands in the middle of the space, and
  // a faint band marks the floor the strands rise from.
  vec3 col = vec3(0.003, 0.004, 0.006);
  float coneW = 0.10 + 0.16 * smoothstep(-0.45, 0.45, p.y);
  col += vec3(0.064, 0.065, 0.070) * exp(-sq(p.x / coneW)) *
         (0.30 + 0.70 * smoothstep(-0.60, 0.40, p.y)) *
         (1.0 + 0.08 * sin(u_time * (3.0 * INTERIOR_W)));
  col += vec3(0.065, 0.058, 0.047) * exp(-(sq(p.x / 0.17) + sq((p.y + 0.30) / 0.05)));
  col += vec3(0.045, 0.040, 0.032) * exp(-sq((p.y + 0.33) / 0.055)) * 0.9;

  // Two depths of the grove: fine far strands and wider near ones.
  col += strandLayer(p - sway * 0.30, 0.032, 5.0, 0.0016) * 0.5;
  col += strandLayer(p - sway * 0.85, 0.050, 60.0, 0.0022);
  col += glyphRain(p - sway * 0.85);

  // Scattered grounding lights along the floor line, like a far dark shore;
  // each carries its own small bloom, and neighbouring lanes are tested so
  // no halo is ever clipped.
  vec2 gq = p - sway * 0.85;
  float gl0 = floor(gq.x / 0.02);
  for (int gi = -1; gi <= 1; gi++) {
    float gl = gl0 + float(gi);
    float gs = hash21(vec2(gl, 99.1));
    vec2 gpos = vec2((gl + 0.5 + (hash21(vec2(gl, 88.3)) - 0.5) * 0.8) * 0.02,
                     -0.315 + (gs - 0.5) * 0.03);
    float gd2 = dot(gq - gpos, gq - gpos);
    col += TRACE_TINT * step(0.78, gs) *
           (exp(-gd2 / sq(0.0024)) + 0.3 * exp(-gd2 / sq(0.006))) * 0.6;
  }

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
