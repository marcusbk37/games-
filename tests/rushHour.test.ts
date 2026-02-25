import { describe, expect, it } from "vitest";
import {
  rushHour,
  carCells,
  type RushHourState,
  type Car
} from "../games/rushHour";

function buildCellToCarMap(cars: Car[]): Map<string, Car> {
  const map = new Map<string, Car>();
  for (const car of cars) {
    for (const k of carCells(car)) {
      map.set(k, car);
    }
  }
  return map;
}

describe("rushHour", () => {
  it("initial state has 6x6 grid and exit row 2", () => {
    const state = rushHour.initialState();
    expect(state.rows).toBe(6);
    expect(state.cols).toBe(6);
    expect(state.exitRow).toBe(2);
    expect(state.moves).toBe(0);
    expect(state.cars.length).toBeGreaterThan(0);
  });

  it("red car exists and is horizontal at exit row", () => {
    const state = rushHour.initialState();
    const red = state.cars.find((c) => c.id === "red");
    expect(red).toBeDefined();
    expect(red!.horizontal).toBe(true);
    expect(red!.length).toBe(2);
    expect(red!.r).toBe(2);
  });

  it("no two cars overlap in initial state", () => {
    const state = rushHour.initialState();
    const allCells: string[] = [];
    for (const car of state.cars) {
      for (const k of carCells(car)) {
        expect(allCells).not.toContain(k);
        allCells.push(k);
      }
    }
  });

  it("all cars are within bounds", () => {
    const state = rushHour.initialState();
    for (const car of state.cars) {
      for (const k of carCells(car)) {
        const [r, c] = k.split(",").map(Number);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(state.rows);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(state.cols);
      }
    }
  });

  it("isSolved is false initially", () => {
    const state = rushHour.initialState();
    expect(rushHour.isSolved(state)).toBe(false);
  });

  it("actions include at least one move when not solved", () => {
    const state = rushHour.initialState();
    const actions = rushHour.actions(state);
    expect(actions.length).toBeGreaterThan(0);
  });

  it("apply car1-down moves car1 down", () => {
    const state = rushHour.initialState();
    const car1Before = state.cars.find((c) => c.id === "car1")!;
    const next = rushHour.apply(state, { id: "car1-down", label: "" });
    const car1After = next.cars.find((c) => c.id === "car1")!;
    expect(car1After.r).toBe(car1Before.r + 1);
    expect(car1After.c).toBe(car1Before.c);
    expect(next.moves).toBe(state.moves + 1);
  });

  it("apply red-right when blocked does not change state", () => {
    const state = rushHour.initialState();
    // Red at (2,0)-(2,1). (2,2) free, (2,3) blocked by car1. First red-right -> (2,1),(2,2) is valid.
    let s: RushHourState = state;
    s = rushHour.apply(s, { id: "red-right", label: "" });
    expect(s.cars.find((c) => c.id === "red")!.c).toBe(1);
    // Second red-right would need (2,3) which is car1 - blocked
    const before = s.cars.find((c) => c.id === "red")!.c;
    const after = rushHour.apply(s, { id: "red-right", label: "" });
    expect(after.cars.find((c) => c.id === "red")!.c).toBe(before);
    expect(after.moves).toBe(s.moves);
  });

  it("moving car1 down 3x unblocks red; puzzle is solvable", () => {
    let state = rushHour.initialState();
    // car1 (0,3) length 3 occupies (0,3),(1,3),(2,3). Need 3 down moves to free (2,3).
    for (let i = 0; i < 3; i++) {
      state = rushHour.apply(state, { id: "car1-down", label: "" });
    }
    const car1 = state.cars.find((c) => c.id === "car1")!;
    expect(car1.r).toBe(3);
    // Now (2,3) is free; red can move right to exit (4 moves to c=4)
    let redRightCount = 0;
    while (!rushHour.isSolved(state) && redRightCount < 6) {
      const actions = rushHour.actions(state);
      const right = actions.find((a) => a.id === "red-right");
      expect(right).toBeDefined();
      state = rushHour.apply(state, right!);
      redRightCount++;
    }
    expect(rushHour.isSolved(state)).toBe(true);
    expect(redRightCount).toBe(4); // red at c=4 has right edge at 6, so 4 moves from c=0
  });

  it("isSolved is true only when red car has reached exit", () => {
    let state = rushHour.initialState();
    for (let i = 0; i < 3; i++) state = rushHour.apply(state, { id: "car1-down", label: "" });
    expect(rushHour.isSolved(state)).toBe(false);
    for (let i = 0; i < 4; i++) {
      state = rushHour.apply(state, { id: "red-right", label: "" });
    }
    expect(rushHour.isSolved(state)).toBe(true);
    const red = state.cars.find((c) => c.id === "red")!;
    expect(red.r).toBe(2);
    expect(red.c + red.length).toBeGreaterThanOrEqual(6);
  });

  it("actions returns empty when solved", () => {
    let state = rushHour.initialState();
    for (let i = 0; i < 3; i++) state = rushHour.apply(state, { id: "car1-down", label: "" });
    for (let i = 0; i < 4; i++) state = rushHour.apply(state, { id: "red-right", label: "" });
    expect(rushHour.isSolved(state)).toBe(true);
    expect(rushHour.actions(state)).toEqual([]);
  });

  it("invalid action id leaves state unchanged", () => {
    const state = rushHour.initialState();
    const next = rushHour.apply(state, { id: "nonexistent-left", label: "" });
    expect(next).toBe(state);
    const next2 = rushHour.apply(state, { id: "red-up", label: "" });
    expect(next2.cars).toEqual(state.cars);
    expect(next2.moves).toBe(state.moves);
  });

  it("carCells returns correct keys for horizontal and vertical cars", () => {
    const h: Car = { id: "h", r: 1, c: 2, length: 3, horizontal: true };
    expect(carCells(h)).toEqual(["1,2", "1,3", "1,4"]);
    const v: Car = { id: "v", r: 0, c: 3, length: 2, horizontal: false };
    expect(carCells(v)).toEqual(["0,3", "1,3"]);
  });

  it("initial state cell map covers all cars (UI can show every car)", () => {
    const state = rushHour.initialState();
    const cellToCar = buildCellToCarMap(state.cars);
    const expectedCells = 2 + 2 + 3 + 2 + 3 + 2 + 2; // red, truck1, car1, car2, truck2, car3, car4
    expect(cellToCar.size).toBe(expectedCells);
    const uniqueCars = new Set(cellToCar.values());
    expect(uniqueCars.size).toBe(7);
    expect(Array.from(uniqueCars).some((c) => c.id === "red")).toBe(true);
  });
});
