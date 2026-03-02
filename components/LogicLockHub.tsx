"use client";
import { GameShell } from "./GameShell";
import { LOGIC_LOCK_VARIANT_IDS } from "../games";
import { findGame } from "../games";

const VARIANT_LABELS: Record<(typeof LOGIC_LOCK_VARIANT_IDS)[number], string> = {
  "logic-lock-mini": "Mini (2 dials)",
  "logic-lock-classic": "Classic (3 dials)",
  "logic-lock-plus": "Plus (4 dials)",
  "logic-lock-max": "Max (5 dials)"
};

export function LogicLockHub() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Logic Lock</h2>
          <p className="mt-1 text-sm text-slate-300">
            Four variants on one page. Scroll to play any—same playstyle, different sizes and rules.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10 overflow-auto">
        {LOGIC_LOCK_VARIANT_IDS.map((gameId) => {
          const game = findGame(gameId);
          if (!game) return null;
          return (
            <section
              key={gameId}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 scroll-mt-4"
              id={gameId}
            >
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {VARIANT_LABELS[gameId]}
              </h3>
              <GameShell gameId={gameId} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
