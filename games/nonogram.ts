import type { GameAction, LogicGame } from "../lib/gameTypes";

/** Converts a row or column of booleans into clue numbers (e.g. [true,true,false,true] → [2, 1]). */
function lineToClues(line: boolean[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const cell of line) {
    if (cell) run++;
    else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues.length ? clues : [0];
}

export interface NonogramPuzzle {
  solution: boolean[][];
  rowClues: number[][];
  colClues: number[][];
}

function buildPuzzle(solution: boolean[][]): NonogramPuzzle {
  const rows = solution.length;
  const cols = solution[0]?.length ?? 0;
  const rowClues = solution.map((row) => lineToClues(row));
  const colClues = Array.from({ length: cols }, (_, c) =>
    lineToClues(solution.map((row) => row[c]))
  );
  return { solution, rowClues, colClues };
}

/** 5×5 example: smiley-style. */
const PUZZLE_5X5 = buildPuzzle([
  [false, true, true, true, false],
  [false, true, false, true, false],
  [false, true, true, true, false],
  [true, false, false, false, true],
  [false, true, true, true, false]
]);

/** 5×5 heart. */
const PUZZLE_HEART = buildPuzzle([
  [false, true, true, false, true, true, false],
  [true, true, true, true, true, true, true],
  [true, true, true, true, true, true, true],
  [false, true, true, true, true, true, false],
  [false, false, true, true, true, false, false],
  [false, false, false, true, false, false, false]
]);

/** 10×10 simple pattern. */
const PUZZLE_10 = buildPuzzle([
  [true, true, true, false, false, false, true, true, true, false],
  [true, false, true, false, false, false, true, false, true, false],
  [true, true, true, false, false, false, true, true, true, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [true, true, true, false, false, false, true, true, true, false],
  [true, false, true, false, false, false, true, false, true, false],
  [true, true, true, false, false, false, true, true, true, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false]
]);

const PUZZLES: NonogramPuzzle[] = [PUZZLE_5X5, PUZZLE_HEART, PUZZLE_10];

export type CellState = "empty" | "filled" | "crossed";

export interface NonogramState {
  puzzle: NonogramPuzzle;
  /** Player grid: same dimensions as solution */
  grid: CellState[][];
}

function emptyGrid(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () => Array(cols).fill("empty") as CellState[]);
}

export const nonogram: LogicGame<NonogramState, GameAction> = {
  id: "nonogram",
  name: "Nonogram",
  description:
    "Fill cells according to the row and column clues. Each number is a run of filled cells; single-click fills, double-click clears.",

  initialState(): NonogramState {
    const puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    const rows = puzzle.solution.length;
    const cols = puzzle.solution[0]?.length ?? 0;
    return {
      puzzle,
      grid: emptyGrid(rows, cols)
    };
  },

  actions(state): GameAction[] {
    const rows = state.puzzle.solution.length;
    const cols = state.puzzle.solution[0]?.length ?? 0;
    const out: GameAction[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const current = state.grid[r][c];
        if (current !== "filled") out.push({ id: "fill", label: `Fill ${r},${c}`, payload: { r, c, type: "fill" as const } });
        if (current !== "crossed") out.push({ id: "cross", label: `Mark empty ${r},${c}`, payload: { r, c, type: "cross" as const } });
        if (current !== "empty") out.push({ id: "clear", label: `Clear ${r},${c}`, payload: { r, c, type: "clear" as const } });
      }
    }
    return out;
  },

  apply(state, action): NonogramState {
    const payload = action.payload as { r: number; c: number; type: "fill" | "cross" | "clear" } | undefined;
    if (!payload || typeof payload.r !== "number" || typeof payload.c !== "number") return state;

    const rows = state.puzzle.solution.length;
    const cols = state.puzzle.solution[0]?.length ?? 0;
    if (payload.r < 0 || payload.r >= rows || payload.c < 0 || payload.c >= cols) return state;

    const grid = state.grid.map((row, r) =>
      r === payload.r
        ? row.map((cell, c) => (c === payload.c ? (payload.type === "clear" ? "empty" : payload.type === "fill" ? "filled" : "crossed") : cell))
        : row
    );
    return { ...state, grid };
  },

  isSolved(state): boolean {
    const { solution } = state.puzzle;
    const { grid } = state;
    for (let r = 0; r < solution.length; r++) {
      for (let c = 0; c < solution[r].length; c++) {
        const shouldFill = solution[r][c];
        const actual = grid[r][c];
        if (shouldFill && actual !== "filled") return false;
        if (!shouldFill && actual === "filled") return false;
      }
    }
    return true;
  }
};
