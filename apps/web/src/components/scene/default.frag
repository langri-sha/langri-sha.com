// A clean, graphic cosmic rift. This deliberately avoids a ray-marched noise
// field: the important silhouette is made from smooth analytic shapes so it
// stays legible at every resolution instead of turning into static. The tear
// itself opens onto a second space — a hidden world of information, a black
// plain where data rises in hairline spires around a helix-bearing monolith
// — built from the same discipline.

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

// ——— The archive beyond the tear ———
// Through the aperture: a hidden world of information. A black plain under
// no sky, where hairline spires of data stand like long exposures of rising
// signals; two circuit-trees flank a distant monolith that carries a slow
// double helix above a lit berth; a thin weather of characters hangs
// between them. Every structure takes its bounds from the star's edge, so
// the skyline repeats the silhouette. Cold recording-light monochrome —
// nothing like the ionised colour on our side of the tear.

// All interior periods divide the 256 s uniform wrap (2*PI / 256): drift
// speeds advance whole pattern periods per cycle and every event counter is
// hashed on a ring sized to its tick count, so the wrap lands mid-stride.
const float INTERIOR_W = 0.0245437;

const vec3 SILVER = vec3(0.74, 0.80, 0.90);
const vec3 HOT = vec3(1.25, 1.32, 1.48);

float sq(float x) {
  return x * x;
}

// The star's edge, solved for the interior: given a coordinate along one
// axis, the half-extent the aperture affords along the other. Structures
// take their bounds from it, so the skyline agrees with the silhouette
// instead of dying against the mask.
float apertureSpan(float along, float axisA, float axisB) {
  float span = pow(min(abs(along) / axisA, 1.0), STAR_SHARPNESS);
  return axisB * pow(max(1.0 - span, 0.001), 1.0 / STAR_SHARPNESS);
}

// One data-spire in its lane: a hairline stack of beads drifting slowly
// upward, the long exposure of signals leaving the plain. Rows ride integer
// rings — 128 or 64 per cycle — so the wrap lands mid-climb. The stack
// thins with height, only its crown discharges hot, and a rare column
// carries the unbroken streak of a signal too fast to resolve.
vec3 spireAt(vec2 q, float lane, float laneW, float salt, float hairline,
             float clear) {
  float s0 = hash21(vec2(lane, salt));
  if (s0 < 0.50) {
    return vec3(0.0);
  }
  float x = (lane + 0.5 + (hash21(vec2(lane, salt + 7.0)) - 0.5) * 0.6) * laneW;
  float reach = apertureSpan(x, STAR_RADIUS.x, STAR_RADIUS.y);
  if (reach < 0.035 || abs(x) < clear) {
    return vec3(0.0);
  }
  float dx = q.x - x;
  if (abs(dx) > laneW * 1.5) {
    return vec3(0.0);
  }
  float yBase = -reach * 0.94 + reach * 0.35 * hash21(vec2(lane, salt + 13.0));
  float yTop = min(mix(yBase + 0.08, reach * 0.90,
                       pow(hash21(vec2(lane, salt + 17.0)), 0.55)),
                   reach * 0.92);
  float rise = clamp((q.y - yBase) / max(yTop - yBase, 0.001), 0.0, 1.0);
  float within = smoothstep(yBase - 0.012, yBase + 0.012, q.y) *
                 (1.0 - smoothstep(yTop - 0.015, yTop + 0.010, q.y));

  float rowPick = hash21(vec2(lane, salt + 43.0));
  float rowH = rowPick < 0.5 ? 0.008 : 0.016;
  float ring = rowPick < 0.5 ? 128.0 : 64.0;
  float ry = (q.y - 0.004 * u_time) / rowH;
  float rowKey = mod(floor(ry), ring);
  float rk = hash21(vec2(lane * 17.0 + salt, rowKey));
  float dy = (fract(ry) - 0.5) * rowH;

  // A row is a bead or, now and then, a short dash lying across the column;
  // the stack thins as it climbs.
  float dash = step(0.86, hash21(vec2(lane * 17.0 + salt, rowKey + 3.0)));
  float on = step(mix(0.40, 0.74, rise), rk);
  float hot = step(0.96, rk) * step(0.70, rise);
  float sigma = hairline *
                mix(0.8, 1.35, hash21(vec2(lane * 17.0 + salt, rowKey + 5.0)));
  float d2 = sq(dx / mix(1.0, 2.4, dash)) + sq(dy / mix(1.0, 0.6, dash));
  float bead = exp(-d2 / sq(sigma)) +
               0.22 * exp(-d2 / sq(min(sigma * 2.8, laneW * 0.30)));
  float shimmer = 0.75 + 0.25 * sin(u_time * (9.0 * INTERIOR_W) + rk * 40.0);
  vec3 col = SILVER * on * (1.0 - hot) * bead * 0.85 * within;
  col += HOT * hot * bead * 1.7 * shimmer * within;

  col += SILVER * step(0.82, hash21(vec2(lane, salt + 23.0))) *
         exp(-sq(dx / (hairline * 0.85))) * 0.16 * within;
  // Every column roots in a small ember where it leaves the plain.
  col += SILVER * exp(-(sq(dx / (laneW * 0.38)) + sq((q.y - yBase) / 0.006))) * 0.22;
  return col;
}

