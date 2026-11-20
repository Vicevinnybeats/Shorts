// Library (2.5D): episode "gta-army" (re-enlist for a 4-day pass + temptation bundling). A GENERIC military
// career-counselor office (beige wall, olive wainscot, window with blinds, corkboard with blank forms, filing cabinet,
// potted plant, big wall calendar, ticking clock): NO real insignia, logos, flags or unit badges anywhere.
// Props: steel desk (front), contract with a signature that draws on, pen, golden "4 DAY PASS" card, wall calendar with
// a red circle drawing around one date, olive uniform looks (SOLDIER_LOOK / COUNSELOR_LOOK + CamoShirt blobs + PatrolCap),
// Headphones for a Person, a sunrise park path with horizontal parallax scroll (ParkPath), a university gym backdrop
// (Gym) + side-view Treadmill with a moving belt, and an old-school audio player (Audiobook) with a padlock pop.
import React from "react";
import { INK, Look, Pose } from "../characters25/person";
import { CachedSvg } from "../../src/engine25/cached";
import { CAST } from "../style/channel";
import { PersonPart } from "./livingroom";

export const ARMY = {
  wall: "#e9dcbf", wall2: "#dfd0ae", ceiling: "#f4ecd9", wainscot: "#7d8455", wainscot2: "#6b7246", rail: "#5d6440",
  floor: "#8c8668", floor2: "#7d7759", skirting: "#4f5536",
  sky: "#bfe0f2", sky2: "#d9eef8", treeFar: "#8fbf86", blinds: "#f1ead8", blinds2: "#cfc6ad",
  cork: "#c8955a", cork2: "#b07d45", frame: "#7a5434", paper: "#fbf8f0", paperLine: "#c9c3b4", pinR: "#e8443a", pinB: "#2e7bd8", sticky: "#ffd93b",
  steel: "#8f9a82", steel2: "#76806a", steel3: "#a9b39b", handle: "#d8dccf",
  desk: "#6f7a5a", desk2: "#5a6447", deskTop: "#c8b48a", deskTop2: "#a8946a",
  pot: "#c4573f", pot2: "#9e4130", leaf: "#5aa354", leaf2: "#3f8445",
  olive: "#6f7d43", olive2: "#56633a", oliveDark: "#47522c", khaki: "#a99a6a", trousers: "#5f6b3b", boot: "#3b2f24",
  gold: "#f2c230", gold2: "#c99a12", gold3: "#ffe27a", red: "#e8443a", ink: INK,
  // park (sunrise)
  dawnTop: "#9fcbe8", dawn1: "#c9dceb", dawn2: "#f8d9b8", dawn3: "#ffbf8f", sun: "#ffd25a", sunGlow: "#fff0c2",
  hillFar: "#b7b6c9", hillMid: "#8fae8a", grass: "#7cba5c", grass2: "#6aa64d", grass3: "#8cc86a",
  treeA: "#4f9a52", treeB: "#3f8445", treeC: "#62ad5a", trunk: "#7a5232", path: "#e6cf9e", path2: "#d4b982", pathEdge: "#b89a63",
  // gym
  gymWall: "#dfe6ec", gymWall2: "#cfd8e0", stripe: "#7a2a3a", stripe2: "#f2c230", gymFloor: "#4a4e57", gymFloor2: "#3e424a",
  machine: "#3a3f4a", machine2: "#2a2e37", rail2: "#b9c1cb", belt: "#23262d", beltLine: "#4a4f5a", screen: "#7fe0ff",
  // audio player
  player: "#f2efe8", player2: "#d9d4c8", wheel: "#e2ded4", cover: "#e8643a", cover2: "#2d3a5a",
} as const;

const SHADOW = "#05040c";
const r1 = (v: number) => Math.round(v * 10) / 10;
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** ease with a small overshoot (pop-ins) */
const backOut = (t: number) => { const c = 1.9, u = clamp01(t) - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const FONT = "CaptionSans, sans-serif";

// ---------------------------------------------------------------- uniforms (Person looks + wardrobe)
/** Generic olive field uniform (no insignia). Same values as CAST.soldier1 in channel.ts. Add <CamoShirt> on top of
 *  the Person (same props) for darker camo blobs, and <PatrolCap> for the cap. */
export const SOLDIER_LOOK: Look = CAST.soldier1;
/** second soldier (different face/hair), same uniform */
export const SOLDIER2_LOOK: Look = CAST.soldier2;
/** the career counselor: same uniform, different face/hair */
export const COUNSELOR_LOOK: Look = CAST.counselor;

type Wear = { x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose; rot?: number };

/** Darker camo blobs + a blank chest tape on the torso and trousers of a Person drawn with the SAME x, y, scale,
 *  facing, pose and rot. Works front and profile (the rig's torso shape is the same in both). No insignia. */
export const CamoShirt: React.FC<Wear & { color?: string; color2?: string; pants?: boolean; tape?: boolean }> =
  ({ color = ARMY.olive2, color2 = ARMY.khaki, pants = true, tape = true, ...p }) => {
    const prof = p.pose?.profile ?? false;
    // blobs in the upright body frame: torso x -44..44 between y -278 and -150, trousers y -150..-116
    const shirt: [number, number, number, number, string][] = [
      [-26, -258, 13, 8, color], [18, -246, 15, 9, color], [-8, -220, 11, 7, color2], [28, -206, 12, 8, color],
      [-30, -196, 12, 9, color], [4, -182, 14, 8, color], [-20, -164, 10, 6, color2], [24, -166, 11, 7, color],
    ];
    const legs: [number, number, number, number, string][] = [[-28, -136, 11, 6, color], [10, -132, 12, 6, color], [30, -124, 8, 5, color2], [-6, -122, 8, 5, color2]];
    return (
      <PersonPart {...p} part="body">
        {shirt.map(([cx, cy, rx, ry, c], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${(i * 37) % 60 - 30} ${cx} ${cy})`} fill={c} opacity={0.9} />)}
        {pants && legs.map(([cx, cy, rx, ry, c], i) => <ellipse key={"p" + i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${(i * 41) % 50 - 25} ${cx} ${cy})`} fill={c} opacity={0.85} />)}
        {tape && !prof && <rect x={8} y={-248} width={30} height={10} rx={2} fill={ARMY.khaki} stroke={INK} strokeWidth={2.5} />}
        {/* collar */}
        <path d="M -20 -283 L 0 -262 L 20 -283" stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round" />
      </PersonPart>
    );
  };

