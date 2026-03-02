"use client";

import { useEffect, useRef, useState } from "react";
import { nonogram } from "../games/nonogram";
import type { NonogramState, CellState } from "../games/nonogram";

export function NonogramPage() {
  const [state, setState] = useState<NonogramState>(() => nonogram.initialState());

  const solved = nonogram.isSolved(state);
  const { puzzle, grid } = state;
  const rows = puzzle.solution.length;
  const cols = puzzle.solution[0]?.length ?? 0;

  const handleCellClick = (r: number, c: number, isDoubleClick: boolean) => {
    if (solved) return;
    const current = grid[r][c];
    // Single-click: toggle filled (dot). Double-click: clear to empty.
    const type: "fill" | "cross" | "clear" =
      isDoubleClick ? "clear" : current === "filled" ? "clear" : "fill";
    setState((prev) =>
      nonogram.apply(prev, { id: type, label: "", payload: { r, c, type } })
    );
  };

  const handleReset = () => {
    setState(nonogram.initialState());
  };

  const maxRowClueLen = Math.max(...puzzle.rowClues.map((arr) => arr.length));
  const maxColClueLen = Math.max(...puzzle.colClues.map((arr) => arr.length));

  const cellSize = Math.max(20, Math.min(36, Math.floor(320 / Math.max(rows, cols))));
  const clueCellSize = 14;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {nonogram.name}
          </h2>
          {nonogram.description && (
            <p className="mt-1 text-sm text-slate-300">
              {nonogram.description}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Single click: fill (dot) · Double click: clear
            {solved && " · You won!"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400 hover:bg-slate-900/80"
        >
          New puzzle
        </button>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 overflow-x-auto">
        <div
          className="inline-flex flex-col gap-0"
          style={
            {
              "--cell": `${cellSize}px`,
              "--clue": `${clueCellSize}px`,
              "--max-row": maxRowClueLen
            } as React.CSSProperties
          }
        >
          {/* Top: column clues — stack clue rows vertically so they sit above the grid */}
          <div
            className="flex flex-col gap-0"
            style={{ paddingLeft: maxRowClueLen * clueCellSize }}
          >
            {Array.from({ length: maxColClueLen }, (_, i) => (
              <div key={`col-header-${i}`} className="flex gap-0 shrink-0">
                {puzzle.colClues.map((clueArr, c) => (
                  <div
                    key={c}
                    className="flex items-center justify-center font-mono text-[10px] text-slate-400"
                    style={{ width: cellSize, height: clueCellSize, minWidth: cellSize, minHeight: clueCellSize }}
                  >
                    {clueArr[maxColClueLen - 1 - i] ?? ""}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Row clues + grid */}
          <div className="flex items-stretch gap-0">
            {/* Row clue column */}
            <div
              className="flex flex-col justify-center pr-1"
              style={{ width: maxRowClueLen * clueCellSize, minWidth: maxRowClueLen * clueCellSize }}
            >
              {puzzle.rowClues.map((clueArr, r) => (
                <div
                  key={r}
                  className="flex items-center justify-end gap-0.5 font-mono text-[10px] text-slate-400 pr-1"
                  style={{ height: cellSize, minHeight: cellSize }}
                >
                  {clueArr.map((n, i) => (
                    <span key={i}>{n}</span>
                  ))}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              className="grid gap-px rounded border border-slate-700 bg-slate-700"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <Cell
                    key={`${r}-${c}`}
                    state={cell}
                    size={cellSize}
                    onSingleClick={() => handleCellClick(r, c, false)}
                    onDoubleClick={() => handleCellClick(r, c, true)}
                    disabled={solved}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {solved && (
        <p className="text-center text-sm font-medium text-emerald-400">
          🎉 Puzzle solved!
        </p>
      )}
    </div>
  );
}

function Cell({
  state,
  size,
  onSingleClick,
  onDoubleClick,
  disabled
}: {
  state: CellState;
  size: number;
  onSingleClick: () => void;
  onDoubleClick: () => void;
  disabled: boolean;
}) {
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (disabled) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onDoubleClick();
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      onSingleClick();
    }, 220);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center justify-center border-0 transition duration-100
        ${disabled ? "cursor-default" : "cursor-pointer"}
        bg-slate-800 hover:bg-slate-700
      `}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={state === "filled" ? "Filled" : "Empty"}
    >
      {state === "filled" ? (
        <span className="text-slate-100 text-[0.6em] leading-none" aria-hidden>
          ●
        </span>
      ) : null}
    </button>
  );
}
