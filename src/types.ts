// SHARED CONTRACT for the parallel build of episodes 5-7 (written before any agent starts; agents READ this, never edit it).
// House style: brain/style-bible.md + library/style/channel.ts. Channel theme: an everyday tense moment or face-off
// decided by a surprising rule of science/psychology. 2.5D (flat SVG layers + parallax camera), voice Kokoro am_michael.
//
// Ownership (each agent edits ONLY its own paths, so nothing conflicts):
//   script-writer  -> content/scripts/<id>.json  +  episodes/<id>/{script.txt, RESEARCH.md, metadata.json, sound.json, episode.json}
//   asset-library  -> library/**  (new files: environments25/livingroom.tsx, market.tsx, cafe.tsx, lab.tsx; additions to style/channel.ts CAST)
//   scene-builder  -> episodes/<id>/story.tsx  (the "scenes"; imports cues from content/scripts/<id>.json)
//   voice-captions -> content/audio/<id>/ (voice.wav, gitignored) + content/captions/<id>.json (word timings)

/** one shot = one camera set-up, starting on a cue phrase from the narration */
export type SceneShot = {
  id: string;            // fixed by EPISODE_PLANS below (scene-builder draws these ids)
  cue: string;           // first words of the narration line where the shot starts; exact words from script.txt, in order,
                         // unique after the previous cue; plain words only (no digits / hyphenated numbers in a cue)
  place: string;         // = the plan's place (same place -> hard cut, new place -> 7-frame crossfade)
  narration: string;     // the narration spoken during this shot (all shots joined = script.txt)
  onScreenText?: string[]; // short labels drawn in the picture (max ~22 chars per line, only between y 300 and y 1350)
};

/** content/scripts/<id>.json */
export type EpisodeScenes = {
  id: string;
  title: string;
  words: number;          // 150-165 words -> 55-70 s at Kokoro am_michael speed 1.0
  cast: Record<string, string>; // name -> CAST key in library/style/channel.ts
  shots: SceneShot[];
};

/** content/captions/<id>.json (from Kokoro, same engine/voice as the CI render, so the timing matches the final) */
export type CaptionWord = { w: string; s: number; e: number };
export type EpisodeCaptions = { id: string; voice: "am_michael"; seconds: number; words: CaptionWord[] };

export type PlanShot = { id: string; place: string; visual: string };
export type EpisodePlan = { id: string; title: string; setting: string; envFile: string; cast: string[]; facts: string[]; shots: PlanShot[] };

/** The fixed beat sheets. script-writer writes narration that fits these beats in this order (one cue per shot);
 *  scene-builder draws exactly these shot ids; asset-library supplies the props/sets named in `visual`. */
