import { describe, it, expect } from "vitest";
import { examplePuzzle } from "../games/examplePuzzle";

describe("examplePuzzle", () => {
  it("starts at zero", () => {
    expect(examplePuzzle.initialState()).toBe(0);
  });

  it("offers +1 and +2 at start", () => {
    const actions = examplePuzzle.actions(0).map((a) => a.id);
    expect(actions.sort()).toEqual(["+1", "+2"]);
  });

  it("stops offering +2 near goal", () => {
    const actions = examplePuzzle.actions(9).map((a) => a.id);
    expect(actions).toEqual(["+1"]);
    expect(examplePuzzle.actions(10)).toEqual([]);
  });

  it("applies actions correctly", () => {
    expect(examplePuzzle.apply(0, { id: "+1", label: "+1" })).toBe(1);
    expect(examplePuzzle.apply(0, { id: "+2", label: "+2" })).toBe(2);
  });

  it("recognizes solved states", () => {
    expect(examplePuzzle.isSolved(0)).toBe(false);
    expect(examplePuzzle.isSolved(10)).toBe(true);
    expect(examplePuzzle.isSolved(11)).toBe(true);
  });
});

