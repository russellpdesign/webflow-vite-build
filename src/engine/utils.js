export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}