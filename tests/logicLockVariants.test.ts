import { describe, expect, it } from "vitest";
import { logicLockMini } from "../games/logicLockMini";
import { logicLockPlus } from "../games/logicLockPlus";
import { logicLockMax } from "../games/logicLockMax";

function runBFSSolvability(
  game: {
    initialState: () => { dials: number[] };
    actions: (s: { dials: number[] }) => { id: string }[];
    apply: (s: { dials: number[] }, a: { id: string }) => { dials: number[] };
    isSolved: (s: { dials: number[] }) => boolean;
  },
  maxDepth: number
): boolean {
  const start = game.initialState();
  const visited = new Set<string>();
  const queue: { state: typeof start; depth: number }[] = [
    { state: start, depth: 0 }
  ];
  const serialize = (s: { dials: number[] }) => s.dials.join("-");

  if (game.isSolved(start)) return true;
  visited.add(serialize(start));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    for (const action of game.actions(current.state)) {
      const nextState = game.apply(current.state, action);
      const key = serialize(nextState);
      if (visited.has(key)) continue;
      visited.add(key);
      if (game.isSolved(nextState)) return true;
      queue.push({ state: nextState, depth: current.depth + 1 });
    }
  }
  return false;
}

describe("Logic Lock Mini (2 dials)", () => {
  it("starts unsolved and is solvable", () => {
    const s = logicLockMini.initialState();
    expect(logicLockMini.isSolved(s)).toBe(false);
    expect(s.dials).toHaveLength(2);
    expect(logicLockMini.actions({ ...s, dials: [0, 0] }).length).toBe(0);
    expect(runBFSSolvability(logicLockMini, 15)).toBe(true);
  });
});

describe("Logic Lock Plus (4 dials)", () => {
  it("starts unsolved and is solvable", () => {
    const s = logicLockPlus.initialState();
    expect(logicLockPlus.isSolved(s)).toBe(false);
    expect(s.dials).toHaveLength(4);
    expect(
      logicLockPlus.actions({ ...s, dials: [0, 0, 0, 0] }).length
    ).toBe(0);
    expect(runBFSSolvability(logicLockPlus, 18)).toBe(true);
  });
});

describe("Logic Lock Max (5 dials)", () => {
  it("starts unsolved and is solvable", () => {
    const s = logicLockMax.initialState();
    expect(logicLockMax.isSolved(s)).toBe(false);
    expect(s.dials).toHaveLength(5);
    expect(
      logicLockMax.actions({ ...s, dials: [0, 0, 0, 0, 0] }).length
    ).toBe(0);
    expect(runBFSSolvability(logicLockMax, 20)).toBe(true);
  });
});
