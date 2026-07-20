// Recreates the landing page background. The CSS stacks two identical
// `Root::before` aurora gradients with `mix-blend-mode: color-dodge` — the
// outer one composites over a transparent backdrop, so the visible result is
// the aurora radial gradient color-dodged over itself. The pool gradient in
// the CSS sits beneath the opaque aurora layer and never shows.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// One `drift` keyframe: the aurora ellipse in viewport fractions (CSS
// percentages / 100, y pointing down) and its palette in sRGB.
struct Aurora {
  vec2 center;
  vec2 radius;
  vec3 violet;
  vec3 magenta;
  vec3 indigo;
  vec3 mist;
};

// Seconds per pass through the keyframes, as in `animation: drift 48s`.
const float DURATION = 48.0;

float linstep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

// Approximates the CSS `ease-in-out` timing function.
float easeInOut(float t) {
  return t * t * (3.0 - 2.0 * t);
}

Aurora blend(Aurora source, Aurora target, float t) {
  return Aurora(
    mix(source.center, target.center, t),
    mix(source.radius, target.radius, t),
    mix(source.violet, target.violet, t),
    mix(source.magenta, target.magenta, t),
    mix(source.indigo, target.indigo, t),
    mix(source.mist, target.mist, t)
  );
}

// Plays back the `drift` keyframes: ease-in-out between each pair,
// alternating direction every pass.
Aurora drift(float time) {
  Aurora from = Aurora(
    vec2(0.0, 0.0),
    vec2(1.4, 1.4),
    vec3(61.0, 27.0, 109.0) / 255.0,
    vec3(228.0, 56.0, 220.0) / 255.0,
    vec3(64.0, 75.0, 140.0) / 255.0,
    vec3(121.0, 172.0, 187.0) / 255.0
  );

  Aurora third = Aurora(
    vec2(0.12, 0.08),
    vec2(1.65, 1.2),
    vec3(74.0, 26.0, 134.0) / 255.0,
    vec3(255.0, 47.0, 146.0) / 255.0,
    vec3(61.0, 91.0, 176.0) / 255.0,
    vec3(77.0, 215.0, 232.0) / 255.0
  );

  Aurora twoThirds = Aurora(
    vec2(0.04, 0.18),
    vec2(1.2, 1.7),
    vec3(51.0, 32.0, 110.0) / 255.0,
    vec3(196.0, 51.0, 255.0) / 255.0,
    vec3(74.0, 63.0, 158.0) / 255.0,
    vec3(98.0, 184.0, 217.0) / 255.0
  );

  Aurora to = Aurora(
    vec2(0.16, 0.04),
    vec2(1.5, 1.35),
    vec3(61.0, 27.0, 109.0) / 255.0,
    vec3(240.0, 56.0, 200.0) / 255.0,
    vec3(64.0, 75.0, 140.0) / 255.0,
    vec3(121.0, 172.0, 187.0) / 255.0
  );

  float cycle = mod(time / DURATION, 2.0);
  float progress = cycle < 1.0 ? cycle : 2.0 - cycle;

  if (progress < 0.33) {
    return blend(from, third, easeInOut(progress / 0.33));
  }

  if (progress < 0.66) {
    return blend(third, twoThirds, easeInOut((progress - 0.33) / 0.33));
  }

  return blend(twoThirds, to, easeInOut((progress - 0.66) / 0.34));
}

// The aurora radial gradient, with the color stops from the CSS:
// violet 30%, magenta 65%, indigo 80%, mist 110%.
vec3 gradient(Aurora aurora, vec2 point) {
  float t = length((point - aurora.center) / aurora.radius);

  vec3 color = mix(aurora.violet, aurora.magenta, linstep(0.3, 0.65, t));
  color = mix(color, aurora.indigo, linstep(0.65, 0.8, t));

  return mix(color, aurora.mist, linstep(0.8, 1.1, t));
}

vec3 colorDodge(vec3 backdrop, vec3 source) {
  return min(vec3(1.0), backdrop / max(1.0 - source, 1e-4));
}

void main() {
  // CSS coordinates: origin top left, y pointing down.
  vec2 point = gl_FragCoord.xy / u_resolution;
  point.y = 1.0 - point.y;

  Aurora aurora = drift(u_time);
  vec3 color = gradient(aurora, point);

  gl_FragColor = vec4(colorDodge(color, color), 1.0);
}
