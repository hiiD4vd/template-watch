export function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function mapRange(
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
) {
  return (
    outputStart +
    ((value - inputStart) * (outputEnd - outputStart)) / (inputEnd - inputStart)
  );
}

export function lerp(start: number, end: number, progress: number) {
  return (1 - progress) * start + progress * end;
}

export function damp(
  current: number,
  target: number,
  smoothing: number,
  deltaTime: number,
) {
  return lerp(current, target, 1 - Math.exp(-smoothing * deltaTime));
}