/** Plain olive patrol cap (flat top, short brim toward facing in profile; front view brim centred). Same props as the Person. */
export const PatrolCap: React.FC<Wear & { color?: string }> = ({ color = ARMY.olive, ...p }) => {
  const f = p.facing ?? 1, prof = p.pose?.profile ?? false;
  return (
    <PersonPart {...p} part="head">
      <path d="M -60 -78 L -54 -128 Q 0 -140 54 -128 L 60 -78 Q 0 -90 -60 -78 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -50 -116 Q 0 -124 50 -116" stroke={ARMY.olive2} strokeWidth={5} fill="none" />
      {prof
        ? <path d={`M ${f * 30} -84 Q ${f * 70} -88 ${f * 92} -76 L ${f * 58} -72 Z`} fill={ARMY.olive2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        : <path d="M -48 -80 Q 0 -96 48 -80 Q 0 -62 -48 -80 Z" fill={ARMY.olive2} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
    </PersonPart>
  );
};

/** Over-ear headphones on a Person's head. x, y, scale (+ facing, pose, rot) = the SAME values as the Person
 *  (x, y = the Person's feet). Front view: two cups at the sides; profile (pose.profile): one cup over the ear. */
export const Headphones: React.FC<Wear & { color?: string }> = ({ color = "#e8443a", ...p }) => {
  const f = p.facing ?? 1, prof = p.pose?.profile ?? false;
  const cup = (cx: number, k: string) => (
    <g key={k}>
      <rect x={cx - 17} y={-78} width={34} height={56} rx={15} fill={color} stroke={INK} strokeWidth={6} />
      <rect x={cx - 8} y={-68} width={16} height={36} rx={7} fill="#ffffff" opacity={0.35} />
    </g>
  );
  return (
    <PersonPart {...p} part="head">
      {prof ? <>
        <path d={`M ${-f * 38} -72 C ${-f * 46} -128 ${-f * 14} -142 ${f * 10} -132`} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
        <path d={`M ${-f * 38} -72 C ${-f * 46} -128 ${-f * 14} -142 ${f * 10} -132`} stroke={ARMY.machine} strokeWidth={7} fill="none" strokeLinecap="round" />
        {cup(-f * 38, "c")}
      </> : <>
        <path d="M -60 -60 C -66 -150 66 -150 60 -60" stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
        <path d="M -60 -60 C -66 -150 66 -150 60 -60" stroke={ARMY.machine} strokeWidth={7} fill="none" strokeLinecap="round" />
        {cup(-62, "l")}{cup(62, "r")}
      </>}
    </PersonPart>
  );
};

// ---------------------------------------------------------------- calendar
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** first weekday (0 = Sunday) and length of a 2026 month (deterministic) */
const monthInfo = (m: string) => {
  const i = Math.max(0, MONTHS.indexOf(m.toUpperCase().slice(0, 3)));
  return { start: new Date(Date.UTC(2026, i, 1)).getUTCDay(), days: new Date(Date.UTC(2026, i + 1, 0)).getUTCDate() };
};

/** Wall calendar page, centred at (x, y); 460 x 580 at scale 1. Red header with the month, Sunday-first grid of 2026.
 *  `circled` 0..1 draws a hand-drawn red ring around `day` (pathLength trick, linear progress = pen speed). */
export const Calendar: React.FC<{ x: number; y: number; scale?: number; circled?: number; month?: string; day?: number }> =
  ({ x, y, scale = 1, circled = 0, month = "NOV", day = 14 }) => {
    const W = 460, H = 580, { start, days } = monthInfo(month);
    const gx = -W / 2 + 26, gy = -110, cw = (W - 52) / 7, ch = 66;
    const cell = (d: number) => { const k = start + d - 1; return { cx: gx + (k % 7) * cw + cw / 2, cy: gy + Math.floor(k / 7) * ch + ch / 2 }; };
    const c = cell(day);
    const ring = `M ${r1(c.cx + 22)} ${r1(c.cy - 28)} C ${r1(c.cx + 44)} ${r1(c.cy - 8)} ${r1(c.cx + 36)} ${r1(c.cy + 32)} ${r1(c.cx)} ${r1(c.cy + 32)}`
      + ` C ${r1(c.cx - 40)} ${r1(c.cy + 32)} ${r1(c.cx - 44)} ${r1(c.cy - 28)} ${r1(c.cx - 4)} ${r1(c.cy - 33)} C ${r1(c.cx + 20)} ${r1(c.cy - 36)} ${r1(c.cx + 36)} ${r1(c.cy - 22)} ${r1(c.cx + 34)} ${r1(c.cy - 2)}`;
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <rect x={-W / 2 + 10} y={-H / 2 + 14} width={W} height={H} rx={8} fill={SHADOW} opacity={0.18} />
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={8} fill={ARMY.paper} stroke={INK} strokeWidth={8} />
        <path d={`M ${-W / 2} ${-H / 2 + 130} L ${-W / 2} ${-H / 2 + 8} Q ${-W / 2} ${-H / 2} ${-W / 2 + 8} ${-H / 2} L ${W / 2 - 8} ${-H / 2} Q ${W / 2} ${-H / 2} ${W / 2} ${-H / 2 + 8} L ${W / 2} ${-H / 2 + 130} Z`}
          fill={ARMY.red} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <text x={0} y={-H / 2 + 108} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={82} fill="#ffffff" letterSpacing={6}>{month.toUpperCase()}</text>
        {/* ring binding */}
        {[-150, -90, -30, 30, 90, 150].map((bx) => <g key={bx}>
          <rect x={bx - 7} y={-H / 2 - 26} width={14} height={44} rx={7} fill="#c9ccd2" stroke={INK} strokeWidth={5} />
        </g>)}
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <text key={i} x={gx + i * cw + cw / 2} y={gy - 14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={i === 0 ? ARMY.red : "#7a7466"}>{d}</text>)}
        {Array.from({ length: 6 }, (_, r) => <path key={"h" + r} d={`M ${gx} ${gy + r * ch} L ${gx + 7 * cw} ${gy + r * ch}`} stroke={ARMY.paperLine} strokeWidth={3} />)}
        {Array.from({ length: days }, (_, i) => { const p = cell(i + 1); return (
          <text key={i} x={p.cx} y={p.cy + 13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36}
            fill={(start + i) % 7 === 0 ? ARMY.red : INK}>{i + 1}</text>); })}
        {circled > 0 && <path d={ring} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(circled)} fill="none"
          stroke={ARMY.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />}
      </g>
    );
  };

