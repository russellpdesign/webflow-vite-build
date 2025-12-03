export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export const clamp = (min, max) => value =>
  value < min ? min : value > max ? max : value;

export function clamp01(n) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  const p = clamp01((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * p;
}
