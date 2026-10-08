/** Coordinates are pixels; y=0 is the floor and negative y is above it. */
export interface ByteBody { x: number; y: number; vx: number; vy: number; bounced: boolean }
export interface ByteBounds { left: number; right: number; ceiling: number }
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));

export function advanceBody(body: ByteBody, bounds: ByteBounds, seconds: number) {
  const dt = clamp(seconds, 0, .05);
  const next = { ...body };
  const gravity = 1600;
  next.x += next.vx * dt;
  next.y += next.vy * dt + gravity * dt * dt / 2;
  next.vy = Math.min(1500, next.vy + gravity * dt);
  if (next.x < bounds.left || next.x > bounds.right) {
    next.x = clamp(next.x, bounds.left, bounds.right);
    next.vx *= -.22;
  }
  if (next.y < bounds.ceiling) { next.y = bounds.ceiling; next.vy = Math.max(0, next.vy); }
  let impact = false;
  if (next.y >= 0) {
    next.y = 0;
    impact = !next.bounced;
    if (!next.bounced && next.vy > 140) { next.vy *= -.16; next.bounced = true; }
    else { next.vy = 0; next.bounced = true; }
    next.vx *= Math.exp(-12 * dt);
  } else next.vx *= Math.exp(-.8 * dt);
  const settled = next.y === 0 && next.vy === 0 && Math.abs(next.vx) < 12;
  if (settled) next.vx = 0;
  return { body: next, impact, settled };
}
