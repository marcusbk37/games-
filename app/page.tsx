import Link from "next/link";
import {
  allGames,
  LOGIC_LOCK_HUB_ID,
  LOGIC_LOCK_VARIANT_IDS,
  WORD_LADDER_HUB_ID,
  WORD_LADDER_VARIANT_IDS
} from "../games";

const displayGames = allGames.filter(
  (g) =>
    !LOGIC_LOCK_VARIANT_IDS.includes(g.id as (typeof LOGIC_LOCK_VARIANT_IDS)[number]) &&
    !WORD_LADDER_VARIANT_IDS.includes(g.id as (typeof WORD_LADDER_VARIANT_IDS)[number])
);
const logicLockHubEntry = {
  id: LOGIC_LOCK_HUB_ID,
  name: "Logic Lock",
  description:
    "Four variants on one page: Mini (2 dials), Classic (3), Plus (4), Max (5). Same playstyle, scroll to play any."
};
const wordLadderHubEntry = {
  id: WORD_LADDER_HUB_ID,
  name: "Word Ladder",
  description:
    "Cold to Warm and Custom Word Ladder. Change one letter at a time to get from one word to another."
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-lg shadow-slate-950/60">
        <h2 className="text-lg font-semibold mb-2">Welcome</h2>
        <p className="text-sm text-slate-300">
          Pick a game to play, or use this as a playground to build new puzzles in TypeScript.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Create
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/worldforge"
            className="group rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-400 hover:bg-slate-900 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <h3 className="font-medium text-slate-50 group-hover:text-emerald-100">
              WorldForge
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Build a world + character, then explore your creation.
            </p>
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Games
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            key={logicLockHubEntry.id}
            href={`/games/${logicLockHubEntry.id}`}
            className="group rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-400 hover:bg-slate-900 hover:shadow-lg hover:shadow-sky-500/20"
          >
            <h3 className="font-medium text-slate-50 group-hover:text-sky-100">
              {logicLockHubEntry.name}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {logicLockHubEntry.description}
            </p>
          </Link>
          <Link
            key={wordLadderHubEntry.id}
            href={`/games/${wordLadderHubEntry.id}`}
            className="group rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-400 hover:bg-slate-900 hover:shadow-lg hover:shadow-sky-500/20"
          >
            <h3 className="font-medium text-slate-50 group-hover:text-sky-100">
              {wordLadderHubEntry.name}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {wordLadderHubEntry.description}
            </p>
          </Link>
          {displayGames.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-400 hover:bg-slate-900 hover:shadow-lg hover:shadow-sky-500/20"
            >
              <h3 className="font-medium text-slate-50 group-hover:text-sky-100">
                {game.name}
              </h3>
              <p className="mt-1 text-xs text-slate-400">{game.description}</p>
            </Link>
          ))}
          {displayGames.length === 0 && (
            <p className="text-sm text-slate-400">
              No other games yet. Create one under <code>games/</code> to see it here.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

