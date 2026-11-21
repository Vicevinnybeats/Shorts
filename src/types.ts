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
  {
    id: "pole", title: "Stop Looking at the Pole",
    setting: "sunny town square / park path with one lonely lamp post, benches, pigeons, a fountain", envFile: "library/environments25/square.tsx",
    cast: ["mila (kid learning to ride a bike)", "grandpa (running behind, holding the seat)"],
    facts: [
      "Steering follows gaze: people tend to steer where they look (Land & Lee 1994, Nature, tangent point while driving; Wilkie & Wann 2003, gaze and steering) - verify",
      "Riders and drivers are taught 'look where you want to go, not at what you want to avoid' (target fixation) - verify a credible source (e.g. motorcycle safety training)",
      "Find the most solid, citable finding; soften anything that is only folk wisdom",
    ],
    shots: [
      { id: "hook", place: "square", visual: "wide empty square: one lamp post, Mila on a bike heading straight at it, comedic slow push" },
      { id: "learn", place: "square", visual: "Grandpa jogging behind holding the seat, Mila wobbling, determined" },
      { id: "letgo", place: "square", visual: "Grandpa lets go, Mila rides alone, joy" },
      { id: "spot", place: "square", visual: "Mila's eyes lock onto the pole (eye close-up), dotted gaze line to the pole" },
      { id: "drift", place: "square", visual: "the bike curves toward the pole as if pulled by a magnet" },
      { id: "bonk", place: "square", visual: "BONK: gentle crash into the pole, pigeons scatter, camera kick, Grandpa facepalm" },
      { id: "why", place: "square", visual: "freeze frame, cool grade, question beat" },
      { id: "eyes", place: "lab", visual: "lab: top view of a road, an eye with a gaze cone and the steering wheel turning toward where it points" },
      { id: "drivers", place: "lab", visual: "lab: a driver's view of a curve, the tangent point marked, gaze dot and wheel linked" },
      { id: "magnet", place: "lab2", visual: "lab: bike path bending toward an obstacle the eyes are fixed on (target fixation)" },
      { id: "rule", place: "lab3", visual: "lab: two paths: eyes on the gap -> safe line; eyes on the pole -> crash line" },
      { id: "retry", place: "square", visual: "Mila tries again, looking at the gap between pole and bench, sails through" },
      { id: "twist", place: "square", visual: "Grandpa on the bike, staring at the pole, wobbling toward it" },
      { id: "ask", place: "square", visual: "pull out wide over the square" },
    ],
  },
  {
    id: "silent", title: "Why the Silent Player Took Everything",
    setting: "cosy board-game night around a table: board, cards, snacks, fairy lights", envFile: "library/environments25/gamenight.tsx",
    cast: ["june (the quiet one)", "max (the talker)", "two friends"],
    facts: [
      "Strategic silence in negotiation: pausing (e.g. a few seconds) after an offer led to better, more value-creating deals (Curhan, Overbeck, Cho, Zhang & Yang 2022, Journal of Applied Psychology, 'Silence is golden') - verify the exact findings and wording",
      "People tend to fill awkward silences, often by conceding or adding information - verify or soften",
      "Do NOT claim the quiet player 'always wins'; keep it to what the study shows",
    ],
    shots: [
      { id: "hook", place: "table", visual: "close on June's calm face behind a fan of cards, the others shouting behind" },
      { id: "wide", place: "table", visual: "wide game night table: Max talking with big gestures, friends laughing, June quiet" },
      { id: "offer", place: "table", visual: "Max offers a trade, card held out" },
      { id: "pause", place: "table", visual: "June says nothing: a ticking clock bubble over the table, everyone frozen" },
      { id: "cave", place: "table", visual: "Max squirms and sweetens the deal, adding more cards" },
      { id: "why", place: "table", visual: "freeze frame, question beat" },
      { id: "study", place: "lab", visual: "lab: two negotiators, a 3-second silence bar between them" },
      { id: "think", place: "lab", visual: "lab: a pause bubble turns into lightbulbs (more ideas, bigger pie)" },
      { id: "pie", place: "lab2", visual: "lab: a pie chart grows bigger for both sides after the pause" },
      { id: "fill", place: "lab3", visual: "lab: an awkward-silence meter rising, a speech bubble rushing in to fill it" },
      { id: "win", place: "table", visual: "June collects the cards, quiet smile; Max stares" },
      { id: "twist", place: "table", visual: "Max tries silence, lasts one second, blurts out" },
      { id: "ask", place: "table", visual: "pull out wide over the game night" },
    ],
  },
  {
    id: "winner", title: "The Winner Paid the Most and Lost",
    setting: "school charity auction in a gym hall: stage, bunting, rows of folding chairs, a big glass jar full of coins on a table", envFile: "library/environments25/auction.tsx",
    cast: ["ben (eager bidder)", "auctioneer (with gavel)", "a crowd of parents bidding"],
    facts: [
      "Winner's curse: in an auction for an item of unknown value, the winner tends to be the one who overestimated it most, so the winning bid is often above the true value (Capen, Clapp & Campbell 1971, oil leases; Thaler 1988) - verify",
      "Classroom jar-of-coins auctions: average bid below the jar's value, but the winning bid above it (Bazerman & Samuelson 1983, 'I won the auction but don't want the prize', jar worth $8, average winning bid about $10) - verify the exact figures",
      "The fix: bid less than your own estimate, more so when there are many bidders - verify wording",
    ],
    shots: [
      { id: "hook", place: "hall", visual: "close on Ben, triumphant, arms up, confetti, the gavel bangs - but his smile freezes" },
      { id: "wide", place: "hall", visual: "wide school hall auction: stage, bunting, crowd on folding chairs, the coin jar on a table" },
      { id: "jar", place: "hall", visual: "slow push on the big coin jar, a question mark tag 'HOW MUCH?'" },
      { id: "bidding", place: "hall", visual: "paddles shooting up one after another, the price counter climbing" },
      { id: "win", place: "hall", visual: "gavel bangs, 'SOLD' sign, Ben cheers" },
      { id: "count", place: "hall", visual: "Ben counts the coins on the table: the pile is smaller than what he paid; his face drops" },
      { id: "why", place: "hall", visual: "freeze, cold grade, question beat" },
      { id: "guesses", place: "lab", visual: "lab: many guess markers scattered around the true value line; the average sits close to it" },
      { id: "highest", place: "lab", visual: "lab: the highest guess glows - the winner is always the biggest overestimate" },
      { id: "study", place: "lab2", visual: "lab: jar experiment card: true value vs average bid vs winning bid as three bars" },
      { id: "oil", place: "lab3", visual: "lab: oil-field auction icons (where it was first noticed), a derrick over a map" },
      { id: "fix", place: "lab3", visual: "lab: a bid slider: your estimate, then step back below it; more bidders -> step back further" },
      { id: "twist", place: "hall", visual: "next year: Ben bids low and calmly loses to an excited parent, smirking" },
      { id: "ask", place: "hall", visual: "pull out wide over the hall" },
    ],
  },
  {
    id: "pizza", title: "Two Pizzas or One? Everyone Gets It Wrong",
    setting: "busy neighbourhood pizzeria in the evening: counter with a menu board (shapes, sizes only), wood-fired oven glow, pizza boxes stacked, red-and-white tiles", envFile: "library/environments25/pizzeria.tsx",
    cast: ["lucas (orders two mediums, sure he's clever)", "amira (orders one large)", "pizzaiolo behind the counter"],
    facts: [
      "Pizza area grows with the square of the radius (area = pi r squared), so doubling the diameter gives four times the pizza - basic geometry",
      "Classic example: one 18-inch pizza has more pizza than two 12-inch pizzas (about 254 vs 226 square inches) - verify the numbers",
      "People tend to judge size by diameter (a 'linear' bias) and underestimate how fast area grows - find a credible source (e.g. psychology of area/size judgement, or a well-sourced article on pizza pricing); soften if only anecdotal",
      "Price per square inch usually favours the large pizza - phrase carefully (often, not always)",
    ],
    shots: [
      { id: "hook", place: "shop", visual: "close on two medium pizza boxes vs one large box, Lucas smug, Amira smirking" },
      { id: "wide", place: "shop", visual: "wide busy pizzeria, oven glow, Lucas and Amira at the counter" },
      { id: "order", place: "shop", visual: "Lucas orders two mediums, holding up two fingers; Amira points at one large" },
      { id: "boxes", place: "shop", visual: "boxes slide onto the counter side by side; Lucas grins at his stack" },
      { id: "open", place: "shop", visual: "both lids open; the single large looks surprisingly huge" },
      { id: "why", place: "shop", visual: "freeze, cold grade, question beat" },
      { id: "diameter", place: "lab", visual: "lab: two circles, one twice as wide, a ruler on the diameter only" },
      { id: "area", place: "lab", visual: "lab: the big circle fills with small circles: four of the small ones fit inside" },
      { id: "numbers", place: "lab2", visual: "lab: one 18-inch vs two 12-inch, area counters count up and stop, the big one wins" },
      { id: "brain", place: "lab3", visual: "lab: an eye/brain judging by width (a ruler) instead of area (a filled shape)" },
      { id: "price", place: "lab3", visual: "lab: price per slice/area bars: the large is cheaper per bite" },
      { id: "twist", place: "shop", visual: "Lucas orders one large next time... and a second one, 'just in case'" },
      { id: "ask", place: "shop", visual: "pull out wide over the pizzeria" },
    ],
  },
  {
    id: "gta-army", title: "43 Soldiers Re-Enlisted. The Headline Was GTA 6",
    setting: "generic army-base career counselor office (no insignia, no logos): desk, flag-free wall board, calendar, filing cabinets, window onto a sunny base; plus a university gym, a park running path and Kai's living room", envFile: "library/environments25/army.tsx",
    cast: ["counselor (career counselor, camo shirt)", "soldier1 (signs the contract)", "soldier2 (second soldier)", "kai (hates running, headphones)"],
    facts: [
      "Fort Stewart, Georgia (3rd ID, 9th Brigade Engineer Battalion): soldiers who re-enlisted by Nov 14 got a special 4 day pass timed to GTA VI (Nov 19); minimum 2 more years; a career counselor's idea (Military Times 2026-08-19, Stars and Stripes 2026-08-21)",
      "43 of 130 eligible soldiers chose the pass; standard re-enlistment incentives still applied, one soldier got over $60,000 in bonuses (Axios 2026-11-19, Task & Purpose) - never say they re-enlisted 'just for' the game",
      "Temptation bundling (Milkman, Minson & Volpp 2014, Management Science 60(2)): gym-only access to gripping audiobooks -> 51% more gym visits than control at first; the effect faded over time",
    ],
    shots: [
      { id: "hook", place: "office", visual: "close on a soldier signing the contract at the counselor's desk; a pass card pops up beside the pen" },
      { id: "headline", place: "office", visual: "headline-style words slam in over the office: '4 DAYS OF GAMING'" },
      { id: "fort", place: "office", visual: "wide establishing office: counselor at the desk, window onto a sunny base, 'FORT STEWART, GEORGIA'" },
      { id: "offer", place: "office", visual: "wall calendar with NOV 14 circled, a '4 DAY PASS' card slides out next to it, 'GTA 6' as plain words" },
      { id: "count", place: "office", visual: "rows of small soldier figures: 130 grey, 43 fill in colour one row after another, '43 OF 130'" },
      { id: "bonus", place: "office", visual: "a tall bonus stack '$60,000+' towers over the small pass card; the soldier glances between them" },
      { id: "why", place: "office", visual: "freeze, cold grade, question beat: 'WHY THE PASS?'" },
      { id: "carry", place: "lab", visual: "lab: a see-saw / scale where a bright 'WANT' block lifts and carries a heavy grey 'SHOULD' block" },
      { id: "gym", place: "gym", visual: "university gym: a member on a treadmill with headphones; the audiobook is padlocked to the gym (lock icon on the door)" },
      { id: "result", place: "lab", visual: "lab: gym-visit bars, the bundled bar rises +51% and stops; then an 'AT FIRST' stamp lands as the bar sags" },
      { id: "name", place: "lab", visual: "lab: 'TEMPTATION BUNDLING' card: an 'AVOID' icon and a 'CRAVE' icon snap together with a plus" },
      { id: "kai", place: "park", visual: "park path: Kai runs in profile with headphones, a podcast icon with 'RUNS ONLY' tag" },
      { id: "weeks", place: "park", visual: "week 1: Kai running happily; week 4: he slows, scrolling for a new podcast" },
      { id: "ask", place: "home", visual: "Kai's living room, headphones on the sofa, he looks to camera: what would you bundle? pull out wide" },
    ],
  },
  {
    id: "gta-ufo", title: "GTA 6 Has a UFO. Your Eyes Can Make One Too",
    setting: "night campsite under a starry sky (tent, campfire, pines, one bright light), a dark country road for the hook (our own generic saucer, no game art or logos), the LAB and a 1930s dark room", envFile: "episodes/gta-ufo/story.tsx (camp drawn locally)",
    cast: ["kai (sees the light drift, then lines it up with a branch)", "nia (spots the light, stays unconvinced)", "a 1930s volunteer in the dark room"],
    facts: [
      "GTA 6: player guides report a UFO encounter can start on a quiet road after 2:00 AM ('players say', not guaranteed) (theclick.gg, GTA-Xtreme, Eurogamer)",
      "Autokinetic effect: a still small light in a dark featureless field seems to move without a frame of reference; recorded by Adams 1912 (>100 years); Sherif 1935 dark-room studies",
      "AARO (Pentagon) Historical Record Report Vol. I, March 2024: reviewed 1945-Oct 2023, no evidence of extraterrestrial technology, mostly misidentified ordinary objects (NPR, Space.com)",
      "'It's a planet' is the fictional twist; no statistic claimed",
    ],
    shots: [
      { id: "hook", place: "road", visual: "generic flying saucer hovering over a dark country road at night, 'GTA 6 · PLAYERS SAY: AFTER 2 AM'" },
      { id: "eyes", place: "road", visual: "push past the saucer to a big eye; the saucer shrinks to a single dot of light" },
      { id: "camp", place: "camp", visual: "wide night campsite: tent, campfire, Kai and Nia by the fire, stars; '2:00 AM'" },
      { id: "point", place: "camp", visual: "Nia points up; the light drifts left, then down, leaving a dashed path line" },
      { id: "phone", place: "camp", visual: "close on Kai's phone screen: the light sits perfectly still on a grid" },
      { id: "wait", place: "camp", visual: "cold freeze: Kai and Nia look at each other, 'DID IT MOVE?'" },
      { id: "jitter", place: "lab", visual: "lab: eye with tiny jitter arrows; then a lone dot in black space 'NO REFERENCE'" },
      { id: "name", place: "lab", visual: "lab: brain arrow blames the light; 'AUTOKINETIC EFFECT' card, '100+ YEARS'" },
      { id: "darkroom", place: "darkroom", visual: "1930s dark room: a seated volunteer watches one still dot; a wandering path draws" },
      { id: "branch", place: "camp", visual: "a branch next to the light: the light locks still, 'REFERENCE = STILL'" },
      { id: "pentagon", place: "lab", visual: "lab review card: '1945-2023', 'NO ALIEN TECH FOUND', 'MOSTLY ORDINARY THINGS' icons" },
      { id: "twist", place: "camp", visual: "next night: Kai lines the light up with a branch, 'PLANET' reveals; Nia crosses her arms" },
      { id: "ask", place: "camp", visual: "pull out wide over the campsite and the sky: what have you seen?" },
    ],
  },
  {
    id: "gta-redlight", title: "He Can Do Anything in GTA 6. He Still Stops at Red Lights",
    setting: "evening living room (sofa, our own drawn TV road with a car and traffic light, no game art or logos), the LAB and a morning kitchen with two upper cupboards", envFile: "library/environments25/livingroom.tsx + kitchen.tsx + lab.tsx (TV, cupboards drawn in episodes/gta-redlight/story.tsx)",
    cast: ["kai (stops at every red light in the game, opens the old cupboard three times)", "nia (shouts GO!, moves the cereal)"],
    facts: [
      "PC Gamer 2026-11-19 headline 'Help: I can't stop obeying traffic laws in GTA 6' (quoted only, plain card, no logo)",
      "Wood, Quinn & Kashy 2002 (JPSP): hourly diary studies with students; ~43% of actions were habits in one study (35% in the other); done almost daily, same place, mind elsewhere",
      "Cue -> action framing (Wood & Neal 2007); password and cereal are everyday comparisons; the cupboard twist is fiction",
    ],
    shots: [
      { id: "hook", place: "living", visual: "close on the TV: red light, our car stopped at the line; 'GTA 6: ANYTHING GOES' vs 'HE STILL STOPS'; a blue car blasts through" },
      { id: "launch", place: "living", visual: "wide sofa: Nia hands Kai the controller 'LAUNCH WEEK'; cut to the TV road speeding; medium Kai in red glow brakes 'HE STOPS'" },
      { id: "go", place: "living", visual: "medium two-shot: Nia stares, shrugs, arms up 'GO!' bubble; Kai frozen" },
      { id: "green", place: "living", visual: "close on the TV light: it turns green, only then the car rolls, 'WAITS FOR GREEN'" },
      { id: "headline", place: "lab", visual: "'NOT ALONE' rows of stopped cars; plain headline card 'HELP: I CAN'T STOP OBEYING TRAFFIC LAWS', 'IN GTA 6' stamp" },
      { id: "rules", place: "living", visual: "close on Kai's hands on the controller: finger creeps to the gas and pulls back, 'IT'S A GAME', sweat drop" },
      { id: "habit", place: "lab", visual: "fork in the road 'CHOICE?' greys out with a red X; one gold groove, 'HABIT' stamp" },
      { id: "diary", place: "lab", visual: "hourly diary card filling row by row with a pencil, 'HOUR BY HOUR'" },
      { id: "study", place: "lab", visual: "10x10 grid fills 43 cells, '43% HABITS (ONE STUDY)'; rows ALMOST DAILY / SAME PLACE / MIND ELSEWHERE with icons" },
      { id: "loop", place: "lab", visual: "winding path vs gold shortcut; CUE (red light) -> ACTION (foot on brake pedal)" },
      { id: "password", place: "lab", visual: "hands typing on a keyboard, password dots fill, check 'FINGERS: KNOW IT', then 'YOU: ?'" },
      { id: "cereal", place: "kitchen", visual: "morning kitchen: Nia moves the cereal to the new cupboard; Kai opens the old one three times, counter 1, 2, 3" },
      { id: "ask", place: "living", visual: "Kai on the sofa with the cereal bowl looks to camera, pull out: what do you do on autopilot?" },
    ],
  },
  {
    id: "gta-radio", title: "You'll Love the GTA 6 Song You Hate. Here's Why",
    setting: "night car interior seen from the dashboard, an evening road (side view), a night street (front view through the windshield), a radio close-up, a kitchen behind a foreground island counter and the LAB (all drawn in story.tsx; no game art, logos, real songs or artists)", envFile: "library/environments25/kitchen.tsx + lab.tsx (car, radio, road drawn in episodes/gta-radio/story.tsx)",
    cast: ["kai (hates the track on Monday, sings it by Friday, changes the station in week 3)", "nia (catches him humming)"],
    facts: [
      "Kotaku 2026-11-19: GTA 6's pop and classic rock radio stations contain 150 songs (attributed; no titles or artists)",
      "Zajonc 1968 (JPSP Monograph): nonsense words/symbols shown 0, 1, 2, 5, 10 or 25 times; more exposure -> more liking (mere exposure effect)",
      "Music: later studies (Szpunar et al. 2004; Schellenberg et al. 2008) found an inverted U: liking falls after too many plays; joke and station change are fiction",
    ],
    shots: [
      { id: "hook", place: "car", visual: "close from the dashboard: Kai behind the wheel, radio 'TRACK 1' with notes; groan 'MONDAY: HATES IT' -> sings 'FRIDAY: SINGS IT'" },
      { id: "drive", place: "road", visual: "side view: red car on an evening road, palms and skyline scroll; radio waves and notes, 'GTA 6 LAUNCH WEEK', 'RADIO: ALWAYS ON'" },
      { id: "count", place: "lab", visual: "'KOTAKU COUNTED', 150 song tiles fill while '150 SONGS' counts; POP and CLASSIC ROCK dials" },
      { id: "again", place: "street", visual: "front view through the windshield at night: 'PLAYED: 1, 2, 3', Kai groans 'AGAIN?' bubble, 'STAYS ON'" },
      { id: "day5", place: "kitchen", visual: "kitchen behind the island: Kai hums eyes closed with notes, Nia steps in; 'DAY 5', 'HUMMING IT'" },
      { id: "what", place: "kitchen", visual: "close on Nia: 'HE HATED IT' -> 'WHAT CHANGED?' with a '?'" },
      { id: "notsong", place: "lab", visual: "song card 'SAME SONG' vs play button with tally marks 'HOW OFTEN'" },
      { id: "zajonc", place: "lab", visual: "1968 index card 'ROBERT ZAJONC' with a magnifier; six strange-symbol tiles, counts x0 x1 x2 x5 x10 x25" },
      { id: "liking", place: "lab", visual: "six bars rise with hearts, 'LIKING' -> 'MORE SEEN = MORE LIKED'" },
      { id: "effect", place: "lab", visual: "blinking eye 'MERE EXPOSURE' 'EFFECT' stamp; eye = shield = heart 'FAMILIAR = SAFE = GOOD'" },
      { id: "curve", place: "lab", visual: "radio 'MUSIC TOO'; inverted-U curve with a shining note 'UP TO A POINT', falls red 'TOO MANY PLAYS'" },
      { id: "joke", place: "lab", visual: "'LAUGH-O-METER' gauges: 2ND needle green FUNNY, 10TH needle red ANNOYING" },
      { id: "week3", place: "radio", visual: "radio close-up: 'WEEK 3', 'PLAYED: TOO MANY'; Kai's hand turns the dial, static, 'ST 2', 'NEW STATION'" },
      { id: "ask", place: "kitchen", visual: "Kai alone behind the island, blue notes from a small radio, pull back, 'HATE → LOVE?'" },
    ],
  },
  {
    id: "wi-gta-nosleep", title: "What If You Played GTA 6 for 30 Days Straight?",
    setting: "WHAT IF series, Golden Neon look: black stages, gold/coral glowing line art, HUD (live counter, compare bars, chapter screens, choice cards, phone); no game art or logos", envFile: "library/whatif/kit.tsx + figure.tsx",
    cast: ["remy (fictional gamer, neon silhouette: hoodie + beanie tuft)", "randy (Randy Gardner 1964, neon silhouette, no photo)"],
    facts: [
      "Williamson & Feyer 2000: after 17-19 h awake, some tests as bad as BAC 0.05% (limit in many countries)",
      "Randy Gardner, 17, San Diego, 1964: 264 h (~11 days) awake; memory/mood, reported hallucinations; slept ~14 h; Guinness stopped accepting attempts",
      "Microsleeps: involuntary seconds-long sleep during deprivation (NHLBI); Remy and the car drift are fiction",
    ],
    shots: [
      { id: "hook", place: "room", visual: "title sting: WHAT IF neon letters draw on over a dark room, Remy on the couch with a controller lit by TV glow, counter HOURS AWAKE 000 / DAY 1, 30 DAYS OF GTA 6? NO SLEEP" },
      { id: "crash", place: "cards", visual: "A/B/C/D choice cards WHERE DO YOU CRASH FIRST? (HOUR 17, DAY 2, DAY 3, NEVER), selector runs" },
      { id: "hour0", place: "table", visual: "chapter HOUR 0 punch-in; snack pile stacks, phone notifications go SILENT, Remy waves READY." },
      { id: "hour17", place: "face", visual: "close-up on Remy's face, counter ticks to 017, YOU FEEL FINE -> YOU'RE NOT. heavy lids" },
      { id: "study", place: "bars", visual: "compare bars 17-19 H AWAKE vs OVER THE LIMIT (0.05%), AS BAD ON SOME TESTS" },
      { id: "hour24", place: "road", visual: "line-art car drifting on a neon road; a giant head outline draws around it (IN YOUR HEAD)" },
      { id: "day2", place: "bubbles", visual: "chapter DAY 2; Remy dizzy, word bubbles scramble SIMPLE / WORDS" },
      { id: "day3", place: "floor", visual: "high wide: Remy slumped among wrappers, mission marker dissolves (MISSION ???), queasy sway" },
      { id: "real", place: "file", visual: "NOT A GUESS stamp, year rolls 2026->1964, neon ID card with Randy silhouette RANDY GARDNER, 17 / SAN DIEGO" },
      { id: "symptoms", place: "file", visual: "checklist WHAT SLIPPED: MEMORY, MOOD, SEES THINGS (REPORTED); dotted ghost shapes around Randy" },
      { id: "record", place: "count", visual: "counter 264 H, = 11 DAYS boxes, GUINNESS: NO MORE ATTEMPTS, TOO DANGEROUS" },
      { id: "day30", place: "calendar", visual: "DAY 30 chapter glitches, UNREACHABLE, calendar lights to 11 then crossed out" },
      { id: "micro", place: "eyes", visual: "extreme close on Remy's eyes, lids droop, screen blinks black (MICROSLEEP)" },
      { id: "slept", place: "bed", visual: "Randy asleep in bed, Zzz, clock spins 14 h, SLEPT 14 H" },
      { id: "speedrun", place: "loop", visual: "dotted loop with PLAY / SLEEP / REPEAT icons lit on cue" },
      { id: "ask", place: "spot", visual: "Remy waves under the spotlight; YOUR RECORD ??? H, LONGEST YOU'VE STAYED AWAKE?" },
    ],
  },
];
