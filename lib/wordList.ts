/**
 * Word lists for word-ladder games. Words grouped by length.
 * Neighbors = same-length words differing by exactly one letter.
 */

const WORDS_4 = [
  "COLD", "CORD", "CARD", "WARD", "WARM", "WORD", "WORM", "WORE", "GOLD",
  "BOLD", "SOLD", "BOLT", "COLT", "JOLT", "MOLT", "VOLT", "BORE", "CORE",
  "BARE", "CARE", "DARE", "FARE", "MARE", "PARE", "WARE", "WAGE", "WAVE",
  "CAVE", "EAVE", "HAVE", "SAVE", "WAVE", "GATE", "HATE", "LATE", "MATE",
  "RATE", "DATE", "FATE", "PATE", "SATE", "BAKE", "CAKE", "FAKE", "LAKE",
  "MAKE", "RAKE", "TAKE", "WAKE", "BANE", "LANE", "MANE", "PANE", "SANE",
  "BALL", "CALL", "FALL", "HALL", "MALL", "PALL", "TALL", "WALL", "BELL",
  "CELL", "FELL", "HELL", "SELL", "TELL", "WELL", "BIKE", "HIKE", "LIKE",
  "MIKE", "PIKE", "SIKE", "TILE", "BILE", "FILE", "MILE", "RILE", "VILE",
  "WINE", "BINE", "DINE", "FINE", "LINE", "MINE", "NINE", "PINE", "SINE",
  "TINE", "VINE", "KIND", "BIND", "FIND", "HIND", "MIND", "RIND", "WIND",
  "BENT", "CENT", "DENT", "GENT", "LENT", "PENT", "RENT", "SENT", "TENT",
  "VENT", "WENT", "BEST", "REST", "NEST", "PEST", "TEST", "WEST", "JEST",
  "LEST", "VEST", "FIST", "LIST", "MIST", "WIST", "GIST", "KISS", "MISS",
  "HISS", "DISH", "FISH", "WISH", "BUSH", "GUSH", "HUSH", "LUSH", "MUSH",
  "PUSH", "RUSH", "DUCK", "LUCK", "MUCK", "PUCK", "RUCK", "TUCK", "SUCK",
  "BACK", "HACK", "JACK", "LACK", "PACK", "RACK", "SACK", "TACK", "WACK"
];

const WORDS_5 = [
  "HEART", "HEART", "HEARD", "BEARD", "WEARD", "TEARY", "WEARY", "DEARY",
  "PEARL", "EARLY", "EARLS", "HEARS", "HEATS", "HEATH", "DEATH", "NEATH",
  "WHEAT", "CHEAT", "CLEAT", "PLEAT", "GREAT", "TREAT", "SWEAT", "THREAT",
  "STONE", "ATONE", "STORE", "STORE", "STORK", "STORM", "STORY", "STOLE",
  "STOOD", "STOOL", "STOOP", "STOUT", "STOVE", "START", "STARE", "STARK",
  "STARS", "STAMP", "STALK", "STALL", "STALE", "STAGE", "STAKE", "STACK",
  "BLACK", "SLACK", "CLACK", "FLACK", "CRACK", "TRACK", "SMACK", "SNACK",
  "BRAKE", "BLAKE", "BLAZE", "GRAZE", "CRAZE", "GRACE", "TRACE", "BRACE",
  "GRACE", "PLACE", "SPACE", "PEACE", "CRANE", "PRANE", "DRANE", "FRAME",
  "CRAME", "FLAME", "BLAME", "GLARE", "BLARE", "FLARE", "STARE", "SHARE",
  "SNARE", "SPARE", "SCARE", "STORE", "SNORE", "SPORE", "SCORE", "CHORE",
  "WHORE", "SHORE", "STOLE", "WHOLE", "THOLE", "SHOLE", "STOKE", "SMOKE",
  "SPOKE", "STONE", "PRONE", "DRONE", "CRONE", "PHONE", "SHONE", "ALONE",
  "ATONE", "STUNG", "STUNS", "STUBS", "STUDS", "STUFF", "STUMP", "STUMS",
  "BLIMP", "CLAMP", "CRAMP", "TRAMP", "STAMP", "SWAMP", "CLUMP", "PLUMP",
  "SLUMP", "BUMPY", "DUMPY", "JUMPY", "LUMPY", "GUARD", "GUARD", "GUAVA",
  "QUAFF", "QUAIL", "QUAKE", "QUALM", "QUASH", "QUASI", "QUAYS", "QUEEN",
  "QUEER", "QUELL", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUILL",
  "QUILT", "QUIRK", "QUITE", "QUITS", "QUOTA", "QUOTE", "WORDS", "SWORD",
  "WOULD", "COULD", "SHOULD", "MOUND", "ROUND", "SOUND", "WOUND", "BOUND",
  "FOUND", "HOUND", "POUND", "STONE", "PRONE", "DRONE", "ZONES", "CONES",
  "BONES", "TONES", "HONES", "PONES", "NONES", "LONER", "GONER", "HONER"
];

const BY_LENGTH: Record<number, string[]> = {
  4: [...new Set(WORDS_4)].filter((w) => w.length === 4).map((w) => w.toUpperCase()),
  5: [...new Set(WORDS_5)].filter((w) => w.length === 5).map((w) => w.toUpperCase())
};

export function getWordsByLength(len: number): string[] {
  return BY_LENGTH[len] ?? [];
}

export function getNeighbors(word: string, words: string[]): string[] {
  const w = word.toUpperCase();
  if (w.length !== word.length) return [];
  return words.filter(
    (c) =>
      c !== w &&
      c.length === w.length &&
      [...c].filter((ch, i) => ch !== w[i]).length === 1
  );
}

export function findPath(
  start: string,
  end: string,
  words: string[]
): string[] | null {
  const s = start.toUpperCase();
  const e = end.toUpperCase();
  if (s === e) return [s];
  if (!words.includes(s) || !words.includes(e)) return null;
  const seen = new Set<string>([s]);
  const queue: { word: string; path: string[] }[] = [{ word: s, path: [s] }];
  while (queue.length > 0) {
    const { word, path } = queue.shift()!;
    for (const next of getNeighbors(word, words)) {
      if (next === e) return [...path, next];
      if (!seen.has(next)) {
        seen.add(next);
        queue.push({ word: next, path: [...path, next] });
      }
    }
  }
  return null;
}

export function validateLadderConfig(
  start: string,
  end: string,
  maxMoves: number
): { ok: true; path: string[] } | { ok: false; error: string } {
  const s = start.trim().toUpperCase();
  const e = end.trim().toUpperCase();
  if (!s || !e) return { ok: false, error: "Enter both start and end words." };
  if (s.length !== e.length)
    return { ok: false, error: "Start and end words must be the same length." };
  if (s === e) return { ok: false, error: "Start and end must be different." };
  const supported = [4, 5];
  if (!supported.includes(s.length))
    return {
      ok: false,
      error: `Word length ${s.length} not supported. Use 4 or 5 letters.`
    };
  const words = getWordsByLength(s.length);
  if (!words.includes(s))
    return { ok: false, error: `"${s}" is not in the word list.` };
  if (!words.includes(e))
    return { ok: false, error: `"${e}" is not in the word list.` };
  const path = findPath(s, e, words);
  if (!path)
    return { ok: false, error: "No path found between these words." };
  if (path.length - 1 > maxMoves)
    return {
      ok: false,
      error: `Shortest path has ${path.length - 1} steps. Increase max moves (e.g. ${path.length}) or pick different words.`
    };
  return { ok: true, path };
}
