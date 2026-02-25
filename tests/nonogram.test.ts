import { describe, it, expect } from "vitest";
import { nonogram, type NonogramState } from "../games/nonogram";

describe("nonogram", () => {
  it("starts with a puzzle and empty grid", () => {
    const state = nonogram.initialState();
    expect(state.puzzle).toBeDefined();
    expect(state.puzzle.solution.length).toBeGreaterThan(0);
    expect(state.puzzle.rowClues.length).toBe(state.puzzle.solution.length);
    expect(state.grid.length).toBe(state.puzzle.solution.length);
    state.grid.forEach((row, r) => {
      expect(row.length).toBe(state.puzzle.solution[r].length);
      row.forEach((cell) => expect(["empty", "filled", "crossed"]).toContain(cell));
    });
    expect(state.grid.flat().every((c) => c === "empty")).toBe(true);
  });

  it("apply fill updates the cell", () => {
    let state = nonogram.initialState();
    state = nonogram.apply(state, { id: "fill", label: "", payload: { r: 0, c: 0, type: "fill" } });
    expect(state.grid[0][0]).toBe("filled");
  });

  it("apply cross updates the cell", () => {
    let state = nonogram.initialState();
    state = nonogram.apply(state, { id: "cross", label: "", payload: { r: 0, c: 0, type: "cross" } });
    expect(state.grid[0][0]).toBe("crossed");
  });

  it("apply clear resets the cell", () => {
    let state = nonogram.initialState();
    state = nonogram.apply(state, { id: "fill", label: "", payload: { r: 0, c: 0, type: "fill" } });
    state = nonogram.apply(state, { id: "clear", label: "", payload: { r: 0, c: 0, type: "clear" } });
    expect(state.grid[0][0]).toBe("empty");
  });

  it("isSolved is false when grid is empty", () => {
    const state = nonogram.initialState();
    expect(nonogram.isSolved(state)).toBe(false);
  });

  it("isSolved is true when grid matches solution", () => {
    let state = nonogram.initialState();
    const { solution } = state.puzzle;
    for (let r = 0; r < solution.length; r++) {
      for (let c = 0; c < solution[r].length; c++) {
        if (solution[r][c]) {
          state = nonogram.apply(state, { id: "fill", label: "", payload: { r, c, type: "fill" } });
        }
      }
    }
    expect(nonogram.isSolved(state)).toBe(true);
  });

  it("isSolved is false when one cell is wrong (filled but should be empty)", () => {
    let state = nonogram.initialState();
    const { solution } = state.puzzle;
    // Fill all correct cells
    for (let r = 0; r < solution.length; r++) {
      for (let c = 0; c < solution[r].length; c++) {
        if (solution[r][c]) {
          state = nonogram.apply(state, { id: "fill", label: "", payload: { r, c, type: "fill" } });
        }
      }
    }
    // Fill one that should be empty (if any)
    let found = false;
    for (let r = 0; r < solution.length && !found; r++) {
      for (let c = 0; c < solution[r].length; c++) {
        if (!solution[r][c]) {
          state = nonogram.apply(state, { id: "fill", label: "", payload: { r, c, type: "fill" } });
          found = true;
          break;
        }
      }
    }
    if (found) expect(nonogram.isSolved(state)).toBe(false);
  });

  it("isSolved is false when one required cell is not filled", () => {
    let state = nonogram.initialState();
    const { solution } = state.puzzle;
    let filledOne = false;
    for (let r = 0; r < solution.length; r++) {
      for (let c = 0; c < solution[r].length; c++) {
        if (solution[r][c]) {
          if (!filledOne) {
            filledOne = true;
            continue; // skip filling this one
          }
          state = nonogram.apply(state, { id: "fill", label: "", payload: { r, c, type: "fill" } });
        }
      }
    }
    // We skipped one required fill; puzzle has at least two filled cells (all our puzzles do)
    expect(nonogram.isSolved(state)).toBe(false);
  });

  it("offers fill and cross for every empty cell at start", () => {
    const state = nonogram.initialState();
    const actions = nonogram.actions(state);
    const rows = state.puzzle.solution.length;
    const cols = state.puzzle.solution[0]?.length ?? 0;
    const cells = rows * cols;
    // Empty grid: each cell can get fill or cross (not clear), so exactly 2 per cell
    expect(actions.length).toBe(cells * 2);
    const fillCount = actions.filter((a) => a.id === "fill").length;
    const crossCount = actions.filter((a) => a.id === "cross").length;
    expect(fillCount).toBe(cells);
    expect(crossCount).toBe(cells);
  });
});
