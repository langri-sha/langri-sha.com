// Volumetric clouds drifting low across a naturalistic daytime sky.
// A low deck of fractal (fBm) noise, raymarched front-to-back under an open
// sky — the standard procedural-cloud approach (e.g. GPU Gems 3, ch. 16),
// written from scratch for WebGL1 (GLSL ES 1.00) with self-contained hash
// noise. No texture assets, and not derived from any specific reference shader.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// Drift the noise field toward the camera so the deck streams forward (as if
// flying over it) instead of sliding sideways. Wrapped with the JS time (CYCLE
// in index.tsx) so the camera yaw stays seamless.
const vec3 WIND = vec3(-0.006, 0.0, 0.08);
// Sample the noise away from its origin, where the hash clusters into a dense
// blob — otherwise the deck loads as fog before the wind scrolls past it.
const vec3 CLOUD_ORIGIN = vec3(17.0, 6.0, 11.0);
const vec3 SUNDIR = normalize(vec3(0.7, 0.2, -0.45));
const float CYCLE_SECONDS = 256.0;

// A tear in digital space hanging above the deck, drawing real cloud matter up
// into itself. TEAR_POS/TEAR_RADIUS are world-space (where the suction acts on
// the density field); TEAR_CENTER/TEAR_SIZE are the same rift in screen (p)
// coordinates, where the black void is drawn.
const vec3 TEAR_POS = vec3(0.0, 1.9, 6.4);
const float TEAR_RADIUS = 0.5;
const vec2 TEAR_CENTER = vec2(0.0, -0.07);
const float TEAR_SIZE = 0.11;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(hash(p + vec3(0.0, 0.0, 0.0)), hash(p + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash(p + vec3(0.0, 1.0, 0.0)), hash(p + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(hash(p + vec3(0.0, 0.0, 1.0)), hash(p + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hash(p + vec3(0.0, 1.0, 1.0)), hash(p + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}

// Decorrelate successive fbm octaves by cycling the axes and offsetting, so the
// value-noise lattice never lines up between scales — a generic alternative to
// a fixed rotation matrix.
vec3 twist(vec3 p) {
  return p.yzx * 2.1 + vec3(19.1, 33.4, 47.2);
}

float fbm(vec3 p) {
  float f = 0.5000 * noise(p);
  p = twist(p);
  f += 0.2500 * noise(p);
  p = twist(p);
  f += 0.1250 * noise(p);
  p = twist(p);
  f += 0.0625 * noise(p);
  p = twist(p);
  f += 0.0312 * noise(p);
  return f;
}

// Cloud density: an fbm slab that thins out with height, so it reads as a deck
// of broken cloud rather than fog.
// Displace a sample point into the tear's intake: inside the column beneath
// the rift, points sample cloud from lower down — so deck matter appears drawn
// upward — and swirl around the column axis, forming a helical stream that
// narrows as it rises. Returns the displaced point in xyz and the pull
// strength in w, which cloud() reuses to keep the stream fed.
vec4 intake(vec3 p) {
  vec2 h = p.xz - TEAR_POS.xz;
  float column = exp(-0.35 * dot(h, h));
  float rise = clamp((p.y + 0.4) / (TEAR_POS.y + 0.4), 0.0, 1.0);
  float pull = column * rise;

  float ang = pull * (9.0 + 0.8 * sin(6.28318 * u_time / 16.0));
  float s = sin(ang);
  float c = cos(ang);
  h = vec2(c * h.x - s * h.y, s * h.x + c * h.y);

  return vec4(TEAR_POS.x + h.x, p.y - 2.5 * pull, TEAR_POS.z + h.y, pull);
}

float cloud(vec3 p) {
  vec4 ps = intake(p);
  vec3 q = ps.xyz * 1.3 - WIND * u_time + CLOUD_ORIGIN;
  float den =
      clamp(3.0 * fbm(q) - 2.05 - 2.4 * ps.y + 0.45 * ps.w, 0.0, 1.0);

  // Matter dissolves as it crosses into the void.
  return den * smoothstep(TEAR_RADIUS * 0.7, TEAR_RADIUS * 1.4,
                          distance(p, TEAR_POS));
}

// A two-octave estimate of the same field, used only for the sun-light sample
// where fine detail is invisible — half the noise cost of a full lookup.
float cloudLight(vec3 p) {
  vec4 ps = intake(p);
  vec3 q = ps.xyz * 1.3 - WIND * u_time + CLOUD_ORIGIN;
  float f = 0.5 * noise(q);
  q = twist(q);
  f += 0.25 * noise(q);
  return clamp(3.0 * (f * 1.3) - 2.05 - 2.4 * ps.y + 0.45 * ps.w, 0.0, 1.0);
}

// Front-to-back raymarch through the deck, lighting each sample by how much
// denser it is toward the sun (self-shadowing) and fading it into the sky with
// distance (aerial perspective). The deck only occupies a low slab, so rays are
// dropped once they climb out of it (SLAB_TOP) or sink through the floor, empty
// space is skipped in coarse steps, and only cloud interiors are sampled finely.
vec4 raymarch(vec3 ro, vec3 rd, vec3 sky) {
  vec4 sum = vec4(0.0);
  float t = 0.04 * hash21(gl_FragCoord.xy);

  // Rays aimed near the tear march up to its height so the rising stream is
  // covered; everything else stops at the deck top, keeping open sky cheap.
  float top = dot(rd, normalize(TEAR_POS - ro)) > 0.9 ? TEAR_POS.y + 0.5 : 0.6;

  for (int i = 0; i < 110; i++) {
    vec3 pos = ro + t * rd;

    if (pos.y < -2.0 || pos.y > top || t > 32.0 || sum.a > 0.99) {
      break;
    }

    float den = cloud(pos);

    if (den > 0.01) {
      float dif =
        clamp((den - cloudLight(pos + 0.35 * SUNDIR)) / 0.35, 0.0, 1.0);
      vec3 lin = vec3(0.55, 0.65, 0.8) * 1.1 + vec3(1.0, 0.75, 0.45) * 1.7 * dif;
      vec3 base = mix(vec3(1.0, 0.97, 0.92), vec3(0.38, 0.42, 0.5), den);

      vec4 col = vec4(base * lin, den);
      col.rgb = mix(col.rgb, sky, 1.0 - exp(-0.0018 * t * t));
      col.a *= 0.5;
      col.rgb *= col.a;
      sum += col * (1.0 - sum.a);

      t += max(0.05, 0.02 * t);
    } else {
      t += max(0.18, 0.03 * t);
    }
  }

  return clamp(sum, 0.0, 1.0);
}

// The rift itself: a black void with a faint flickering digital rim, painted
// into the sky; the volumetric stream rises across it and dissolves inside.
vec3 tear(vec3 col, vec2 p, float time) {
  vec2 c = p - TEAR_CENTER;
  float r = length(c);

  col *= smoothstep(TEAR_SIZE, TEAR_SIZE * 1.5, r);

  float ring = smoothstep(TEAR_SIZE * 1.6, TEAR_SIZE, r) *
               smoothstep(TEAR_SIZE * 0.5, TEAR_SIZE, r);
  float a = atan(c.y, c.x);
  vec3 digital = mix(
    vec3(0.15, 0.9, 1.0),
    vec3(1.0, 0.1, 0.7),
    0.5 + 0.5 * sin(24.0 * a + time * 4.0)
  );
  col += digital * ring * 0.5;
  return col;
}

vec3 render(vec3 ro, vec3 rd, vec2 p) {
  float sun = clamp(dot(SUNDIR, rd), 0.0, 1.0);

  vec3 col = mix(
    vec3(0.32, 0.55, 0.85),
    vec3(0.78, 0.85, 0.92),
    pow(1.0 - clamp(rd.y, 0.0, 1.0), 6.0)
  );
  col += vec3(1.0, 0.75, 0.5) * 0.3 * pow(sun, 6.0);
  col += vec3(1.0, 0.9, 0.75) * 0.2 * pow(sun, 200.0);

  // Clouds fade toward the natural sky; the rift is painted behind them, so
  // the deck and the rising stream occlude the void and dissolve into it.
  vec4 clouds = raymarch(ro, rd, col);
  col = tear(col, p, u_time);
  col = col * (1.0 - clouds.a) + clouds.rgb;

  col += vec3(0.2, 0.12, 0.06) * pow(sun, 3.0);
  return col;
}

// Standard world-up look-at basis (right, up, forward) as matrix columns.
mat3 lookAt(vec3 ro, vec3 ta) {
  vec3 forward = normalize(ta - ro);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  return mat3(right, up, forward);
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

  // A gentle yaw keeps the sky alive; pitched slightly up so the cloud deck
  // sits low and the open sky fills the frame above it.
  float yaw = 0.06 * sin(6.28318 * u_time / CYCLE_SECONDS);
  vec3 ro = vec3(0.0, 0.0, 0.0);
  vec3 ta = vec3(sin(yaw), 0.35, cos(yaw));
  mat3 ca = lookAt(ro, ta);
  vec3 rd = ca * normalize(vec3(p, 1.5));

  vec3 col = render(ro, rd, p);

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(0.95)), 1.0);
}
