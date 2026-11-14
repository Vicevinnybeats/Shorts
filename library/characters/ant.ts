// Library character: ant (side view), drawn with the skill's Pen in its card style (plum ink, flat fills,
// one-step shade, dot-ink eyes on a light face patch). Canvas 1000x600, facing right, feet on y = 575.
import { Pen, INK } from "../../src/vendor/bridge/toon";

export type AntExpr = "neutral" | "determined" | "shock" | "dazed" | "happy" | "strain" | "curious";
export type AntPose = {
  expr: AntExpr; phase: number;          // walk phase in radians (legs), 0 when standing
  stride?: number;                       // 0..1 leg swing amount
  blink?: boolean; flat?: boolean;       // flat = knocked over on its back
  trail?: boolean;                       // gaster tip lowered to the floor (laying pheromone)
  sniff?: number;                        // antenna raise 0..1
  body?: string; head?: string; face?: string;
};

type P2 = [number, number];
const ell = (p: Pen, x: number, y: number, rx: number, ry: number, fill: string, ol = 11, rot = 0) => p.ell(x, y, rx, ry, fill, ol, 0, 360, rot);

export const drawAnt = (p: Pen, g: CanvasRenderingContext2D, o: AntPose) => {
  const body = o.body ?? "#6a3424", hi = "#93503a", head = o.head ?? "#71392a", face = o.face ?? "#f3caa2";
  const st = o.stride ?? 1;
  g.save();
  p.ol = 6; // limb ink rim (Pen.line adds 1.8 x ol around the limb)
  if (o.flat) { g.translate(500, 330); g.rotate(Math.PI); g.translate(-500, -300); }

  // ---- legs (behind the body: far side darker) ----
  const hips: P2[] = [[455, 385], [515, 392], [575, 385]];
  const legDraw = (far: boolean) => hips.forEach(([hx, hy], k) => {
    const ph = o.phase + k * 2.1 + (far ? Math.PI : 0);
    const swing = Math.sin(ph) * 46 * st, lift = Math.max(0, Math.cos(ph)) * 22 * st;
    const spread = (k - 1) * 95;
    const foot: P2 = [hx + spread + swing + (far ? -12 : 0), 572 - lift];
    const knee: P2 = [hx + spread * 0.55 + swing * 0.5 + (k === 0 ? -30 : 30), hy - 40 - lift * 0.4];
    p.line([[hx, hy], knee, foot], far ? "#3a1c16" : INK, far ? 13 : 15);
    p.dot(foot[0], foot[1], far ? 9 : 11, INK);
  });
  legDraw(true);

  // ---- gaster (abdomen), petiole, thorax ----
  const gy = o.trail ? 420 : 330, gr = o.trail ? -0.55 : -0.12;
  ell(p, 245, gy, 168, 118, body, 12, gr * 57.3);
  ell(p, 205, gy - 40, 70, 34, hi, 0, gr * 57.3);               // one-step highlight toward the light (upper left)
  for (let i = 0; i < 3; i++) p.arc(245 + (i - 1) * 55, gy, 22, 100, -70, 70, 6, "#3a1c16");  // segment bands
  ell(p, 405, 345, 42, 46, body, 11);                      // petiole node
  ell(p, 520, 330, 115, 72, body, 12, -5);              // thorax
  ell(p, 495, 300, 50, 22, hi, 0, -5);
  legDraw(false);

  // ---- head (bean, big: the cartoon read) ----
  const hx = 715, hy = 255;
  ell(p, hx, hy, 150, 132, head, 13, -7);
  ell(p, hx + 52, hy + 14, 92, 88, face, 0, -6);         // face patch so ink eyes read on a dark ant
  // mandibles
  p.poly([[hx + 120, hy + 70], [hx + 175, hy + 95], [hx + 140, hy + 108], [hx + 108, hy + 92]], head, 9);
  // antennae: elbowed, ink-dot tips
  const up = (o.sniff ?? 0) * 40;
  const ant = (dx: number, far: boolean) => {
    const base: P2 = [hx + 40 + dx, hy - 110];
    const elbow: P2 = [hx + 95 + dx, hy - 205 - up];
    const tip: P2 = [hx + 205 + dx * 0.6, hy - 165 - up * 1.6];
    p.line([base, elbow, tip], far ? "#3a1c16" : INK, far ? 10 : 12);
    p.dot(tip[0], tip[1], far ? 12 : 15, far ? "#3a1c16" : INK);
  };
  ant(-30, true); ant(0, false);

  // ---- face ----
  const ex = hx + 62, ey = hy - 8, u = 2.2;
  const blink = o.blink && o.expr !== "dazed" && o.expr !== "happy";
  const browL = (dy0: number, dy1: number) => p.stroke([[ex - 30, ey - 46 + dy0], [ex + 24, ey - 50 + dy1]], 9);
  if (blink) p.stroke([[ex - 16, ey], [ex + 16, ey]], 9);
  else switch (o.expr) {
    case "shock": p.ell(ex, ey, 15, 21, "#fffaf2", 8); p.dot(ex + 3, ey + 2, 7); browL(-14, -18); break;
    case "dazed": for (let r = 4; r < 20; r += 6) p.arc(ex, ey, r, r, 0, 300, 5, INK); break;
    case "happy": p.arc(ex, ey + 6, 15, 12, 200, 340, 9, INK); break;
    case "strain": p.stroke([[ex - 16, ey - 8], [ex + 14, ey], [ex - 16, ey + 8]], 8); browL(10, 2); break;
    case "determined": p.ell(ex + 4, ey + 2, 3.8 * u, 5.5 * u, INK, 0); browL(14, -2); break;
    case "curious": p.ell(ex + 6, ey - 2, 4.2 * u, 6.2 * u, INK, 0); browL(-6, -12); break;
    default: p.ell(ex + 4, ey + 2, 3.8 * u, 5.5 * u, INK, 0); browL(0, -4);
  }
  const mx = hx + 95, my = hy + 48;
  switch (o.expr) {
    case "shock": p.ell(mx, my + 4, 13, 17, "#3a1520", 7); break;
    case "dazed": p.stroke([[mx - 18, my], [mx - 6, my - 6], [mx + 6, my + 4], [mx + 18, my - 2]], 7); break;
    case "happy": p.arc(mx, my - 8, 24, 18, 20, 160, 8, INK); break;
    case "strain": p.poly([[mx - 20, my - 6], [mx + 20, my - 6], [mx + 18, my + 8], [mx - 18, my + 8]], "#fffaf2", 7); break;
    case "determined": p.stroke([[mx - 16, my + 2], [mx + 16, my - 3]], 8); break;
    case "curious": p.ell(mx + 2, my, 7, 8, "#3a1520", 6); break;
    default: p.arc(mx, my - 6, 16, 10, 30, 150, 7, INK);
  }
  g.restore();
};

/** cache key: quantise the walk phase to 12 steps so a 30 fps walk reuses ~12 drawings */
export const antKey = (o: AntPose) =>
  [o.expr, Math.round((((o.phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 6)) % 12,
    (o.stride ?? 1).toFixed(1), o.blink ? 1 : 0, o.flat ? 1 : 0, o.trail ? 1 : 0, (o.sniff ?? 0).toFixed(1), o.body ?? ""].join("|");
