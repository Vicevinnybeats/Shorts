// Camera language from the skill's motion report: smootherstep glides, holds that always creep,
// flip-sign impact kicks that decay over 7 frames, gentle rolls. All positions in world units.
export type V3 = [number, number, number];
export type CamState = { pos: V3; look: V3; fov: number; roll?: number };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoother = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Glide between two camera states with smootherstep over local time u (0..1). */
export const glide = (a: CamState, b: CamState, u: number, ease = smoother): CamState => {
  const t = ease(u);
  return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll ?? 0, b.roll ?? 0, t) };
};

/** Slow push-in during a hold: narrows the lens by `pct` per frame (0.25 % default, x0.6, capped at 22 %), so the
 *  framing tightens on the look point whatever its distance (the camera itself does not travel). */
export const creep = (c: CamState, frames: number, pct = 0.0025): CamState => ({ ...c, fov: c.fov * (1 - Math.min(0.22, frames * pct * 0.6)) });

/** Impact shake: sign flips every frame, decays over 7 frames. Returns an offset in units. */
export const kick = (framesSince: number, amp: number): number => {
  if (framesSince < 0 || framesSince > 7) return 0;
  return amp * (framesSince % 2 ? -1 : 1) * (1 - framesSince / 8);
};
