"use client";

import { useState } from "react";
import type { GameAction, GameState, LogicGame } from "../lib/gameTypes";
import { findGame } from "../games";
import type { NavigationState } from "../games/navigationMaze";

interface Props<S = GameState, A extends GameAction = GameAction> {
  gameId?: string;
  game?: LogicGame<S, A>;
}

function isNavigationState(s: unknown): s is NavigationState {
  return (
    typeof s === "object" &&
    s !== null &&
    "visibleMap" in s &&
    "movesLeft" in s &&
    "keysCollected" in s &&
    "keysNeeded" in s &&
    "status" in s
  );
}

export function GameShell<S = GameState, A extends GameAction = GameAction>({
  gameId,
  game: gameOverride
}: Props<S, A>) {
  const game = (gameOverride ?? (gameId ? findGame(gameId) : undefined)) as
    | LogicGame<S, A>
    | undefined;

  if (!game) {
    return (
      <div className="text-sm text-red-400">
        Game not found for id <code>{gameId ?? "unknown"}</code>.
      </div>
    );
  }

  const [state, setState] = useState<S>(() => game.initialState());

  const solved = game.isSolved(state);
  const actions = game.actions(state);

  const handleAction = (action: A) => {
    setState((prev: S) => game.apply(prev, action));
  };

  const handleReset = () => {
    setState(game.initialState());
  };

  const isNav = game.id === "navigation-maze";
  const navState = isNav && isNavigationState(state) ? state : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{game.name}</h2>
          {game.description && (
            <p className="mt-1 text-sm text-slate-300">{game.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:border-sky-400 hover:bg-slate-900/80"
        >
          Reset
        </button>
      </div>

      {navState ? (
        <>
          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Maze
            </h3>
            <p className="mb-2 text-xs text-slate-400">
              Keys: {navState.keysCollected}/{navState.keysNeeded} · Moves
              left: {navState.movesLeft} ·{" "}
              {navState.status === "won"
                ? "You won!"
                : navState.status === "lost"
                  ? "Out of moves"
                  : "P = you, K = key, G = goal, ? = unexplored"}
            </p>
            <div className="font-mono text-[10px] leading-none tracking-tighter text-slate-300">
              {navState.visibleMap.map((row, i) => (
                <div key={i}>
                  {row.split("").map((ch, j) => (
                    <span
                      key={j}
                      className={
                        ch === "P"
                          ? "text-amber-400 font-bold"
                          : ch === "?"
                            ? "text-slate-600"
                            : ch === "#"
                              ? "text-slate-500"
                              : ch === "K"
                                ? "text-yellow-400"
                                : ch === "G"
                                  ? "text-emerald-400"
                                  : ""
                      }
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {solved && (
              <p className="mt-2 text-sm font-medium text-emerald-400">
                🎉 Solved! Try a different route or reset.
              </p>
            )}
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              State (no full map — fog of war)
            </h3>
            <pre className="max-h-40 overflow-auto rounded-lg bg-slate-950/80 p-3 text-xs text-slate-200">
              {JSON.stringify(
                {
                  visibleMap: navState.visibleMap,
                  keysCollected: navState.keysCollected,
                  keysNeeded: navState.keysNeeded,
                  movesLeft: navState.movesLeft,
                  status: navState.status
                },
                null,
                2
              )}
            </pre>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            State
          </h3>
          <pre className="max-h-60 overflow-auto rounded-lg bg-slate-950/80 p-3 text-xs text-slate-200">
            {JSON.stringify(state, null, 2)}
          </pre>
          {solved && (
            <p className="mt-2 text-sm font-medium text-emerald-400">
              🎉 Solved! Try a different sequence or another game.
            </p>
          )}
        </section>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Actions
        </h3>
        {actions.length === 0 ? (
          <p className="text-sm text-slate-400">
            {navState?.status === "lost"
              ? "Out of moves. Hit Reset to try again."
              : "No actions available from this state."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm shadow-slate-950/50 hover:border-sky-400 hover:bg-slate-900 hover:text-sky-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

