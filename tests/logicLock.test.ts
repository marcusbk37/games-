import { describe, expect, it } from "vitest";
import { logicLock } from "../games/logicLock";

describe("Logic Lock game", () => {
  it("starts in a non-solved state", () => {
    const initial = logicLock.initialState();
    expect(logicLock.isSolved(initial)).toBe(false);
  });

  it("only offers actions while unsolved", () => {
    const initial = logicLock.initialState();
    expect(logicLock.actions(initial).length).toBeGreaterThan(0);

    // Manually construct a solved state and ensure no actions.
    const solved = { ...initial, dials: [0, 0, 0] as [0, 0, 0] };
    expect(logicLock.isSolved(solved)).toBe(true);
    expect(logicLock.actions(solved)).toEqual([]);
  });

  it("never changes the number of dials and keeps values in range", () => {
    let state = logicLock.initialState();

    for (let i = 0; i < 20; i++) {
      const actions = logicLock.actions(state);
      if (actions.length === 0) break;
      const next = logicLock.apply(state, actions[0]);
      expect(next.dials.length).toBe(3);
      for (const v of next.dials) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(4);
      }
      state = next;
    }
  });

  it("is solvable from the initial state within a reasonable number of moves", () => {
    const start = logicLock.initialState();

    type Node = { state: ReturnType<typeof logicLock.initialState>; depth: number };
    const visited = new Set<string>();
    const queue: Node[] = [{ state: start, depth: 0 }];
    const MAX_DEPTH = 12;

    const serialize = (s: Node["state"]) =>
      `${s.dials[0]}-${s.dials[1]}-${s.dials[2]}`;

    let found = logicLock.isSolved(start);
    visited.add(serialize(start));

    while (queue.length > 0 && !found) {
      const current = queue.shift()!;
      if (current.depth >= MAX_DEPTH) continue;

      const actions = logicLock.actions(current.state);
      for (const action of actions) {
        const nextState = logicLock.apply(current.state, action);
        const key = serialize(nextState);
        if (visited.has(key)) continue;
        visited.add(key);

        if (logicLock.isSolved(nextState)) {
          found = true;
          break;
        }

        queue.push({ state: nextState, depth: current.depth + 1 });
      }
    }

    expect(found).toBe(true);
  });
});

