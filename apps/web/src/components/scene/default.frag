// Volumetric clouds drifting low across a naturalistic daytime sky.
// A raymarched fbm density field, adapted for WebGL1 (GLSL ES 1.00) from
// Inigo Quilez's "Clouds" (https://www.shadertoy.com/view/XslGRr) — the
// texture-based noise is replaced with a self-contained procedural hash so
// the scene needs no asset loading.

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
const vec3 WIND = vec3(0.006, 0.0, -0.08);
// Sample the noise away from its origin, where the hash clusters into a dense
// blob — otherwise the deck loads as fog before the wind scrolls past it.
const vec3 CLOUD_ORIGIN = vec3(17.0, 6.0, 11.0);
const vec3 SUNDIR = normalize(vec3(0.7, 0.2, -0.45));
const float CYCLE_SECONDS = 256.0;

// Rotation between fbm octaves to keep the noise from lining up on the axes.
const mat3 M = mat3(
  0.00, 0.80, 0.60,
  -0.80, 0.36, -0.48,
  -0.60, -0.48, 0.64
);

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

float fbm(vec3 p) {
  float f = 0.5000 * noise(p);
  p = M * p * 2.02;
  f += 0.2500 * noise(p);
  p = M * p * 2.03;
  f += 0.1250 * noise(p);
  p = M * p * 2.01;
  f += 0.0625 * noise(p);
  return f;
}

// Cloud density: an fbm slab that thins out with height, so it reads as a deck
// of broken cloud rather than fog.
float cloud(vec3 p) {
  vec3 q = p * 1.3 - WIND * u_time + CLOUD_ORIGIN;
  return clamp(2.8 * fbm(q) - 1.7 - 2.2 * p.y, 0.0, 1.0);
}

// A two-octave estimate of the same field, used only for the sun-light sample
// where fine detail is invisible — half the noise cost of a full lookup.
float cloudLight(vec3 p) {
  vec3 q = p * 1.3 - WIND * u_time + CLOUD_ORIGIN;
  float f = 0.5 * noise(q);
  q = M * q * 2.02;
  f += 0.25 * noise(q);
  return clamp(2.8 * (f * 1.25) - 1.7 - 2.2 * p.y, 0.0, 1.0);
}

// Front-to-back raymarch through the deck, lighting each sample by how much
// denser it is toward the sun (self-shadowing) and fading it into the sky with
// distance (aerial perspective). The deck only occupies a low slab, so rays are
// dropped once they climb out of it (SLAB_TOP) or sink through the floor, empty
// space is skipped in coarse steps, and only cloud interiors are sampled finely.
vec4 raymarch(vec3 ro, vec3 rd, vec3 sky) {
  vec4 sum = vec4(0.0);
  float t = 0.04 * hash21(gl_FragCoord.xy);

  for (int i = 0; i < 110; i++) {
    vec3 pos = ro + t * rd;

    if (pos.y < -2.0 || pos.y > 0.6 || t > 32.0 || sum.a > 0.99) {
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

vec3 render(vec3 ro, vec3 rd) {
  float sun = clamp(dot(SUNDIR, rd), 0.0, 1.0);

  vec3 col = mix(
    vec3(0.32, 0.55, 0.85),
    vec3(0.78, 0.85, 0.92),
    pow(1.0 - clamp(rd.y, 0.0, 1.0), 6.0)
  );
  col += vec3(1.0, 0.75, 0.5) * 0.3 * pow(sun, 6.0);
  col += vec3(1.0, 0.9, 0.75) * 0.2 * pow(sun, 200.0);

  vec4 clouds = raymarch(ro, rd, col);
  col = col * (1.0 - clouds.a) + clouds.rgb;

  col += vec3(0.2, 0.12, 0.06) * pow(sun, 3.0);
  return col;
}

mat3 setCamera(vec3 ro, vec3 ta) {
  vec3 cw = normalize(ta - ro);
  vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

  // A gentle yaw keeps the sky alive; pitched slightly up so the cloud deck
  // sits low and the open sky fills the frame above it.
  float yaw = 0.06 * sin(6.28318 * u_time / CYCLE_SECONDS);
  vec3 ro = vec3(0.0, 0.0, 0.0);
  vec3 ta = vec3(sin(yaw), 0.35, cos(yaw));
  mat3 ca = setCamera(ro, ta);
  vec3 rd = ca * normalize(vec3(p, 1.5));

  vec3 col = render(ro, rd);

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(0.95)), 1.0);
}
