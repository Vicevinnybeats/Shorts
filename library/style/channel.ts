// TheLittleEpic house style, in one place. Every new episode imports from here so all videos look and sound the same.
// Change a value here = change it for every future video. (Already-approved episodes keep their own copies.)
import type { Look } from "../characters25/person";
export { INK, Person, POSES, runPose } from "../characters25/person";

/** narrator: Kokoro TTS voice + speed (render-final reads NARRATOR_VOICE; keep both in sync) */
export const VOICE = { engine: "kokoro", voice: "am_michael", speed: 1.0 } as const;

/** captions: Montserrat 900 uppercase, white + active word yellow, at 80 % of the height */
export const CAPTIONS = { yFrac: 0.8, font: "CaptionSans", active: "#ffd93b", text: "#ffffff" } as const;

/** safe areas (design px, 1080x1920): no on-screen text below TEXT_MAX_Y; no character feet/bodies in the caption band */
export const SAFE = { TEXT_MIN_Y: 300, TEXT_MAX_Y: 1350, CAPTION_BAND: [1440, 1640], SIDE: 60 } as const;

/** the "explain" look shared by every fact shot: navy backdrop, faint grid, soft spotlight */
export const LAB = { bg: "#121a36", grid: "#1e2a52", text: "#f6efe0", muted: "#9fb0d8", gold: "#f2c230", red: "#e8443a", green: "#2fbf71", orange: "#ff9a3a" } as const;

/** skin and hair swatches every character is built from (same faces/bodies on every video: Person in characters25) */
export const SKIN = { light: "#ffe2c8", fair: "#f2c39b", tan: "#d99c6c", warm: "#c98a5e", brown: "#a8673f", deep: "#8d5a3b", dark: "#7a4a2e" } as const;
export const HAIR = { black: "#1a1010", brown: "#3b2416", blond: "#c9862e", grey: "#cfd2d8" } as const;

/** recurring background extras (re-used across episodes so the world feels like one place) */
export const EXTRAS: Look[] = [
  { skin: SKIN.brown, hair: HAIR.black, hairStyle: "short", jersey: "#2fbf71", shorts: "#2a2f3d", socks: "#2a2f3d" },
  { skin: SKIN.light, hair: HAIR.blond, hairStyle: "short", jersey: "#3fb8c9", shorts: "#6a5a4a", socks: "#6a5a4a" },
  { skin: SKIN.dark, hair: HAIR.black, hairStyle: "curly", jersey: "#ff7a2f", shorts: "#2d3a5a", socks: "#2d3a5a" },
  { skin: SKIN.fair, hair: HAIR.brown, hairStyle: "bun", jersey: "#e8443a", shorts: "#2a2f3d", socks: "#2a2f3d" },
  { skin: SKIN.tan, hair: HAIR.black, hairStyle: "none", jersey: "#9aa6b2", shorts: "#3b3f52", socks: "#3b3f52" },
  { skin: SKIN.light, hair: "#e6c07a", hairStyle: "short", jersey: "#2d6fd8", shorts: "#2a2f3d", socks: "#2a2f3d" },
];

/** the cast so far (each episode has its own lead; kept here so a lead can come back looking exactly the same) */
export const CAST: Record<string, Look> = {
  leo_keeper: { skin: "#f2c39b", hair: "#2a1a14", hairStyle: "short", jersey: "#2fbf71", jersey2: "#156d40", shorts: "#1d2b44", socks: "#2fbf71", gloves: "#f5f2ea", number: "1" },
  maya: { skin: "#d99c6c", hair: "#2a1a14", hairStyle: "bun", jersey: "#7c4dd6", jersey2: "#5a32a8", shorts: "#2d3a5a", socks: "#2d3a5a", boots: "#f2f2ee" },
  sam: { skin: "#d99c6c", hair: "#2a1a14", hairStyle: "buzz", jersey: "#f2c230", jersey2: "#c99a12", shorts: "#2d6fd8", socks: "#2d6fd8", boots: "#f2f2ee" },
  zoe: { skin: "#c98a5e", hair: "#1e1410", hairStyle: "bun", jersey: "#2fa89a", jersey2: "#1f7a70", shorts: "#2d3a5a", socks: "#2d3a5a" },
  leo_kitchen: { skin: "#c98a5e", hair: "#1e1410", hairStyle: "curly", jersey: "#e8643a", jersey2: "#b8462a", shorts: "#2d3a5a", socks: "#2d3a5a" },
  ava: { skin: "#8d5a3b", hair: "#1a1010", hairStyle: "bun", jersey: "#2d3a5a", jersey2: "#1f2a44", shorts: "#2d3a5a", socks: "#2d3a5a" },
  // tickle (one family; Theo is the small one: draw him at ~0.75x the adults' scale). Dad wears Glasses (livingroom.tsx).
  theo: { skin: SKIN.brown, hair: HAIR.black, hairStyle: "curly", jersey: "#ffb02e", jersey2: "#e0861a", shorts: "#3a6fd0", socks: "#3a6fd0" },
  nia: { skin: SKIN.brown, hair: HAIR.black, hairStyle: "bun", jersey: "#e85a8a", jersey2: "#b83e68", shorts: "#2d3a5a", socks: "#2d3a5a" },
  dad: { skin: SKIN.brown, hair: HAIR.black, hairStyle: "buzz", jersey: "#6f8a3c", jersey2: "#556b2c", shorts: "#6a5a4a", socks: "#6a5a4a" },
  // toast (cafe). Omar = the guest (blue shirt), Lena = the waiter (cream shirt + Apron from environments25/cafe.tsx).
  omar: { skin: SKIN.tan, hair: HAIR.black, hairStyle: "short", jersey: "#3a7bd5", jersey2: "#2a5aa8", shorts: "#3b3346", socks: "#3b3346" },
  lena: { skin: SKIN.light, hair: HAIR.blond, hairStyle: "bun", jersey: "#f6f1e7", jersey2: "#ddd3c2", shorts: "#2a2f3d", socks: "#2a2f3d" },
  // pole (town square). Mila = the kid on the bike (draw at KID_SCALE ~0.74x, with Helmet from environments25/square.tsx);
  // Grandpa = rust cardigan, grey trousers, FlatCap + Beard (square.tsx).
  mila: { skin: SKIN.fair, hair: HAIR.brown, hairStyle: "curly", jersey: "#8cc63f", jersey2: "#6a9a2c", shorts: "#3a4fb8", socks: "#3a4fb8", boots: "#e8443a" },
  grandpa: { skin: SKIN.fair, hair: HAIR.grey, hairStyle: "short", jersey: "#b5523b", jersey2: "#8f3c2a", shorts: "#6b6f7d", socks: "#6b6f7d", boots: "#5a3a24" },
};
