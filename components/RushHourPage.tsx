"use client";

import { useState, useCallback } from "react";
import { rushHour } from "../games/rushHour";
import type { RushHourState, Car } from "../games/rushHour";

/** Check if grid cell (r, c) is occupied by this car. Inlined from game logic. */
function cellOccupiedBy(r: number, c: number, car: Car): boolean {
  if (car.horizontal) {
    return r === car.r && c >= car.c && c < car.c + car.length;
  }
  return c === car.c && r >= car.r && r < car.r + car.length;
}

/** Find which car occupies cell (r, c), if any. */
function getCarAt(state: RushHourState, r: number, c: number): Car | undefined {
  return state.cars.find((car) => cellOccupiedBy(r, c, car));
}

/** Inline colors so all cars are visible regardless of Tailwind purging dynamic classes. */
const CAR_COLORS: Record<
  string,
  { bg: string; border: string }
> = {
  red: { bg: "#dc2626", border: "#ef4444" },
  truck1: { bg: "#b45309", border: "#d97706" },
  car1: { bg: "#0369a1", border: "#0284c7" },
  car2: { bg: "#047857", border: "#059669" },
  truck2: { bg: "#6d28d9", border: "#7c3aed" },
  car3: { bg: "#be123c", border: "#e11d48" },
  car4: { bg: "#d97706", border: "#f59e0b" }
};

function getCarColors(carId: string): { bg: string; border: string } {
  return CAR_COLORS[carId] ?? { bg: "#475569", border: "#64748b" };
}

/** Extract car id from action id (e.g. "car1-up" -> "car1", "red-right" -> "red"). */
function carIdFromActionId(actionId: string): string {
  const lastDash = actionId.lastIndexOf("-");
  return lastDash >= 0 ? actionId.slice(0, lastDash) : actionId;
}

export function RushHourPage() {
  const [state, setState] = useState<RushHourState>(() => rushHour.initialState());

  const solved = rushHour.isSolved(state);
  const actions = rushHour.actions(state);

  const handleAction = useCallback((actionId: string) => {
    setState((prev) => rushHour.apply(prev, { id: actionId, label: "" }));
  }, []);

  const handleReset = useCallback(() => {
    setState(rushHour.initialState());
  }, []);

  const cellSize = "min(2.75rem, 9vw)";
  const { rows, cols, exitRow } = state;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {rushHour.name}
          </h2>
          {rushHour.description && (
            <p className="mt-1 text-sm text-slate-300">
              {rushHour.description}
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
          className="inline-block"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols + 1}, ${cellSize})`,
            gridTemplateRows: `repeat(${rows}, ${cellSize})`,
            gap: "3px"
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols + 1 }, (_, c) => {
              const isExit = c === cols && r === exitRow;
              const car = c < cols ? getCarAt(state, r, c) : undefined;

              if (isExit) {
                return (
                  <div
                    key={`${r},${c}`}
                    className="flex items-center justify-center rounded border-2 border-dashed border-emerald-500/60 bg-emerald-950/50"
                    style={{ width: cellSize, height: cellSize }}
                    aria-label="Exit"
                  >
                    <span className="text-emerald-400 text-lg">→</span>
                  </div>
                );
              }

              if (car) {
                const isHead =
                  (car.horizontal && car.c === c) || (!car.horizontal && car.r === r);
                const colors = getCarColors(car.id);
                return (
                  <div
                    key={`${r},${c}`}
                    className="flex items-center justify-center rounded border"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      borderWidth: "2px"
                    }}
                  >
                    {isHead && car.id === "red" && (
                      <span className="text-red-200 text-xs font-bold">R</span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={`${r},${c}`}
                  className="rounded border border-slate-700/60 bg-slate-800/80"
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            })
          ).flat()}
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Click a move below to slide that car. Get the red car (R) to the exit.
      </p>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const carId = carIdFromActionId(action.id);
          const colors = getCarColors(carId);
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.id)}
              disabled={solved}
              className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-medium text-slate-100 shadow-sm hover:border-sky-400 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-default"
            >
              <span
                className="rounded border shrink-0"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderWidth: "1px"
                }}
                aria-hidden
              />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {solved && (
        <p className="text-center text-sm font-medium text-emerald-400">
          🎉 Red car escaped in {state.moves} moves!
        </p>
      )}
    </div>
  );
}