// One depth of spires. The pixel's lane and both neighbours are tested,
// which is every column able to reach it.
vec3 spireLayer(vec2 q, float laneW, float salt, float hairline, float clear) {
  float lane = floor(q.x / laneW);
  return spireAt(q, lane - 1.0, laneW, salt, hairline, clear) +
         spireAt(q, lane, laneW, salt, hairline, clear) +
         spireAt(q, lane + 1.0, laneW, salt, hairline, clear);
}

// Two circuit-trees stand in the tear's horizontal lobes, drawn once in |x|
// — the archive is a formal place and its architecture agrees with itself.
// Dotted rails for spines, hairline branches leaving at right angles,
// elbows dropping toward lower rows, a bead at every junction. The branch
// field is row-quantised: a pixel resolves its own row and the two above
// it, which is every elbow able to reach down to it.
vec3 circuitTrees(vec2 q, float hairline) {
  vec2 l = vec2(abs(q.x) - 0.122, q.y + 0.020);
  if (l.x < -0.058 || l.x > 0.140 || abs(l.y) > 0.120) {
    return vec3(0.0);
  }
  vec3 col = vec3(0.0);

  // Two dotted rails of unequal height make the spine read as built, not
  // drawn.
  for (int r = 0; r < 2; r++) {
    float fr = float(r);
    float xr = fr * 0.020;
    float top = mix(0.080, 0.030, fr);
    float bottom = mix(-0.095, -0.062, fr);
    float span = smoothstep(bottom - 0.006, bottom, l.y) *
                 (1.0 - smoothstep(top, top + 0.006, l.y));
    float on = step(0.28, hash21(vec2(floor(l.y / 0.009), 5.0 + fr)));
    float dy = (fract(l.y / 0.009) - 0.5) * 0.009;
    col += SILVER * span * on *
           exp(-(sq(l.x - xr) + sq(dy)) / sq(hairline * 0.9)) * 0.95;
  }

  // A reading pulse climbs the tall rail — 8 laps per cycle, wrap-silent.
  float lap = fract(u_time * 0.03125 + 0.19);
  float yPulse = mix(-0.095, 0.080, lap);
  col += HOT * exp(-(sq(l.x) + sq(l.y - yPulse)) / sq(hairline * 1.8)) * 1.3;

  // Branch rows. Each may send one hairline out of the spine, its length
  // capped by the star's edge at that height; elbows turn down at the tip,
  // sink no deeper than the edge allows, and end in a bead.
  float j0 = floor(l.y / 0.023);
  for (int i = 0; i < 3; i++) {
    float j = j0 + float(i);
    float yRow = (j + 0.5) * 0.023;
    float hb = hash21(vec2(j, 21.7));
    if (yRow > 0.082 || yRow < -0.088 || hb < 0.35) {
      continue;
    }
    float dir = mix(1.0, -1.0, step(0.85, hash21(vec2(j, 24.1))));
    float xEdge = apertureSpan(yRow - 0.020, STAR_RADIUS.y, STAR_RADIUS.x);
    float cap = dir > 0.0 ? max(xEdge - 0.136, 0.012) : 0.046;
    float len = mix(0.018, cap, pow(hash21(vec2(j, 29.3)), 1.4));
    float xEnd = dir * len;
    float dyRow = l.y - yRow;

    float run = step(min(0.0, xEnd) - 0.001, l.x) *
                step(l.x, max(0.0, xEnd) + 0.001);
    col += SILVER * run * exp(-sq(dyRow / hairline)) * 0.75;

    float bent = step(0.55, hash21(vec2(j, 31.1)));
    float sink = apertureSpan(0.122 + xEnd, STAR_RADIUS.x, STAR_RADIUS.y) * 0.94 +
                 yRow - 0.020;
    float drop = min(0.023 * mix(0.5, 2.1, hash21(vec2(j, 33.9))),
                     max(sink, 0.0)) * bent;
    float within = step(yRow - drop, l.y) * step(l.y, yRow);
    col += SILVER * within * bent * exp(-sq((l.x - xEnd) / hairline)) * 0.75;
    col += SILVER *
           exp(-(sq(l.x - xEnd) + sq(l.y - (yRow - drop))) / sq(hairline * 1.6)) *
           1.25;
    col += SILVER * exp(-(sq(l.x) + sq(dyRow)) / sq(hairline * 1.4)) * 1.05;
  }
  return col;
}

