// 2D stick-figure puppet v3: thick bean body, thin sticks, shading, physics-driven transforms, nervous acting.
export type Look = {
  skin: string; body: string; outfit?: "suit" | "leather" | "blazer" | "hoodie" | "shirt"; tie?: string; shirt?: string;
  hair?: "none" | "short" | "bob" | "swept" | "grey" | "flattop"; hairColor?: string; glasses?: boolean; badge?: string; hat?: string; shoe?: string;
  /** knitted beanie (colour) with a fold band (beanieBand) and a pom tuft (pom) - Remy */
  beanie?: string; beanieBand?: string; pom?: string;
  /** shirt collar points under the chin (colour) - Randy 1964 */
  collar?: string;
};
export type Arms = "down" | "up" | "hold" | "point" | "head" | "chest" | "box" | "shrug";
export type Pose = {
  t: number; walk?: number /* phase radians */; speed?: number /* 0..1 stride amplitude */; mood?: "grin" | "smile" | "shock" | "deadpan" | "worry" | "angry" | "laugh" | "gulp" | "tired" | "sleep" | "sick" | "dizzy";
  /** eyelid droop 0 (open) .. 1 (closed); eye bags 0..1; head nod 0..1 (head drops toward the chest, microsleep) */
  lids?: number; bags?: number; nod?: number;
  arms?: Arms; armK?: number; armR?: [number, number]; armL?: [number, number]; armRK?: number; armLK?: number; /* IK hand targets in puppet-height units: x from body centre (screen right +), y from feet up */ nerv?: number; sweat?: number; squash?: number; tilt?: number; lookX?: number; flip?: boolean; hunch?: number; air?: number;
};
export const INK = "#0b0d1a";
const sh = (c: CanvasRenderingContext2D, color: string, f: () => void) => { c.save(); f(); c.restore(); };
export function drawPuppet(c: CanvasRenderingContext2D, W: number, H: number, look: Look, p: Pose) {
  c.clearRect(0, 0, W, H); c.save();
  const S = W / 400, cx = W / 2, feetY = H * 0.983, nerv = p.nerv ?? 0;
  const sq = p.squash ?? 0, tilt = p.tilt ?? 0;
  if (p.flip) { c.translate(W, 0); c.scale(-1, 1); }
  // shiver: whole-body jitter
  const jx = nerv > 0.5 ? Math.sin(p.t * 2.9) * 1.6 * S * (nerv - 0.5) * 2 : 0, jy = 0;
  c.translate(cx + jx, feetY + jy); c.rotate(tilt); c.scale(1 - sq * 0.55, 1 + sq); c.translate(-cx, -feetY);
  c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = INK;
  const w = p.walk, amp = p.speed ?? 0, moving = w !== undefined && amp > 0;
  const breath = Math.sin(p.t * 0.12) * 0.012, hunch = p.hunch ?? 0;
  const bodyTopBase = H * 0.47, bodyH = H * 0.27 * (1 + breath), bodyW = W * 0.48;
  const bob = moving ? Math.abs(Math.sin(w!)) * 9 * S * amp : 0;
  const bodyTop = bodyTopBase - bob + hunch * 8 * S;
  const shoe = look.shoe ?? INK;
  // legs
  for (const s of [-1, 1]) {
    const ph = moving ? Math.sin(w! + (s > 0 ? Math.PI : 0)) : 0, lift = moving ? Math.max(0, Math.cos(w! + (s > 0 ? Math.PI : 0))) : 0;
    const sw = moving ? ph * 44 * S * amp : s * 12 * S + (p.air ? s * 14 * S : 0);
    const x0 = cx + s * 24 * S, y0 = bodyTop + bodyH - 8 * S, fy = feetY - 12 * S - (moving ? lift * 14 * S * amp : 0) - (p.air ?? 0) * 18 * S;
    c.lineWidth = 10 * S; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + sw * 0.2, (y0 + fy) / 2, x0 + sw, fy); c.stroke();
    c.fillStyle = shoe; c.lineWidth = 5 * S; c.beginPath(); c.ellipse(x0 + sw + 10 * S, fy + 6 * S, 21 * S, 10 * S, 0, 0, 7); c.fill(); c.stroke();
  }
  // arms
  const mode = p.arms ?? "down", ak = p.armK ?? 1;
  const hr = W * 0.275;
  const hyBase = bodyTop - hr * 0.5, hxBase = cx + hunch * 14 * S;
  for (const s of [-1, 1]) {
    const swing = moving ? Math.sin(w! + (s > 0 ? 0 : Math.PI)) * 30 * S * amp : 0;
    const sx = cx + s * bodyW * 0.46, sy = bodyTop + bodyH * 0.22;
    let ex = sx + s * 38 * S, ey = bodyTop + bodyH * 0.85 + swing * 0.3, bend = 12 * S;
    const tremble = nerv ? Math.sin(p.t * 3.1 + s) * 5 * S * nerv : 0;
    const target = (tx: number, ty: number) => { ex = ex + (tx - ex) * ak; ey = ey + (ty - ey) * ak; };
    if (mode === "up") target(sx + s * 20 * S, sy - 118 * S);
    if (mode === "head") { target(hxBase + s * hr * 0.98, hyBase + hr * 0.05); bend = 40 * S; }
    if (mode === "chest") target(cx + s * 14 * S, bodyTop + bodyH * 0.38);
    if (mode === "hold") target(cx + s * 30 * S, bodyTop + bodyH * 0.5);
    if (mode === "box") target(cx + s * 52 * S, bodyTop + bodyH * 0.6);
    if (mode === "shrug") target(sx + s * 52 * S, sy + 24 * S);
    if (mode === "point" && s > 0) target(sx + 120 * S, sy - 14 * S);
    const ik = s > 0 ? p.armR : p.armL, ikK = s > 0 ? (p.armRK ?? 1) : (p.armLK ?? 1);
    if (ik) { const tx = cx + ik[0] * H, ty = (0.983 - ik[1]) * H; ex = ex + (tx - ex) * ikK; ey = ey + (ty - ey) * ikK; bend = 14 * S; }
    ex += tremble; ey += tremble * 0.6;
    c.lineWidth = 9 * S; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo((sx + ex) / 2 + s * bend, (sy + ey) / 2 + 12 * S, ex, ey); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(ex, ey, 13 * S, 0, 7); c.fill();
  }
  // torso
  const torso = () => { c.beginPath(); c.moveTo(cx - bodyW / 2, bodyTop + 26 * S); c.quadraticCurveTo(cx - bodyW / 2 - 10 * S, bodyTop + bodyH * 0.9, cx, bodyTop + bodyH); c.quadraticCurveTo(cx + bodyW / 2 + 10 * S, bodyTop + bodyH * 0.9, cx + bodyW / 2, bodyTop + 26 * S); c.quadraticCurveTo(cx, bodyTop - 16 * S, cx - bodyW / 2, bodyTop + 26 * S); };
  c.lineWidth = 10 * S; c.fillStyle = look.body; torso(); c.fill();
  c.save(); torso(); c.clip();
  const o = look.outfit ?? "shirt"; c.lineWidth = 6 * S;
  if (o === "suit" || o === "blazer") {
    c.fillStyle = look.shirt ?? "#f4f4f4"; c.beginPath(); c.moveTo(cx - 28 * S, bodyTop - 4 * S); c.lineTo(cx + 28 * S, bodyTop - 4 * S); c.lineTo(cx, bodyTop + bodyH * 0.64); c.closePath(); c.fill(); c.stroke();
    if (look.tie && o === "suit") { const sway = Math.sin(p.t * 0.2) * 3 * S + (moving ? Math.sin(w!) * 5 * S : 0); c.fillStyle = look.tie; c.beginPath(); c.moveTo(cx, bodyTop + 8 * S); c.lineTo(cx + 14 * S, bodyTop + 34 * S); c.lineTo(cx + sway, bodyTop + bodyH * 0.74); c.lineTo(cx - 14 * S, bodyTop + 34 * S); c.closePath(); c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(cx - 40 * S, bodyTop - 6 * S); c.lineTo(cx, bodyTop + bodyH * 0.68); c.lineTo(cx + 40 * S, bodyTop - 6 * S); c.stroke();
    c.fillStyle = INK; for (const k of [0.8, 0.92]) { c.beginPath(); c.arc(cx, bodyTop + bodyH * k, 4.5 * S, 0, 7); c.fill(); }
    c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(cx - bodyW * 0.35, bodyTop + bodyH * 0.35, 18 * S, 6 * S); // pocket square
  } else if (o === "leather") {
    c.fillStyle = "#eceef5"; c.beginPath(); c.moveTo(cx - 30 * S, bodyTop - 4 * S); c.lineTo(cx + 30 * S, bodyTop - 4 * S); c.lineTo(cx, bodyTop + bodyH * 0.58); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#3a3d4a";
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 44 * S, bodyTop - 8 * S); c.lineTo(cx + s * 7 * S, bodyTop + 22 * S); c.lineTo(cx + s * 11 * S, bodyTop + bodyH + 6); c.lineTo(cx + s * bodyW, bodyTop + bodyH); c.closePath(); c.fill(); c.stroke(); }
    c.strokeStyle = "#9aa0b8"; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(cx - 8 * S, bodyTop + bodyH * 0.45); c.lineTo(cx - 12 * S, bodyTop + bodyH * 0.95); c.moveTo(cx + 8 * S, bodyTop + bodyH * 0.45); c.lineTo(cx + 12 * S, bodyTop + bodyH * 0.95); c.stroke();
    c.fillStyle = "rgba(255,255,255,.22)"; c.beginPath(); c.ellipse(cx - bodyW * 0.3, bodyTop + bodyH * 0.3, 10 * S, 28 * S, 0.3, 0, 7); c.fill(); // leather shine
  } else if (o === "hoodie") {
    c.fillStyle = "rgba(0,0,0,.18)"; c.beginPath(); c.ellipse(cx, bodyTop + 6 * S, 46 * S, 18 * S, 0, 0, 7); c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(cx - 12 * S, bodyTop + 16 * S); c.lineTo(cx - 12 * S, bodyTop + 70 * S); c.moveTo(cx + 12 * S, bodyTop + 16 * S); c.lineTo(cx + 12 * S, bodyTop + 70 * S); c.stroke();
  } else { c.fillStyle = "rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(cx - 34 * S, bodyTop + 44 * S, 14 * S, 42 * S, 0.2, 0, 7); c.fill(); c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(cx - 20 * S, bodyTop + bodyH * 0.8); c.quadraticCurveTo(cx, bodyTop + bodyH * 0.68, cx + 24 * S, bodyTop + bodyH * 0.8); c.stroke(); }
  // form shading (right side darker, bottom darker)
  const g = c.createLinearGradient(cx - bodyW / 2, 0, cx + bodyW / 2, 0); g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(0.55, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,20,.34)"); c.fillStyle = g; c.fillRect(cx - bodyW, bodyTop - 20, bodyW * 2, bodyH + 40);
  c.restore();
  c.lineWidth = 10 * S; torso(); c.stroke();
  if (look.badge) { const sw = Math.sin(p.t * 0.15) * 2 * S + (moving ? Math.sin(w!) * 4 * S : 0); c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 4 * S; c.fillRect(cx + 22 * S + sw, bodyTop + bodyH * 0.42, 36 * S, 46 * S); c.strokeRect(cx + 22 * S + sw, bodyTop + bodyH * 0.42, 36 * S, 46 * S); c.fillStyle = look.badge; c.fillRect(cx + 26 * S + sw, bodyTop + bodyH * 0.42 + 4 * S, 28 * S, 11 * S); c.fillStyle = "#99a"; c.fillRect(cx + 28 * S + sw, bodyTop + bodyH * 0.42 + 22 * S, 24 * S, 4 * S); c.fillRect(cx + 28 * S + sw, bodyTop + bodyH * 0.42 + 31 * S, 16 * S, 4 * S); }
  // head
  const nod = p.nod ?? 0;
  const hy = hyBase + Math.sin(p.t * 0.12) * 1.5 * S + (moving ? Math.sin((w ?? 0) * 2) * 3 * S * amp : 0) + nod * hr * 0.42, hx = hxBase;
  if (look.collar) { // collar points under the chin (drawn before the head so the chin overlaps them)
    const cy0 = hyBase + hr * 0.84; c.fillStyle = look.collar; c.strokeStyle = INK; c.lineWidth = 5 * S;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 4 * S, cy0 + 4 * S); c.lineTo(cx + s * 58 * S, cy0 - 8 * S); c.lineTo(cx + s * 40 * S, cy0 + 36 * S); c.closePath(); c.fill(); c.stroke(); }
  }
  const hc = look.hairColor ?? "#2a1a12", hair = look.hair ?? "none";
  c.lineWidth = 11 * S;
  if (hair === "bob") { c.fillStyle = hc; c.beginPath(); c.ellipse(hx, hy + hr * 0.18, hr * 1.05, hr * 1.12, 0, 0, 7); c.fill(); c.stroke(); }
  c.fillStyle = look.skin; c.beginPath(); c.arc(hx, hy, hair === "bob" ? hr * 0.88 : hr, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(hx, hy, hair === "bob" ? hr * 0.88 : hr, 0, 7); c.clip();
  const hg = c.createRadialGradient(hx - hr * 0.35, hy - hr * 0.35, hr * 0.1, hx, hy, hr * 1.1); hg.addColorStop(0, "rgba(255,255,255,.28)"); hg.addColorStop(0.6, "rgba(0,0,0,0)"); hg.addColorStop(1, "rgba(60,20,0,.25)"); c.fillStyle = hg; c.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
  if (nerv > 0.2 || p.mood === "shock" || p.mood === "worry") { c.fillStyle = `rgba(255,90,90,${0.18 + nerv * 0.2})`; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hx + s * hr * 0.55, hy + hr * 0.3, hr * 0.2, hr * 0.12, 0, 0, 7); c.fill(); } }
  c.restore(); c.strokeStyle = INK; c.lineWidth = 11 * S; c.beginPath(); c.arc(hx, hy, hair === "bob" ? hr * 0.88 : hr, 0, 7); c.stroke();
  if (hair === "flattop") {
    c.fillStyle = hc; c.lineWidth = 8 * S; c.beginPath(); c.moveTo(hx - hr * 0.97, hy - hr * 0.2); c.lineTo(hx - hr * 0.9, hy - hr * 1.16); c.lineTo(hx + hr * 0.9, hy - hr * 1.16);
    c.lineTo(hx + hr * 0.97, hy - hr * 0.2); c.quadraticCurveTo(hx + hr * 0.6, hy - hr * 0.62, hx, hy - hr * 0.6); c.quadraticCurveTo(hx - hr * 0.6, hy - hr * 0.62, hx - hr * 0.97, hy - hr * 0.2); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.22)"; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(hx - hr * 0.7, hy - hr * 1.02); c.lineTo(hx + hr * 0.5, hy - hr * 1.02); c.stroke(); c.strokeStyle = INK;
  } else if (hair !== "none" && hair !== "bob") {
    c.fillStyle = hair === "grey" ? "#a9aab4" : hc; c.lineWidth = 8 * S; c.beginPath(); c.arc(hx, hy, hr - 4 * S, Math.PI * 1.04, Math.PI * 1.96);
    if (hair === "swept") c.quadraticCurveTo(hx + hr * 0.35, hy - hr * 0.7, hx - hr * 0.95, hy - hr * 0.18); else c.quadraticCurveTo(hx, hy - hr * 0.3, hx - hr * 0.95, hy - hr * 0.3);
    c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 4 * S; c.beginPath(); c.arc(hx, hy, hr * 0.78, Math.PI * 1.2, Math.PI * 1.45); c.stroke(); c.strokeStyle = INK;
  }
  if (hair === "bob") { c.fillStyle = hc; c.lineWidth = 7 * S; c.beginPath(); c.arc(hx, hy - hr * 0.1, hr * 0.85, Math.PI * 1.03, Math.PI * 1.97); c.quadraticCurveTo(hx, hy - hr * 0.4, hx - hr * 0.82, hy - hr * 0.1); c.fill(); }
  // face
  c.lineWidth = 6 * S; c.strokeStyle = INK; const m = p.mood ?? "smile";
  const blink = (p.t % 100) > 96, eyeY = hy + hr * 0.03, ex0 = hx - hr * 0.38, ex1 = hx + hr * 0.38;
  const dartX = (nerv ? Math.sin(p.t * 0.33) * 6 * S * nerv : 0) + (p.lookX ?? 0) * 7 * S;
  const lids = Math.min(1, (p.lids ?? 0) + (m === "tired" ? 0.5 : 0) + nod * 0.7);
  const eye = (ex: number) => {
    if (m === "sleep" || lids >= 0.95) { c.beginPath(); c.arc(ex, eyeY - 4 * S, 14 * S, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); return; }
    if (m === "dizzy") { c.beginPath(); for (let k = 0; k <= 30; k++) { const a = k * 0.62 + p.t * 0.4, r = 1.5 * S + k * 0.55 * S; const px = ex + Math.cos(a) * r, py = eyeY + Math.sin(a) * r; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); return; }
    if (m === "grin" || m === "laugh") { c.beginPath(); c.arc(ex, eyeY + 9 * S, 16 * S, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); return; }
    if (blink) { c.beginPath(); c.moveTo(ex - 14 * S, eyeY); c.lineTo(ex + 14 * S, eyeY); c.stroke(); return; }
    const r = m === "shock" ? 23 * S : 14.5 * S; c.fillStyle = "#fff"; c.beginPath(); c.arc(ex, eyeY, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(ex + dartX, eyeY + 1, m === "shock" ? 4.5 * S : 5.8 * S, 0, 7); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(ex + dartX - 1.5 * S, eyeY - 1.5 * S, 1.6 * S, 0, 7); c.fill();
    if (lids > 0.02) { // heavy upper lid (skin) sliding down over the eye
      const lr = r + 3 * S, ly = eyeY - lr + lids * lr * 2;
      c.save(); c.beginPath(); c.arc(ex, eyeY, lr, 0, 7); c.clip(); c.fillStyle = look.skin; c.fillRect(ex - lr, eyeY - lr - 2, lr * 2, ly - (eyeY - lr) + 2); c.restore();
      c.beginPath(); c.moveTo(ex - r, Math.min(eyeY + r, ly)); c.lineTo(ex + r, Math.min(eyeY + r, ly)); c.stroke();
      c.beginPath(); c.arc(ex, eyeY, r, 0, 7); c.stroke();
    }
  };
  eye(ex0); eye(ex1);
  const bags = Math.max(p.bags ?? 0, m === "tired" ? 0.6 : 0);
  if (bags > 0) { c.save(); c.strokeStyle = `rgba(110,60,120,${0.35 + 0.5 * bags})`; c.lineWidth = 4 * S; for (const ex of [ex0, ex1]) { c.beginPath(); c.arc(ex, eyeY + 8 * S, 15 * S, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); } c.restore(); c.strokeStyle = INK; c.lineWidth = 6 * S; }
  if (m === "sick") { c.save(); c.beginPath(); c.arc(hx, hy, hr, 0, 7); c.clip(); c.fillStyle = "rgba(140,190,90,.22)"; c.fillRect(hx - hr, hy - hr * 0.2, hr * 2, hr * 1.3); c.restore(); }
  c.lineWidth = 6 * S; c.strokeStyle = INK; c.beginPath();
  if (m === "angry") { c.moveTo(ex0 - 20 * S, eyeY - 32 * S); c.lineTo(ex0 + 16 * S, eyeY - 17 * S); c.moveTo(ex1 + 20 * S, eyeY - 32 * S); c.lineTo(ex1 - 16 * S, eyeY - 17 * S); }
  else if (m === "sick" || m === "dizzy") { c.moveTo(ex0 - 16 * S, eyeY - 18 * S); c.lineTo(ex0 + 16 * S, eyeY - 30 * S); c.moveTo(ex1 + 16 * S, eyeY - 18 * S); c.lineTo(ex1 - 16 * S, eyeY - 30 * S); }
  else if (m === "tired") { c.moveTo(ex0 - 16 * S, eyeY - 22 * S); c.lineTo(ex0 + 16 * S, eyeY - 26 * S); c.moveTo(ex1 - 16 * S, eyeY - 26 * S); c.lineTo(ex1 + 16 * S, eyeY - 22 * S); }
  else if (m === "worry" || m === "gulp") { const tw = nerv ? Math.sin(p.t * 0.7) * 3 * S : 0; c.moveTo(ex0 - 16 * S, eyeY - 16 * S + tw); c.lineTo(ex0 + 16 * S, eyeY - 32 * S); c.moveTo(ex1 + 16 * S, eyeY - 16 * S - tw); c.lineTo(ex1 - 16 * S, eyeY - 32 * S); }
  else if (m === "shock") { c.moveTo(ex0 - 16 * S, eyeY - 40 * S); c.lineTo(ex0 + 16 * S, eyeY - 40 * S); c.moveTo(ex1 - 16 * S, eyeY - 40 * S); c.lineTo(ex1 + 16 * S, eyeY - 40 * S); }
  else if (m === "deadpan") { c.moveTo(ex0 - 16 * S, eyeY - 26 * S); c.lineTo(ex0 + 16 * S, eyeY - 22 * S); c.moveTo(ex1 - 16 * S, eyeY - 22 * S); c.lineTo(ex1 + 16 * S, eyeY - 26 * S); }
  c.stroke();
  const my = hy + hr * 0.46; c.beginPath();
  if (m === "grin" || m === "laugh") { c.fillStyle = "#fff"; c.roundRect(hx - 34 * S, my - 12 * S, 68 * S, m === "laugh" ? 46 * S : 30 * S, 9 * S); c.fill(); c.stroke(); c.lineWidth = 3 * S; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(hx + i * 13 * S, my - 12 * S); c.lineTo(hx + i * 13 * S, my + 18 * S); c.stroke(); } }
  else if (m === "shock") { c.fillStyle = "#3a1020"; c.ellipse(hx, my + 8 * S, 13 * S, 21 * S, 0, 0, 7); c.fill(); c.stroke(); }
  else if (m === "worry" || m === "gulp") { const wob = nerv ? Math.sin(p.t * 1.9) * 3 * S : 0; c.moveTo(hx - 26 * S, my + 12 * S); c.quadraticCurveTo(hx, my - 6 * S + wob, hx + 26 * S, my + 12 * S); c.stroke(); }
  else if (m === "angry") { c.moveTo(hx - 26 * S, my + 14 * S); c.quadraticCurveTo(hx, my - 8 * S, hx + 26 * S, my + 14 * S); c.stroke(); }
  else if (m === "deadpan" || m === "tired") { c.moveTo(hx - 20 * S, my + 4 * S); c.lineTo(hx + 20 * S, my + (m === "tired" ? 8 : 4) * S); c.stroke(); }
  else if (m === "sick" || m === "dizzy") { c.moveTo(hx - 28 * S, my + 8 * S); for (let k = 1; k <= 8; k++) c.lineTo(hx - 28 * S + k * 7 * S, my + 8 * S + (k % 2 ? -6 : 6) * S + (m === "dizzy" ? Math.sin(p.t * 0.3) * 2 * S : 0)); c.stroke(); }
  else if (m === "sleep") { c.ellipse(hx, my + 6 * S, 9 * S, 7 * S + Math.sin(p.t * 0.1) * 2 * S, 0, 0, 7); c.stroke(); }
  else { c.arc(hx, my - 14 * S, 30 * S, 0.35, Math.PI - 0.35); c.stroke(); }
  if (look.glasses) { c.lineWidth = 6 * S; c.fillStyle = "rgba(190,225,255,.28)"; for (const ex of [ex0, ex1]) { c.beginPath(); c.arc(ex, eyeY, 28 * S, 0, 7); c.fill(); c.stroke(); } c.beginPath(); c.moveTo(ex0 + 28 * S, eyeY); c.lineTo(ex1 - 28 * S, eyeY); c.stroke(); }
  // sweat: drops sliding down the face + flung drops
  const sw = p.sweat ?? 0;
  if (sw > 0) {
    c.fillStyle = "#9bdcff"; c.strokeStyle = "#3f8fc4"; c.lineWidth = 3 * S;
    for (let k = 0; k < 3; k++) {
      const u = ((p.t * 0.035 + k / 3) % 1), x = hx + hr * (0.7 + 0.1 * k) * (k % 2 ? -1 : 1), y = hy - hr * 0.6 + u * hr * 1.4, r = (1 - u * 0.5) * 11 * S * sw;
      c.beginPath(); c.moveTo(x, y - r * 1.6); c.quadraticCurveTo(x + r, y, x, y + r * 0.6); c.quadraticCurveTo(x - r, y, x, y - r * 1.6); c.fill(); c.stroke();
    }
    if (sw > 0.6) for (let k = 0; k < 2; k++) { const u = ((p.t * 0.06 + k * 0.5) % 1), dir = k ? -1 : 1, x = hx + dir * (hr + u * 70 * S), y = hy - hr * 0.5 - Math.sin(u * Math.PI) * 40 * S + u * u * 60 * S; c.globalAlpha = 1 - u; c.beginPath(); c.arc(x, y, 6 * S, 0, 7); c.fill(); c.globalAlpha = 1; }
  }
  if (look.beanie) { // knitted beanie: dome + fold band + pom tuft
    const by = hy - hr * 0.28, pb = Math.sin(p.t * 0.14) * 2 * S;
    c.fillStyle = look.beanie; c.lineWidth = 8 * S; c.beginPath(); c.moveTo(hx - hr * 1.0, by); c.bezierCurveTo(hx - hr * 1.0, hy - hr * 1.45, hx + hr * 1.0, hy - hr * 1.45, hx + hr * 1.0, by); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 3 * S; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(hx + k * hr * 0.26, by - 4 * S); c.quadraticCurveTo(hx + k * hr * 0.2, hy - hr * 0.9, hx + k * hr * 0.12, hy - hr * 1.02); c.stroke(); }
    c.strokeStyle = INK; c.fillStyle = look.beanieBand ?? look.beanie; c.lineWidth = 7 * S; c.beginPath(); c.roundRect(hx - hr * 1.06, by - hr * 0.08, hr * 2.12, hr * 0.32, 8 * S); c.fill(); c.stroke();
    c.fillStyle = look.pom ?? look.beanieBand ?? "#fff"; c.lineWidth = 6 * S; c.beginPath(); c.arc(hx + pb, hy - hr * 1.12, hr * 0.17, 0, 7); c.fill(); c.stroke();
  }
  if (look.hat) { c.fillStyle = look.hat; c.lineWidth = 8 * S; c.beginPath(); c.ellipse(hx, hy - hr * 0.8, hr * 0.95, hr * 0.28, 0, Math.PI, 0); c.fill(); c.stroke(); }
  c.restore();
}