export const EPISODE_PLANS: EpisodePlan[] = [
  {
    id: "tickle", title: "You Can't Tickle Yourself. Here's Why",
    setting: "cosy living room in the evening: sofa, floor lamp, TV glow, rug, family photos", envFile: "library/environments25/livingroom.tsx",
    cast: ["theo (little brother, the family's tickle champion)", "nia (big sister)", "dad"],
    facts: [
      "Your brain predicts the feeling of your own movements and turns it down, so self-touch feels weaker (Blakemore, Wolpert & Frith 1998, Nature Neuroscience; cerebellum)",
      "With a robot between hand and skin, adding a small delay (about 0.2 s) or a changed direction made self-tickles feel more ticklish (Blakemore, Frith & Wolpert 1999)",
      "Someone else's touch can't be predicted the same way, so it tickles",
    ],
    shots: [
      { id: "hook", place: "home", visual: "close on Theo, wiggling fingers, smug grin, snap zoom" },
      { id: "champion", place: "home", visual: "wide living room: Theo tickles Nia and Dad on the sofa, both laughing, cushions flying" },
      { id: "self", place: "home", visual: "Theo tickles his own ribs: blank face, nothing" },
      { id: "harder", place: "home", visual: "Theo tries harder with a feather, frowning, still nothing; camera pushes in" },
      { id: "why", place: "home", visual: "freeze: Theo puzzled, cool grade, question beat" },
      { id: "brain", place: "lab", visual: "lab: cartoon brain sends a move command to a hand AND a copy to a 'forecast' bubble" },
      { id: "forecast", place: "lab", visual: "lab: forecast wave vs real touch wave line up and cancel; feeling meter stays low" },
      { id: "other", place: "lab", visual: "lab: someone else's hand: no forecast, the touch wave spikes, meter jumps" },
      { id: "cerebellum", place: "lab", visual: "lab: brain side view with the cerebellum glowing, one label" },
      { id: "robot", place: "lab2", visual: "lab: a person moves a lever, a robot arm strokes their palm with a foam tip" },
      { id: "delay", place: "lab2", visual: "lab: a 0.2 s delay clock; with the delay the meter rises" },
      { id: "useful", place: "lab3", visual: "lab: footsteps/own voice icons dimmed, a doorbell icon bright (why the brain does it)" },
      { id: "plan", place: "home", visual: "Theo with a cardboard contraption (string + feather + delay crank)" },
      { id: "giggle", place: "home", visual: "it works a little: Theo giggles, Nia rolls her eyes" },
      { id: "ask", place: "home", visual: "pull out wide: the family on the sofa" },
    ],
  },
  {
    id: "first-offer", title: "He Said the Price First and Still Won",
    setting: "sunny Saturday flea market: stalls, bunting, crates of records, an old guitar", envFile: "library/environments25/market.tsx",
    cast: ["kai (seller, old guitar)", "rosa (buyer)"],
    facts: [
      "In negotiation experiments, whoever made the first offer tended to get the better deal, and the first offer strongly predicted the final price (Galinsky & Mussweiler 2001, JPSP) - verify the exact figures",
      "Anchoring: people who saw a wheel stop on 10 vs 65 gave different estimates (Tversky & Kahneman 1974: 25% vs 45%) - verify",
      "Common advice says 'never name the price first'",
    ],
    shots: [
      { id: "hook", place: "market", visual: "close on Kai behind his stall, calm smile, guitar on a stand" },
      { id: "wide", place: "market", visual: "wide flea market, bunting, people browsing" },
      { id: "guitar", place: "market", visual: "close on the old guitar and a blank price tag" },
      { id: "offer", place: "market", visual: "Kai names a high price; a big price tag flips to the number" },
      { id: "gasp", place: "market", visual: "Rosa's shocked face, camera kick" },
      { id: "advice", place: "market", visual: "freeze: a 'never go first' rule card stamped over the scene (one label)" },
      { id: "study", place: "lab", visual: "lab: two negotiators at a table, a first-offer card slides across" },
      { id: "anchor", place: "lab", visual: "lab: a ship's anchor drops onto a price line, the haggling range bends toward it" },
      { id: "wheel", place: "lab2", visual: "lab: wheel of fortune spins to 10 and to 65; two guess bars grow (low / high)" },
      { id: "pull", place: "lab2", visual: "lab: the final-price dot slides toward the anchor end of the slider" },
      { id: "counter", place: "market", visual: "Rosa counters; the price tags meet near the high number" },
      { id: "deal", place: "market", visual: "handshake close-up, guitar handed over" },
      { id: "twist", place: "market2", visual: "later: Rosa at her own stall names her price first, smirking" },
      { id: "ask", place: "market2", visual: "pull out wide over the market" },
    ],
  },
  {
    id: "toast", title: "Your Toast Isn't Unlucky, Your Table Is",
    setting: "bright breakfast cafe in the morning: window, counter, small tables, plates, mugs", envFile: "library/environments25/cafe.tsx",
    cast: ["omar (cafe guest)", "lena (waiter)"],
    facts: [
      "Physicist Robert Matthews (1995, European Journal of Physics): toast sliding off a normal table only has time for about half a turn, so it lands butter side down - verify",
      "A table would need to be far taller (about 3 m) for a full turn - verify the figure",
      "A 2001 UK school experiment with ~9,821 drops: ~62% landed butter side down - verify",
      "The work won an Ig Nobel Prize (physics, 1996) - verify",
    ],
    shots: [
      { id: "hook", place: "cafe", visual: "slow-motion close-up: buttered toast tipping over a table edge" },
      { id: "wide", place: "cafe", visual: "wide cafe morning, Omar at a small table, Lena with a coffee pot" },
      { id: "slide", place: "cafe", visual: "Omar's elbow nudges the plate; the toast slides" },
      { id: "fall", place: "cafe", visual: "slow-mo fall, toast half-turning, speed lines" },
      { id: "splat", place: "cafe", visual: "SPLAT: butter side down on the floor, camera kick, Omar's face" },
      { id: "curse", place: "cafe", visual: "storm cloud over Omar, 'MURPHY'S LAW' label" },
      { id: "physicist", place: "lab", visual: "lab: a physics paper card '1995' drops in" },
      { id: "tip", place: "lab", visual: "lab: toast pivoting on the table edge, rotation arrow" },
      { id: "half", place: "lab", visual: "lab: fall path with toast snapshots: only half a turn before the floor" },
      { id: "height", place: "lab2", visual: "lab: normal table (75 cm) next to a giant 3 m table; full turn only on the giant" },
      { id: "test", place: "lab3", visual: "lab: 9,821 drops counter + a 62% butter-down bar" },
      { id: "fix", place: "cafe", visual: "Lena flicks a falling toast with a hard push - it spins further (or catches it)" },
      { id: "twist", place: "cafe", visual: "Omar eats standing at a very tall counter, smug" },
      { id: "ask", place: "cafe", visual: "pull out wide over the cafe" },
    ],
  },
];
