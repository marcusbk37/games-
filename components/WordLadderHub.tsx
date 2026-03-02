"use client";

import { GameShell } from "./GameShell";
import { CustomWordLadderPage } from "./CustomWordLadderPage";

export function WordLadderHub() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Word Ladder
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Change one letter at a time to get from one word to another. Play the
            fixed Cold→Warm puzzle or pick your own start and end words.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10 overflow-auto">
        <section
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 scroll-mt-4"
          id="cold-to-warm"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Cold to Warm
          </h3>
          <GameShell gameId="cold-to-warm" />
        </section>

        <section
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 scroll-mt-4"
          id="custom-word-ladder"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Custom Word Ladder
          </h3>
          <CustomWordLadderPage />
        </section>
      </div>
    </div>
  );
}