// A thin weather of characters hangs in the air between the structures:
// dot-matrix glyphs re-rolling on their own 64-tick beats, and here and
// there a chevron — waymarks in a language we can't read. Scarce by
// construction; the emptiness is the point.
vec3 glyphField(vec2 q) {
  vec2 cellSize = vec2(0.046, 0.040);
  vec2 cell = floor(q / cellSize);
  float gs = hash21(cell + 51.3);
  if (gs < 0.88) {
    return vec3(0.0);
  }
  vec2 centre = (cell + 0.5) * cellSize;
  if (abs(centre.x) < 0.085 ||
      abs(centre.y) > apertureSpan(centre.x, STAR_RADIUS.x, STAR_RADIUS.y) * 0.85) {
    return vec3(0.0);
  }
  vec2 f = (q - centre) / vec2(0.017, 0.024) + 0.5;
  if (f.x < 0.0 || f.x > 1.0 || f.y < 0.0 || f.y > 1.0) {
    return vec3(0.0);
  }
  float breathe = 0.50 + 0.50 * sin(u_time * (5.0 * INTERIOR_W) + gs * 43.0);
  if (gs > 0.965) {
    vec2 m = f - 0.5;
    float d = abs(m.y + 0.12 - abs(m.x) * 0.75);
    float line = exp(-sq(d / 0.07)) * (1.0 - smoothstep(0.30, 0.44, abs(m.x)));
    return SILVER * line * 0.50 * breathe;
  }
  float tick = floor(u_time * 0.25 + gs * 9.0);
  float seed = hash21(vec2(mod(tick, 64.0) + cell.x * 3.0, cell.y));
  vec2 sub = floor(f * vec2(3.0, 5.0));
  float on = step(0.46, hash21(vec2(seed * 63.0, sub.x + sub.y * 3.0)));
  vec2 dl = fract(f * vec2(3.0, 5.0)) - 0.5;
  float d = (1.0 - smoothstep(0.16, 0.32, length(dl))) * on;
  return SILVER * d * 0.28 * breathe;
}