// ---------------------------------------------------------------- the counselor office (backdrop)
const BlankForm: React.FC<{ x: number; y: number; w: number; h: number; rot: number; pin: string; seed: number }> = ({ x, y, w, h, rot, pin, seed }) => {
  const R = rng(seed);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={0} width={w} height={h} fill={ARMY.paper} stroke={INK} strokeWidth={5} />
      <rect x={-w / 2 + 14} y={16} width={w * 0.5} height={12} rx={4} fill="#9a9483" />
      {Array.from({ length: Math.floor((h - 50) / 22) }, (_, i) => <rect key={i} x={-w / 2 + 14} y={44 + i * 22} width={(w - 28) * (0.55 + R() * 0.45)} height={7} rx={3} fill={ARMY.paperLine} />)}
      <circle cx={0} cy={6} r={10} fill={pin} stroke={INK} strokeWidth={4} />
    </g>
  );
};

const Plant: React.FC<{ x: number; base: number; s: number }> = ({ x, base, s }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    {[[-70, -330, -40], [-30, -380, -15], [20, -390, 10], [60, -340, 35], [-90, -250, -60], [90, -260, 60], [0, -300, 0]].map(([lx, ly, a], i) =>
      <path key={i} d={`M 0 -150 Q ${lx * 0.4} ${(ly - 150) / 2} ${lx} ${ly} Q ${lx * 0.2 + (a as number) * 0.6} ${(ly - 150) * 0.6} 0 -150 Z`}
        fill={i % 2 ? ARMY.leaf : ARMY.leaf2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
    <path d="M -80 -160 L 80 -160 L 62 0 L -62 0 Z" fill={ARMY.pot} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-90} y={-180} width={180} height={34} rx={6} fill={ARMY.pot2} stroke={INK} strokeWidth={8} />
  </g>
);

const FilingCabinet: React.FC<{ x: number; base: number; w: number; h: number }> = ({ x, base, w, h }) => (
  <g transform={`translate(${x} ${base})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={6} fill={ARMY.steel} stroke={INK} strokeWidth={8} />
    <rect x={-w / 2} y={-h} width={w} height={18} fill={ARMY.steel3} stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => { const dy = -h + 30 + i * ((h - 40) / 3), dh = (h - 40) / 3 - 12; return (
      <g key={i}>
        <rect x={-w / 2 + 14} y={dy} width={w - 28} height={dh} rx={4} fill={ARMY.steel2} stroke={INK} strokeWidth={5} />
        <rect x={-30} y={dy + 22} width={60} height={22} rx={3} fill={ARMY.paper} stroke={INK} strokeWidth={4} />
        <rect x={-40} y={dy + 58} width={80} height={14} rx={7} fill={ARMY.handle} stroke={INK} strokeWidth={4} />
      </g>); })}
  </g>
);

/** Static part of the office (cached). Covers x -300..1380, y 0..1920; floor line at y 1250. */
const OfficeStatic: React.FC = () => (
  <CachedSvg cacheKey="army-office-v1" x={-300} y={0} w={1680} h={1920}>
    {/* wall + ceiling */}
    <rect x={-300} y={0} width={1680} height={1250} fill={ARMY.wall} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-300 + i * 130} y={130} width={6} height={870} fill={ARMY.wall2} />)}
    <rect x={-300} y={0} width={1680} height={130} fill={ARMY.ceiling} />
    <rect x={-300} y={124} width={1680} height={14} fill={ARMY.wall2} stroke={INK} strokeWidth={4} />
    <rect x={250} y={40} width={580} height={46} rx={10} fill="#fffbea" stroke={INK} strokeWidth={6} />
    <path d="M 270 63 L 810 63" stroke="#efe6c4" strokeWidth={10} />
    {/* wainscot */}
    <rect x={-300} y={1000} width={1680} height={250} fill={ARMY.wainscot} />
    {Array.from({ length: 14 }, (_, i) => <rect key={"w" + i} x={-270 + i * 130} y={1030} width={100} height={190} rx={6} fill="none" stroke={ARMY.wainscot2} strokeWidth={6} />)}
    <rect x={-300} y={990} width={1680} height={20} fill={ARMY.rail} stroke={INK} strokeWidth={5} />
    {/* window with blinds (top 55 % lowered) */}
    <rect x={30} y={290} width={380} height={540} rx={6} fill={ARMY.sky} stroke={INK} strokeWidth={10} />
    <clipPath id="army-office-win"><rect x={35} y={295} width={370} height={530} /></clipPath>
    <g clipPath="url(#army-office-win)">
      <rect x={40} y={560} width={360} height={260} fill={ARMY.sky2} />
      {[[60, 760, 70], [140, 730, 80], [240, 770, 60], [320, 740, 75], [380, 770, 50]].map(([tx, ty, tr], i) => <circle key={"t" + i} cx={tx} cy={ty} r={tr} fill={ARMY.treeFar} />)}
      <rect x={40} y={780} width={360} height={45} fill="#a9cf8e" />
    </g>
    {Array.from({ length: 12 }, (_, i) => <g key={"b" + i}>
      <rect x={34} y={296 + i * 24} width={372} height={20} fill={ARMY.blinds} />
      <path d={`M 34 ${316 + i * 24} L 406 ${316 + i * 24}`} stroke={ARMY.blinds2} strokeWidth={4} />
    </g>)}
    <rect x={30} y={290} width={380} height={18} fill={ARMY.blinds2} stroke={INK} strokeWidth={5} />
    <rect x={34} y={582} width={372} height={14} rx={4} fill={ARMY.blinds2} stroke={INK} strokeWidth={4} />
    <path d="M 220 600 L 220 830" stroke={INK} strokeWidth={7} />
    <rect x={10} y={826} width={420} height={22} rx={6} fill={ARMY.paper} stroke={INK} strokeWidth={6} />
    <path d="M 380 300 L 380 700" stroke={INK} strokeWidth={3} />
    <rect x={374} y={700} width={12} height={22} rx={5} fill={ARMY.blinds2} stroke={INK} strokeWidth={3} />
    {/* corkboard with blank forms */}
    <rect x={740} y={330} width={330} height={400} rx={8} fill={ARMY.frame} stroke={INK} strokeWidth={8} />
    <rect x={758} y={348} width={294} height={364} fill={ARMY.cork} />
    {Array.from({ length: 40 }, (_, i) => { const R = rng(500 + i); return <circle key={"k" + i} cx={762 + R() * 286} cy={352 + R() * 356} r={2 + R() * 2} fill={ARMY.cork2} />; })}
    <BlankForm x={830} y={372} w={120} h={160} rot={-4} pin={ARMY.pinR} seed={3} />
    <BlankForm x={980} y={380} w={110} h={140} rot={3} pin={ARMY.pinB} seed={5} />
    <BlankForm x={845} y={555} w={130} h={130} rot={2} pin={ARMY.pinB} seed={7} />
    <g transform="translate(985 560) rotate(-6)"><rect x={-48} y={0} width={96} height={96} fill={ARMY.sticky} stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <rect key={i} x={-34} y={22 + i * 20} width={60 - i * 12} height={7} rx={3} fill="#c99a12" />)}
      <circle cx={0} cy={6} r={9} fill={ARMY.pinR} stroke={INK} strokeWidth={4} /></g>
    {/* big wall calendar between window and corkboard */}
    <Calendar x={575} y={560} scale={0.6} />
    {/* filing cabinet + plant */}
    <FilingCabinet x={930} base={1250} w={230} h={420} />
    <g transform="translate(930 830)"><rect x={-70} y={-24} width={140} height={24} fill={ARMY.paper} stroke={INK} strokeWidth={5} />
      <rect x={-60} y={-44} width={120} height={22} fill="#e9e2cf" stroke={INK} strokeWidth={5} /><rect x={-66} y={-60} width={110} height={18} fill={ARMY.paper} stroke={INK} strokeWidth={5} /></g>
    <Plant x={120} base={1250} s={1.05} />
    {/* floor (calm in the caption band y 1440-1640) */}
    <rect x={-300} y={1250} width={1680} height={670} fill={ARMY.floor} />
    <rect x={-300} y={1236} width={1680} height={22} fill={ARMY.skirting} stroke={INK} strokeWidth={5} />
    <rect x={-300} y={1258} width={1680} height={14} fill={SHADOW} opacity={0.12} />
    {[1330, 1420].map((ly) => <path key={ly} d={`M -300 ${ly} L 1380 ${ly}`} stroke={ARMY.floor2} strokeWidth={4} />)}
    {Array.from({ length: 9 }, (_, i) => <path key={"v" + i} d={`M ${-200 + i * 180} 1258 L ${-260 + i * 200} 1430`} stroke={ARMY.floor2} strokeWidth={4} />)}
    {[1700, 1820].map((ly) => <path key={ly} d={`M -300 ${ly} L 1380 ${ly}`} stroke={ARMY.floor2} strokeWidth={4} />)}
    {/* soft window light on the floor */}
    <path d="M 40 1272 L 400 1272 L 520 1420 L 60 1420 Z" fill="#fff6d6" opacity={0.18} />
  </CachedSvg>
);

/** Full 1080x1920 office backdrop (wall, floor from y 1250). f drives the clock's second hand. Put the Desk in front
 *  (e.g. Desk x 540 y 1400). Nothing busy in y 1440-1640. */
export const CounselorOffice: React.FC<{ f: number }> = ({ f }) => {
  const sec = (f / 30) * 6, min = 52 * 6 + f / 30 / 10;
  return (
    <g>
      <OfficeStatic />
      {/* wall clock (live second hand) */}
      <g transform="translate(575 210)">
        <circle r={58} fill="#ffffff" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <path key={i} d={`M ${r1(Math.sin(a) * 42)} ${r1(-Math.cos(a) * 42)} L ${r1(Math.sin(a) * 50)} ${r1(-Math.cos(a) * 50)}`} stroke={INK} strokeWidth={i % 3 ? 3 : 6} />; })}
        <path d="M 0 0 L 0 -28" stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${9 * 30 + 26})`} />
        <path d="M 0 0 L 0 -42" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${min})`} />
        <path d="M 0 8 L 0 -46" stroke={ARMY.red} strokeWidth={3} strokeLinecap="round" transform={`rotate(${Math.floor(sec / 6) * 6})`} />
        <circle r={6} fill={ARMY.red} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- desk + paperwork
/** Height of the desk top above the floor, in desk units (multiply by scale). Items on the desk go at
 *  y - DESK_TOP*scale. To SEAT a Person behind it use SEATED_POSE + seatedY (draw the Person BEFORE the Desk,
 *  shadow 0, same scale as the desk): chest, arms and head show above the top, the folded legs stay hidden. */
export const DESK_TOP = 180;
/** seated behind the Desk (front view): hips dropped, knees folded sideways so the feet stay above the floor line */
export const SEATED_POSE: Pose = { armL: [14, -10], armR: [14, -10], legL: [0, -90], legR: [0, -90], crouch: 0.5 };
/** Person y for someone seated behind a Desk standing at deskY with that scale */
export const seatedY = (deskY: number, scale = 1) => deskY - 20 * scale;
/** Steel office desk seen from the front, 760 wide at scale 1; x = centre, y = floor. */
export const Desk: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const T = -DESK_TOP;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={400} ry={20} fill={SHADOW} opacity={0.25} />
      {/* top surface (slight perspective) */}
      <path d={`M -360 ${T} L -390 ${T + 30} L 390 ${T + 30} L 360 ${T} Z`} fill={ARMY.deskTop} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-396} y={T + 28} width={792} height={20} rx={4} fill={ARMY.deskTop2} stroke={INK} strokeWidth={7} />
      {/* front: two pedestals with drawers + modesty panel */}
      <rect x={-200} y={T + 48} width={400} height={-T - 56} fill={ARMY.desk2} stroke={INK} strokeWidth={7} />
      {[-1, 1].map((d) => <g key={d}>
        <rect x={d > 0 ? 200 : -380} y={T + 48} width={180} height={-T - 48} fill={ARMY.desk} stroke={INK} strokeWidth={8} />
        {[0, 1].map((i) => <g key={i}>
          <rect x={(d > 0 ? 200 : -380) + 14} y={T + 60 + i * 60} width={152} height={50} rx={4} fill={ARMY.desk2} stroke={INK} strokeWidth={5} />
          <rect x={(d > 0 ? 290 : -290) - 26} y={T + 80 + i * 60} width={52} height={10} rx={5} fill={ARMY.handle} stroke={INK} strokeWidth={3} />
        </g>)}
      </g>)}
      <rect x={-200} y={T + 60} width={400} height={20} rx={4} fill={ARMY.desk} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** A sheet of paper (440 x 580 at scale 1, centred at x, y) with a title, text lines and a signature line;
 *  `signed` 0..1 draws the signature on (pass linear progress; the pen tip is at contractSignPoint). */
export const Contract: React.FC<{ x: number; y: number; scale?: number; signed?: number; label?: string }> = ({ x, y, scale = 1, signed = 0, label = "CONTRACT" }) => {
  const R = rng(19);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-210} y={-276} width={440} height={580} rx={6} fill={SHADOW} opacity={0.18} />
      <rect x={-220} y={-290} width={440} height={580} rx={6} fill={ARMY.paper} stroke={INK} strokeWidth={8} />
      <text x={0} y={-212} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 12 ? 34 : 44} fill={INK} letterSpacing={2}>{label}</text>
      <rect x={-160} y={-190} width={320} height={6} rx={3} fill={ARMY.olive} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-180} y={-158 + i * 30} width={360 * (i % 4 === 3 ? 0.55 : 0.8 + R() * 0.2)} height={10} rx={5} fill={ARMY.paperLine} />)}
      <rect x={-180} y={128} width={150} height={10} rx={5} fill={ARMY.paperLine} />
      <text x={-178} y={226} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>X</text>
      <path d="M -146 230 L 180 230" stroke={INK} strokeWidth={5} />
      {signed > 0 && <path d={SIGN_PATH} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(signed)} fill="none" stroke="#1d3c8a" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
};
const SIGN_PATH = "M -130 214 C -120 150 -96 150 -104 200 C -110 236 -80 236 -70 196 C -62 170 -50 176 -52 204 C -54 228 -30 222 -24 196"
  + " C -18 176 -2 180 0 204 C 2 222 20 220 28 190 C 34 168 44 150 52 176 C 60 206 70 222 86 196 C 98 178 104 186 110 204 C 120 220 140 212 168 196";
/** where the signature ends, in Contract-local units (multiply by scale, add x/y) - for placing the Pen at the end */
export const SIGN_END = { x: 168, y: 196 } as const;
/** pen-tip position along the signature at progress t (approximate: linear in x), Contract-local units */
export const contractSignPoint = (t: number) => { const u = clamp01(t); const x = -130 + u * 298; return { x, y: 200 + Math.sin(u * 22) * 18 }; };

/** Ballpoint pen; (x, y) = the TIP. rot (degrees) tilts it around the tip (default 30 = held for writing, top to the right). ~300 long. */
export const Pen: React.FC<{ x: number; y: number; rot?: number; scale?: number }> = ({ x, y, rot = 30, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M 0 0 L -9 -34 L 9 -34 Z" fill="#c9ccd2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-15} y={-90} width={30} height={58} rx={6} fill="#2a2f3d" stroke={INK} strokeWidth={6} />
    <rect x={-17} y={-290} width={34} height={204} rx={10} fill="#2d5bd0" stroke={INK} strokeWidth={7} />
    <rect x={-8} y={-280} width={7} height={180} rx={3} fill="#ffffff" opacity={0.35} />
    <path d="M 17 -270 L 26 -270 L 26 -170 L 17 -160" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 17 -270 L 26 -270 L 26 -170 L 17 -160" fill="none" stroke="#c9ccd2" strokeWidth={2} strokeLinejoin="round" />
    <rect x={-12} y={-306} width={24} height={20} rx={6} fill="#2a2f3d" stroke={INK} strokeWidth={6} />
  </g>
);

// ---------------------------------------------------------------- the golden pass
/** Golden ticket that reads "4 DAY PASS" (600 x 320 at scale 1, centred). pop 0..1 = pop-in (overshoot scale,
 *  small turn, a shine sweep). pop 1 = landed and still. */
export const PassCard: React.FC<{ x: number; y: number; scale?: number; pop?: number }> = ({ x, y, scale = 1, pop = 1 }) => {
  const p = clamp01(pop), s = p >= 1 ? 1 : Math.max(0, backOut(p)), rot = (1 - p) * -14;
  const W = 600, H = 320, n = 34;
  const outline = `M ${-W / 2 + 26} ${-H / 2} L ${W / 2 - 26} ${-H / 2} Q ${W / 2} ${-H / 2} ${W / 2} ${-H / 2 + 26} L ${W / 2} ${-n} A ${n} ${n} 0 0 0 ${W / 2} ${n}`
    + ` L ${W / 2} ${H / 2 - 26} Q ${W / 2} ${H / 2} ${W / 2 - 26} ${H / 2} L ${-W / 2 + 26} ${H / 2} Q ${-W / 2} ${H / 2} ${-W / 2} ${H / 2 - 26}`
    + ` L ${-W / 2} ${n} A ${n} ${n} 0 0 0 ${-W / 2} ${-n} L ${-W / 2} ${-H / 2 + 26} Q ${-W / 2} ${-H / 2} ${-W / 2 + 26} ${-H / 2} Z`;
  const shineX = -W / 2 - 120 + p * (W + 240);
  const star = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${r1(cx + Math.cos(a) * rr)} ${r1(cy + Math.sin(a) * rr)}`; });
    return "M " + pts.join(" L ") + " Z";
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * s}) rotate(${rot})`}>
      <path d={outline} transform="translate(0 16)" fill={SHADOW} opacity={0.25} />
      <path d={outline} fill={ARMY.gold} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d={`M ${-W / 2 + 22} ${-H / 2 + 22} L ${W / 2 - 22} ${-H / 2 + 22} L ${W / 2 - 22} ${H / 2 - 22} L ${-W / 2 + 22} ${H / 2 - 22} Z`} fill="none" stroke={ARMY.gold2} strokeWidth={5} strokeDasharray="14 10" />
      {/* stub + perforation */}
      <path d={`M ${-W / 2 + 150} ${-H / 2 + 12} L ${-W / 2 + 150} ${H / 2 - 12}`} stroke={ARMY.gold2} strokeWidth={8} strokeDasharray="4 14" strokeLinecap="round" />
      <path d={star(-W / 2 + 76, 0, 50)} fill={ARMY.gold3} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* the words */}
      <text x={75} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={INK} letterSpacing={2}>4 DAY</text>
      <text x={75} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={ARMY.red} stroke={INK} strokeWidth={3} letterSpacing={6}>PASS</text>
      {[[-40, -120, 10], [250, -112, 12], [252, 118, 9]].map(([sx, sy, sr], i) => <path key={i} d={star(sx, sy, sr)} fill={ARMY.gold3} stroke={INK} strokeWidth={3} />)}
      {/* shine sweep while popping */}
      {p > 0 && p < 1 && <path d={`M ${shineX} ${-H / 2 + 14} L ${shineX + 60} ${-H / 2 + 14} L ${shineX - 20} ${H / 2 - 14} L ${shineX - 80} ${H / 2 - 14} Z`} fill="#ffffff" opacity={0.45} />}
    </g>
  );
};

// ---------------------------------------------------------------- park path (sunrise, parallax scroll)
const TILE = 1400;
/** a horizontally repeating strip: `draw(ox)` is called for ox = -TILE, 0, TILE inside one cached tile, so shapes
 *  near the edges wrap seamlessly. Shift by -(scroll * p) mod TILE. */
const Strip: React.FC<{ id: string; y: number; h: number; scroll: number; p: number; draw: (ox: number) => React.ReactNode }> = ({ id, y, h, scroll, p, draw }) => {
  const off = (((scroll * p) % TILE) + TILE) % TILE;
  const tile = (
    <CachedSvg cacheKey={`army-park-${id}-${y}-${h}`} x={0} y={y} w={TILE} h={h}>
      {[-TILE, 0, TILE].map((ox) => <g key={ox}>{draw(ox)}</g>)}
    </CachedSvg>
  );
  return <g>{[-1, 0, 1].map((k) => <g key={k} transform={`translate(${r1(-off + k * TILE - 160)} 0)`}>{tile}</g>)}</g>;
};
const roundTree = (x: number, base: number, s: number, c: string, k: string) => (
  <g key={k} transform={`translate(${x} ${base}) scale(${s})`}>
    <rect x={-14} y={-120} width={28} height={120} fill={ARMY.trunk} stroke={INK} strokeWidth={6} />
    <path d="M -110 -150 C -140 -260 -60 -330 0 -320 C 70 -340 150 -260 112 -150 C 130 -90 60 -80 0 -96 C -60 -80 -130 -90 -110 -150 Z" fill={c} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -60 -220 Q -40 -270 10 -275" stroke="#ffffff" strokeWidth={8} opacity={0.25} fill="none" strokeLinecap="round" />
  </g>
);

/** Sunrise park with a running path, 1080x1920. `scroll` (px, grows as the runner advances) moves the world LEFT
 *  in parallax (sky still, hills 0.1, tree line 0.3, near trees 0.65, path 1). Runner feet on the path at y ~1330
 *  (path band y 1250..1400). Calm grass in y 1440-1640. f animates the sun glow. */
export const ParkPath: React.FC<{ f: number; scroll?: number }> = ({ f, scroll = 0 }) => {
  const glow = 1 + Math.sin(f * 0.05) * 0.03;
  return (
    <g>
      <CachedSvg cacheKey="army-park-sky" x={-200} y={0} w={1480} h={1100}>
        <rect x={-200} y={0} width={1480} height={1100} fill={ARMY.dawnTop} />
        <rect x={-200} y={380} width={1480} height={720} fill={ARMY.dawn1} />
        <rect x={-200} y={600} width={1480} height={500} fill={ARMY.dawn2} />
        <rect x={-200} y={800} width={1480} height={300} fill={ARMY.dawn3} />
        {[[160, 300, 1], [820, 420, 0.8], [520, 220, 0.6]].map(([cx, cy, s], i) =>
          <path key={i} transform={`translate(${cx} ${cy}) scale(${s})`} d="M -110 20 Q -120 -20 -70 -20 Q -60 -60 -10 -55 Q 30 -80 60 -40 Q 110 -45 110 0 Q 120 25 90 25 L -90 25 Q -115 25 -110 20 Z" fill="#fff4ea" stroke={INK} strokeWidth={5} />)}
      </CachedSvg>
      <g transform={`translate(720 930) scale(${glow})`}>
        <circle r={210} fill={ARMY.sunGlow} opacity={0.35} />
        <circle r={150} fill={ARMY.sunGlow} opacity={0.45} />
      </g>
      <circle cx={720} cy={930} r={110} fill={ARMY.sun} stroke={INK} strokeWidth={7} />
      <Strip id="hills" y={700} h={420} scroll={scroll} p={0.1} draw={(ox) => <>
        <path d={`M ${ox} 1120 L ${ox} 930 Q ${ox + 250} 820 ${ox + 520} 900 Q ${ox + 800} 980 ${ox + 1050} 880 Q ${ox + 1250} 820 ${ox + TILE} 930 L ${ox + TILE} 1120 Z`} fill={ARMY.hillFar} />
      </>} />
      <Strip id="treeline" y={760} h={360} scroll={scroll} p={0.3} draw={(ox) => <>
        <path d={`M ${ox} 1120 L ${ox} 1010 Q ${ox + 350} 960 ${ox + 700} 1010 Q ${ox + 1050} 1060 ${ox + TILE} 1010 L ${ox + TILE} 1120 Z`} fill={ARMY.hillMid} />
        {Array.from({ length: 16 }, (_, i) => { const tx = ox + i * (TILE / 16) + ((i * 37) % 40), tr = 46 + ((i * 53) % 30);
          return <circle key={i} cx={tx} cy={1040 - tr * 0.4} r={tr} fill={i % 2 ? ARMY.treeB : ARMY.treeA} stroke={INK} strokeWidth={5} />; })}
      </>} />
      <Strip id="field" y={1060} h={860} scroll={scroll} p={1} draw={(ox) => <>
        <rect x={ox} y={1060} width={TILE} height={860} fill={ARMY.grass} />
        <rect x={ox} y={1060} width={TILE} height={60} fill={ARMY.grass3} />
        {/* path */}
        <rect x={ox} y={1250} width={TILE} height={150} fill={ARMY.path} />
        <rect x={ox} y={1250} width={TILE} height={10} fill={ARMY.pathEdge} />
        <rect x={ox} y={1392} width={TILE} height={10} fill={ARMY.pathEdge} />
        {Array.from({ length: 14 }, (_, i) => { const px = ox + i * 100 + ((i * 29) % 50); return <ellipse key={"s" + i} cx={px} cy={1290 + ((i * 47) % 90)} rx={10 + (i % 3) * 4} ry={5} fill={ARMY.path2} />; })}
        {/* grass tufts just below the path and in the bottom strip (none in 1440-1640) */}
        {Array.from({ length: 12 }, (_, i) => { const gx = ox + i * 118 + ((i * 31) % 60), gy = i % 2 ? 1424 : 1700 + ((i * 17) % 120);
          return <path key={"g" + i} d={`M ${gx - 18} ${gy} L ${gx - 8} ${gy - 26} L ${gx} ${gy} L ${gx + 8} ${gy - 32} L ${gx + 18} ${gy} Z`} fill={ARMY.grass2} />; })}
        {Array.from({ length: 6 }, (_, i) => { const fx = ox + 80 + i * 230, fy = 1760 + ((i * 41) % 100);
          return <g key={"fl" + i}><circle cx={fx} cy={fy} r={10} fill={i % 2 ? "#ffd93b" : "#ffffff"} stroke={INK} strokeWidth={3} /><circle cx={fx} cy={fy} r={4} fill="#e8643a" /></g>; })}
      </>} />
      <Strip id="neartrees" y={760} h={500} scroll={scroll} p={1} draw={(ox) => <>
        {[[120, 1.05, ARMY.treeA], [560, 0.9, ARMY.treeC], [980, 1.15, ARMY.treeB], [1270, 0.85, ARMY.treeA]].map(([tx, s, c], i) =>
          roundTree(ox + (tx as number), 1252, s as number, c as string, "t" + i))}
        {/* a bench */}
        <g transform={`translate(${ox + 780} 1252)`}>
          <rect x={-90} y={-70} width={180} height={18} rx={4} fill="#c27a3e" stroke={INK} strokeWidth={5} />
          <rect x={-90} y={-110} width={180} height={18} rx={4} fill="#c27a3e" stroke={INK} strokeWidth={5} />
          <path d="M -76 -52 L -76 0 M 76 -52 L 76 0" stroke={INK} strokeWidth={9} />
        </g>
      </>} />
    </g>
  );
};
/** alias */
export const RunPath = ParkPath;

// ---------------------------------------------------------------- gym
/** Treadmill deck height in treadmill units: a Person runs on it at y - TREADMILL_DECK*scale (same scale). */
export const TREADMILL_DECK = 70;
/** Side-view treadmill facing +x (console on the right); x = centre of the deck, y = floor; ~560 wide at scale 1.
 *  f moves the belt (speed in px/frame via `speed`, default 14; 0 = stopped). */
export const Treadmill: React.FC<{ x: number; y: number; scale?: number; f: number; speed?: number }> = ({ x, y, scale = 1, f, speed = 14 }) => {
  const off = ((f * speed) % 60 + 60) % 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={300} ry={16} fill={SHADOW} opacity={0.25} />
      {/* uprights + console + handrail */}
      <path d="M 200 -60 L 250 -420" stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <path d="M 200 -60 L 250 -420" stroke={ARMY.rail2} strokeWidth={13} strokeLinecap="round" />
      <path d="M 238 -330 L -40 -330" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d="M 238 -330 L -40 -330" stroke={ARMY.rail2} strokeWidth={10} strokeLinecap="round" />
      <g transform="translate(262 -440) rotate(-18)">
        <rect x={-80} y={-50} width={160} height={90} rx={14} fill={ARMY.machine} stroke={INK} strokeWidth={7} />
        <rect x={-58} y={-34} width={116} height={46} rx={6} fill={ARMY.screen} />
        <rect x={-48} y={-24} width={50} height={10} rx={4} fill="#1b2133" opacity={0.6} />
        <rect x={-48} y={-6} width={80} height={8} rx={4} fill="#1b2133" opacity={0.4} />
      </g>
      {/* deck */}
      <path d={`M -290 -${TREADMILL_DECK} L 220 -${TREADMILL_DECK} L 280 -20 L 280 0 L -290 0 Z`} fill={ARMY.machine2} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-280} y={-TREADMILL_DECK - 8} width={500} height={22} rx={11} fill={ARMY.belt} stroke={INK} strokeWidth={6} />
      <g>
        {Array.from({ length: 10 }, (_, i) => { const bx = -270 + ((i * 60 - off) % 540 + 540) % 540 - 0; return <rect key={i} x={bx} y={-TREADMILL_DECK - 3} width={20} height={6} rx={3} fill={ARMY.beltLine} />; })}
      </g>
      <circle cx={-276} cy={-TREADMILL_DECK + 3} r={13} fill={ARMY.rail2} stroke={INK} strokeWidth={5} />
      <circle cx={208} cy={-TREADMILL_DECK + 3} r={13} fill={ARMY.rail2} stroke={INK} strokeWidth={5} />
      <path d="M 180 -64 L 290 -64 L 290 -10 L 220 -10 Z" fill={ARMY.machine} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-250} y={-34} width={420} height={10} rx={5} fill={ARMY.stripe2} opacity={0.8} />
    </g>
  );
};

/** University gym backdrop 1080x1920: big windows (sky + campus trees), maroon/gold wall stripe (no text), a row of
 *  far treadmills, a dumbbell rack on the right, rubber floor from y 1250 (calm in y 1440-1640). Static (cached). */
export const Gym: React.FC<{ f: number }> = () => (
  <CachedSvg cacheKey="army-gym-v1" x={-300} y={0} w={1680} h={1920}>
    <rect x={-300} y={0} width={1680} height={1250} fill={ARMY.gymWall} />
    <rect x={-300} y={0} width={1680} height={150} fill={ARMY.gymWall2} />
    {Array.from({ length: 9 }, (_, i) => <g key={"tr" + i}><rect x={-300 + i * 220} y={110} width={200} height={26} fill="#9aa6b2" stroke={INK} strokeWidth={4} />
      <rect x={-240 + i * 220} y={136} width={80} height={14} rx={4} fill="#fffbea" stroke={INK} strokeWidth={3} /></g>)}
    {/* windows */}
    {[-20, 370, 760].map((wx, i) => <g key={"w" + i}>
      <rect x={wx} y={240} width={340} height={620} rx={6} fill={ARMY.sky} stroke={INK} strokeWidth={10} />
      <rect x={wx + 6} y={600} width={328} height={254} fill={ARMY.sky2} />
      {i === 1 && <g><rect x={wx + 120} y={560} width={110} height={200} fill="#e6cfa0" stroke={INK} strokeWidth={4} />
        {[0, 1].map((r) => <rect key={r} x={wx + 140} y={590 + r * 50} width={70} height={26} fill="#cfe9f5" stroke={INK} strokeWidth={3} />)}
        <path d={`M ${wx + 110} 562 L ${wx + 175} 510 L ${wx + 240} 562 Z`} fill="#c4573f" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>}
      {[[40, 740, 70], [140, 720, 75], [250, 750, 64], [320, 720, 60]].map(([tx, ty, tr], j) => <circle key={j} cx={wx + tx} cy={ty} r={tr} fill={ARMY.treeFar} />)}
      <rect x={wx + 6} y={760} width={328} height={94} fill="#a9cf8e" />
      <path d={`M ${wx + 170} 240 L ${wx + 170} 860 M ${wx} 470 L ${wx + 340} 470`} stroke={INK} strokeWidth={8} />
      <rect x={wx - 10} y={856} width={360} height={20} rx={5} fill="#ffffff" stroke={INK} strokeWidth={6} />
    </g>)}
    {/* wall stripe */}
    <rect x={-300} y={930} width={1680} height={50} fill={ARMY.stripe} />
    <rect x={-300} y={980} width={1680} height={16} fill={ARMY.stripe2} />
    <rect x={-300} y={996} width={1680} height={254} fill={ARMY.gymWall2} />
    {/* dumbbell rack (right) */}
    <g transform="translate(930 1250)">
      <rect x={-150} y={-230} width={300} height={24} rx={6} fill={ARMY.machine} stroke={INK} strokeWidth={6} />
      <rect x={-150} y={-120} width={300} height={24} rx={6} fill={ARMY.machine} stroke={INK} strokeWidth={6} />
      <path d="M -130 -206 L -140 0 M 130 -206 L 140 0" stroke={INK} strokeWidth={16} /><path d="M -130 -206 L -140 0 M 130 -206 L 140 0" stroke={ARMY.machine} strokeWidth={8} />
      {[-100, -40, 20, 80].map((dx, i) => <g key={i}>
        <rect x={dx - 6} y={-262} width={52} height={10} rx={4} fill="#9aa6b2" stroke={INK} strokeWidth={3} />
        <rect x={dx - 10} y={-276} width={16} height={38} rx={5} fill={ARMY.machine2} stroke={INK} strokeWidth={4} />
        <rect x={dx + 34} y={-276} width={16} height={38} rx={5} fill={ARMY.machine2} stroke={INK} strokeWidth={4} />
        <rect x={dx - 8} y={-150} width={56} height={10} rx={4} fill="#9aa6b2" stroke={INK} strokeWidth={3} />
        <rect x={dx - 14} y={-170} width={22} height={50} rx={6} fill={ARMY.stripe} stroke={INK} strokeWidth={4} />
        <rect x={dx + 32} y={-170} width={22} height={50} rx={6} fill={ARMY.stripe} stroke={INK} strokeWidth={4} />
      </g>)}
    </g>
    {/* far treadmills row */}
    {[-60, 230, 520].map((tx) => <Treadmill key={tx} x={tx} y={1236} scale={0.5} f={0} speed={0} />)}
    {/* floor */}
    <rect x={-300} y={1250} width={1680} height={670} fill={ARMY.gymFloor} />
    <rect x={-300} y={1236} width={1680} height={20} fill={ARMY.machine2} />
    {[1330, 1410, 1700, 1820].map((ly) => <path key={ly} d={`M -300 ${ly} L 1380 ${ly}`} stroke={ARMY.gymFloor2} strokeWidth={5} />)}
    <path d="M -300 1300 L 1380 1300" stroke={ARMY.stripe2} strokeWidth={6} opacity={0.6} />
  </CachedSvg>
);

// ---------------------------------------------------------------- audiobook player
/** Old-school pocket audio player (300 x 500 at scale 1, centred) showing a gripping book cover (no title text),
 *  a progress bar and a click wheel; earbud cable from the top. `locked` 0..1 dims the screen and pops a padlock. */
export const Audiobook: React.FC<{ x: number; y: number; scale?: number; locked?: number }> = ({ x, y, scale = 1, locked = 0 }) => {
  const l = clamp01(locked), ls = l >= 1 ? 1 : Math.max(0, backOut(l));
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -60 -250 C -70 -330 -150 -330 -170 -420 M 60 -250 C 70 -330 150 -330 170 -420" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M -60 -250 C -70 -330 -150 -330 -170 -420 M 60 -250 C 70 -330 150 -330 170 -420" stroke="#f6f3ec" strokeWidth={4} fill="none" strokeLinecap="round" />
      {[-170, 170].map((ex) => <ellipse key={ex} cx={ex} cy={-430} rx={20} ry={26} fill="#f6f3ec" stroke={INK} strokeWidth={6} />)}
      <rect x={-140} y={-240} width={300} height={500} rx={40} fill={SHADOW} opacity={0.2} transform="translate(-10 0)" />
      <rect x={-150} y={-250} width={300} height={500} rx={40} fill={ARMY.player} stroke={INK} strokeWidth={9} />
      <rect x={-136} y={-236} width={30} height={470} rx={14} fill="#ffffff" opacity={0.4} />
      {/* screen */}
      <rect x={-120} y={-220} width={240} height={220} rx={12} fill="#1b2133" stroke={INK} strokeWidth={7} />
      <g>
        <rect x={-62} y={-206} width={124} height={164} rx={4} fill={ARMY.cover2} stroke={INK} strokeWidth={4} />
        <circle cx={22} cy={-170} r={20} fill={ARMY.gold3} />
        <path d="M -62 -90 L -30 -130 L -6 -104 L 22 -146 L 62 -92 L 62 -42 L -62 -42 Z" fill={ARMY.cover} />
        <path d="M -8 -196 L -22 -160 L -8 -160 L -20 -124" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinejoin="round" />
        <rect x={-48} y={-74} width={96} height={10} rx={4} fill="#ffffff" />
        <rect x={-34} y={-58} width={68} height={7} rx={3} fill="#ffffff" opacity={0.7} />
      </g>
      <rect x={-96} y={-28} width={192} height={8} rx={4} fill="#3a4266" />
      <rect x={-96} y={-28} width={74} height={8} rx={4} fill={ARMY.screen} />
      {/* click wheel */}
      <circle cx={0} cy={125} r={98} fill={ARMY.wheel} stroke={INK} strokeWidth={7} />
      <circle cx={0} cy={125} r={36} fill={ARMY.player} stroke={INK} strokeWidth={6} />
      <path d="M -8 52 L -8 70 M 8 52 L 8 70" stroke="#6a6f7d" strokeWidth={6} strokeLinecap="round" />
      <path d="M 66 115 L 78 125 L 66 135 Z M 80 115 L 92 125 L 80 135 Z" fill="#6a6f7d" />
      <path d="M -66 115 L -78 125 L -66 135 Z M -80 115 L -92 125 L -80 135 Z" fill="#6a6f7d" />
      <path d="M -10 186 L 6 196 L -10 206 Z M 10 186 L 10 206" stroke="#6a6f7d" strokeWidth={4} fill="#6a6f7d" />
      {/* lock */}
      {l > 0 && <rect x={-120} y={-220} width={240} height={220} rx={12} fill="#05040c" opacity={0.55 * l} />}
      {l > 0 && <g transform={`translate(0 -96) scale(${ls})`}>
        <path d="M -42 -20 L -42 -58 C -42 -112 42 -112 42 -58 L 42 -20" stroke={INK} strokeWidth={30} fill="none" />
        <path d="M -42 -20 L -42 -58 C -42 -112 42 -112 42 -58 L 42 -20" stroke="#c9ccd2" strokeWidth={14} fill="none" />
        <rect x={-72} y={-30} width={144} height={112} rx={16} fill={ARMY.gold} stroke={INK} strokeWidth={8} />
        <rect x={-60} y={-18} width={20} height={88} rx={8} fill="#ffffff" opacity={0.35} />
        <circle cx={0} cy={16} r={15} fill={INK} />
        <path d="M -7 18 L -10 52 L 10 52 L 7 18 Z" fill={INK} />
      </g>}
    </g>
  );
};

