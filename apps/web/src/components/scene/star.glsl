// Shared chunk: prepended to every fragment shader that needs the star, so the
// shape has a single definition. It carries the precision block, which is why
// the shaders that consume it do not declare their own.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// The four-pointed star at the heart of the rift. Half-extent in screen units
// (y spans +/-1), and an exponent below 1 that pulls the edges concave: 1.0
// would be a plain diamond, lower values sharpen the points.
const vec2 STAR_RADIUS = vec2(0.30, 0.44);
const float STAR_SHARPNESS = 0.64;

// Negative inside the star, positive outside, scaled back to roughly screen
// units so callers can use the same soft-edge thresholds as everything else.
float starField(vec2 p) {
  vec2 q = max(abs(p) / STAR_RADIUS, 1e-6);
  return (pow(q.x, STAR_SHARPNESS) + pow(q.y, STAR_SHARPNESS) - 1.0) *
         STAR_RADIUS.x;
}