// The monolith: the capital of the archive, standing deepest in the scene
// on a lit berth. Read bottom to top: the berth's hot bar over a dim wider
// echo; a fountain of packets condensing out of the light; stacked floors
// of dash-work narrowing with height; the double helix turning three times
// a cycle where the tear is widest; a crown thinning to single blips under
// a beacon. One bright packet climbs the whole height each lap, and the
// berth answers the voice.
vec3 monolith(vec2 q, float hairline) {
  float ax = abs(q.x);
  if (ax > 0.12 || q.y < -0.30 || q.y > 0.42) {
    return vec3(0.0);
  }
  vec3 col = vec3(0.0);
  float surge = 1.0 + 0.55 * min(u_audioLevel, 1.0);

  // The berth.
  col += HOT * smoothstep(0.034, 0.016, ax) *
         exp(-sq((q.y + 0.225) / 0.0026)) * 2.8 * surge;
  col += SILVER * smoothstep(0.046, 0.022, ax) *
         exp(-sq((q.y + 0.237) / 0.0018)) * 0.55;
  col += SILVER * exp(-(sq(ax / 0.055) + sq((q.y + 0.222) / 0.024))) *
         0.50 * surge;
  col += HOT * exp(-(sq(ax - 0.033) + sq(q.y + 0.229)) / sq(hairline * 1.6)) * 1.1;

  // The fountain: three hairline jets of packets rising off the berth and
  // thinning out — 256 rows per cycle, an integer ring.
  float fBand = smoothstep(-0.221, -0.211, q.y) *
                (1.0 - smoothstep(-0.168, -0.152, q.y));
  if (fBand > 0.001) {
    float lift = 1.0 - smoothstep(-0.215, -0.158, q.y);
    float fy = (q.y - 0.008 * u_time) / 0.008;
    float fKey = mod(floor(fy), 256.0);
    float fdy = (fract(fy) - 0.5) * 0.008;
    for (int c = 0; c < 3; c++) {
      float xc = (float(c) - 1.0) * 0.0105;
      float fk = hash21(vec2(fKey, 61.0 + float(c) * 9.0));
      col += HOT * step(mix(0.92, 0.30, lift), fk) *
             exp(-(sq(q.x - xc) + sq(fdy)) / sq(hairline)) * fBand * 1.4 * surge;
    }
  }

  // The floors: stacked dash-work, symmetric about the axis, narrowing with
  // height. A rare wide row reads as a fin, ends carry beads, and now and
  // then a floor lights hot for a beat on a 64-tick ring.
  float bodyBand = smoothstep(-0.152, -0.142, q.y) *
                   (1.0 - smoothstep(0.026, 0.036, q.y));
  if (bodyBand > 0.001) {
    float bKey = floor(q.y / 0.016);
    float bdy = (fract(q.y / 0.016) - 0.5) * 0.016;
    float bk = hash21(vec2(bKey, 43.0));
    float wide = step(0.88, bk);
    float W = mix(0.034, 0.012, smoothstep(-0.150, 0.030, q.y)) *
              mix(0.55, 1.0, hash21(vec2(bKey, 47.0))) * mix(1.0, 1.8, wide);
    float gap = 0.0035 + 0.004 * hash21(vec2(bKey, 53.0));
    float seg = smoothstep(gap - 0.0015, gap + 0.0015, ax) *
                (1.0 - smoothstep(W - 0.001, W + 0.002, ax));
    float beat = u_time * 0.25 + bk * 11.0;
    float flash = step(0.90, hash21(vec2(mod(floor(beat), 64.0), bKey))) *
                  (1.0 - smoothstep(0.02, 0.50, fract(beat)));
    float row = step(0.30, bk);
    float line = exp(-sq(bdy / hairline));
    col += SILVER * row * seg * line * (0.85 + 0.60 * wide) * bodyBand;
    col += HOT * row * seg * line * flash * 1.6 * bodyBand;
    col += SILVER * row * exp(-(sq(ax - W) + sq(bdy)) / sq(hairline * 1.4)) *
           1.15 * bodyBand;
    col += SILVER * exp(-sq(q.x / hairline)) * 0.20 * bodyBand;
  }

  // The helix: two strands of beads winding about the axis, the near strand
  // bright and the far strand dim, faint rungs on alternate rows — the
  // archive's code, held up where the tear is widest.
  float hBand = smoothstep(0.048, 0.068, q.y) *
                (1.0 - smoothstep(0.198, 0.220, q.y));
  if (hBand > 0.001) {
    float hy = q.y / 0.008;
    float hdy = (fract(hy) - 0.5) * 0.008;
    float phase = (floor(hy) + 0.5) * 0.512 + u_time * (3.0 * INTERIOR_W);
    for (int s = 0; s < 2; s++) {
      float ph = phase + float(s) * PI;
      float d2 = sq(q.x - 0.026 * sin(ph)) + sq(hdy);
      col += SILVER * exp(-d2 / sq(hairline * 1.15)) *
             mix(0.30, 1.50, 0.5 + 0.5 * cos(ph)) * hBand;
    }
    float rung = step(0.5, mod(floor(hy), 2.0));
    col += SILVER * rung * step(ax, abs(0.026 * sin(phase))) *
           exp(-sq(hdy / (hairline * 0.8))) * 0.24 * hBand;
  }

  // The crown: a thinning run of blips drifting upward — 64 rows per cycle
  // — under a beacon flashing on its own 64-tick beat.
  float cBand = smoothstep(0.220, 0.235, q.y) *
                (1.0 - smoothstep(0.385, 0.405, q.y));
  if (cBand > 0.001) {
    float cy = (q.y - 0.004 * u_time) / 0.016;
    float cKey = mod(floor(cy), 64.0);
    float cdy = (fract(cy) - 0.5) * 0.016;
    col += SILVER * step(mix(0.42, 0.94, smoothstep(0.235, 0.390, q.y)),
                         hash21(vec2(cKey, 71.0))) *
           exp(-(sq(q.x) + sq(cdy)) / sq(hairline)) * 1.25 * cBand;
  }
  float blink = u_time * 0.25 + 0.37;
  float beacon = step(0.72, hash21(vec2(mod(floor(blink), 64.0), 3.3))) *
                 (1.0 - smoothstep(0.02, 0.55, fract(blink)));
  float dBeacon = sq(q.x) + sq(q.y - 0.360);
  col += HOT * (exp(-dBeacon / sq(hairline * 1.5)) +
                0.35 * exp(-dBeacon / sq(0.008))) * (0.35 + 1.80 * beacon);

  // One bright packet climbs the whole tower each lap — berth to crown in a
  // clean line through floors, helix, and blips — 16 laps per cycle.
  float climb = fract(u_time * 0.0625 + 0.31);
  float above = q.y - mix(-0.215, 0.400, climb);
  col += HOT * (exp(-(sq(q.x) + sq(above)) / sq(hairline * 1.9)) * 2.0 +
                step(above, 0.0) * exp(above * 30.0) *
                exp(-sq(q.x / hairline)) * 0.55) * surge;
  return col;
}

