"use client";

import { useState } from "react";
import { memoryMatch, getEmoji } from "../games/memoryMatch";
import type { MemoryMatchState } from "../games/memoryMatch";

export function MemoryMatchPage() {
  const [state, setState] = useState<MemoryMatchState>(() => memoryMatch.initialState());

  const solved = memoryMatch.isSolved(state);
  const actions = memoryMatch.actions(state);

  const handleAction = (actionId: string, payload?: unknown) => {
    setState((prev) =>
      memoryMatch.apply(prev, { id: actionId, label: "", payload })
    );
  };

  const handleReset = () => {
    setState(memoryMatch.initialState());
  };

  const handleCardClick = (index: number) => {
    if (state.matched[index]) return;
    if (state.phase === "resolve") {
      handleAction("continue");
      return;
    }
    if (state.revealed[index]) return;
    handleAction(`flip-${index}`, index);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {memoryMatch.name}
          </h2>
          {memoryMatch.description && (
            <p className="mt-1 text-sm text-slate-300">
              {memoryMatch.description}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Moves: {state.moves}
            {solved && " · You won!"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400 hover:bg-slate-900/80"
        >
          Reset
        </button>
      </div>

      {state.phase === "resolve" && (
        <p className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
          No match. Click anywhere or &quot;Continue&quot; to flip cards back.
        </p>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {state.cards.map((pairId, index) => {
            const isRevealed = state.revealed[index] || state.matched[index];
            const isMatched = state.matched[index];
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleCardClick(index)}
                disabled={solved}
                className={`
                  flex aspect-square items-center justify-center rounded-lg border text-2xl sm:text-3xl
                  transition duration-150
                  ${isMatched ? "border-emerald-500/60 bg-emerald-950/50" : ""}
                  ${isRevealed && !isMatched ? "border-sky-500/60 bg-slate-800" : ""}
                  ${!isRevealed ? "border-slate-600 bg-slate-800/80 hover:border-slate-500 hover:bg-slate-700/80" : ""}
                  ${solved ? "cursor-default opacity-90" : "cursor-pointer"}
                `}
                aria-label={isRevealed ? `Card ${index + 1}: ${getEmoji(pairId)}` : `Card ${index + 1}: face down`}
              >
                {isRevealed ? getEmoji(pairId) : "?"}
              </button>
            );
          })}
        </div>
      </section>

      {state.phase === "resolve" && (
        <button
          type="button"
          onClick={() => handleAction("continue")}
          className="rounded-md border border-sky-600 bg-sky-950/60 px-4 py-2 text-sm font-medium text-sky-100 hover:border-sky-500 hover:bg-sky-900/40"
        >
          Continue
        </button>
      )}

      {solved && (
        <p className="text-center text-sm font-medium text-emerald-400">
          🎉 All pairs matched in {state.moves} moves!
        </p>
      )}
    </div>
  );
}
