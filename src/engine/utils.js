export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export const clamp = (min, max) => value =>
  value < min ? min : value > max ? max : value;

export const clamp01 = clamp(0, 1);

export const mapRange = (inMin, inMax, outMin, outMax) => value => {
  const v = (value - inMin) / (inMax - inMin);
  return outMin + (clamp01(v) * (outMax - outMin));
};