vec3 interior(vec2 p, float edgeDistance) {
  // The camera behind the tear drifts sideways, and each depth shifts by a
  // different fraction of it — the monolith least, because it stands
  // farthest in. That differential slide against the fixed silhouette is
  // what keeps the flat black reading as a space rather than a poster.
  vec2 sway = vec2(
    sin(u_time * (4.0 * INTERIOR_W)) +
      0.55 * sin(u_time * (7.0 * INTERIOR_W) + 1.9),
    cos(u_time * (3.0 * INTERIOR_W)) +
      0.55 * sin(u_time * (6.0 * INTERIOR_W) + 4.1)
  ) * 0.038;

  // Near-black, with the faintest cold haze where the plain meets the dark.
  vec3 col = vec3(0.0016, 0.0021, 0.0034);
  col += vec3(0.016, 0.018, 0.024) * exp(-sq((p.y + 0.225) / 0.05));

  // The city, deep to near: the monolith on its berth, two ranks of spires,
  // then the schematics and their weather of characters.
  col += monolith(p - sway * 0.10, 0.0018);
  col += spireLayer(p - sway * 0.30, 0.016, 11.0, 0.0011, 0.032) * 0.75;
  col += spireLayer(p - sway * 0.55, 0.030, 47.0, 0.0016, 0.062) * 1.30;
  vec2 near = p - sway * 0.78;
  col += circuitTrees(near, 0.0016);
  col += glyphField(near);

  // The hidden world is a recording and the tear is its screen: a film of
  // grain, quantised to ticks that divide the cycle so the wrap never
  // stutters.
  float tick = mod(floor(u_time * 24.0), 6144.0);
  float grain = hash21(floor(p * 340.0) + vec2(tick * 0.731, tick * 0.377));
  col *= 0.88 + 0.24 * grain;
  col += vec3(0.9, 0.95, 1.1) * grain * 0.0050;

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
