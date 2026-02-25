"use client";

import { useState, useCallback, useEffect } from "react";
import { sokoban } from "../games/sokoban";
import type { SokobanState } from "../games/sokoban";

function posKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function SokobanPage() {
  const [state, setState] = useState<SokobanState>(() => sokoban.initialState());

  const solved = sokoban.isSolved(state);
  const actions = sokoban.actions(state);

  const handleAction = useCallback(
    (actionId: string) => {
      setState((prev) => sokoban.apply(prev, { id: actionId, label: "" }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setState(sokoban.initialState());
  }, []);

  useEffect(() => {
    if (solved) return;
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          handleAction("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleAction("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleAction("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleAction("right");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [solved, handleAction]);

  const cellSize = "min(2.5rem, 8vw)";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {sokoban.name}
          </h2>
          {sokoban.description && (
            <p className="mt-1 text-sm text-slate-300">
              {sokoban.description}
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

      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div
          className="inline-block font-mono text-[0.6rem] leading-none tracking-tighter sm:text-xs"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${state.cols}, ${cellSize})`,
            gridTemplateRows: `repeat(${state.rows}, ${cellSize})`,
            gap: "2px"
          }}
        >
          {Array.from({ length: state.rows * state.cols }, (_, i) => {
            const r = Math.floor(i / state.cols);
            const c = i % state.cols;
            const key = posKey(r, c);
            const isWall = state.walls.has(key);
            const isTarget = state.targets.has(key);
            const isBox = state.boxes.has(key);
            const isPlayer =
              state.player.r === r && state.player.c === c;

            if (isWall) {
              return (
                <div
                  key={key}
                  className="flex items-center justify-center rounded-sm bg-slate-600"
                  style={{ width: cellSize, height: cellSize }}
                  aria-hidden
                >
                  #
                </div>
              );
            }

            let bg = "bg-slate-800";
            if (isTarget && !isBox) bg = "bg-amber-950/70 border border-amber-700/50";
            if (isBox && isTarget) bg = "bg-emerald-900/80 border border-emerald-600/60";
            if (isBox && !isTarget) bg = "bg-amber-800/80 border border-amber-600/50";

            return (
              <div
                key={key}
                className={`flex items-center justify-center rounded-sm border border-slate-700 ${bg}`}
                style={{ width: cellSize, height: cellSize }}
              >
                {isPlayer && (
                  <span className="text-lg font-bold text-sky-400" aria-label="Player">
                    @
                  </span>
                )}
                {!isPlayer && isBox && (
                  <span className="text-sm font-bold text-amber-200">
                    $
                  </span>
                )}
                {!isPlayer && !isBox && isTarget && (
                  <span className="text-amber-600/80">.</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Use arrow keys or the buttons below to move.
      </p>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action.id)}
            disabled={solved}
            className="rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-lg font-medium text-slate-100 shadow-sm hover:border-sky-400 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-default"
          >
            {action.label}
          </button>
        ))}
      </div>

      {solved && (
        <p className="text-center text-sm font-medium text-emerald-400">
          🎉 All boxes on targets in {state.moves} moves!
        </p>
      )}
    </div>
  );
}
