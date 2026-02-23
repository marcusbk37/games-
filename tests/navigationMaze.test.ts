import { describe, expect, it } from "vitest";
import { navigationMaze, type NavigationState } from "../games/navigationMaze";

describe("navigationMaze game", () => {
  it("starts in a playable state with fog of war", () => {
    const state = navigationMaze.initialState();

    expect(state.status).toBe("playing");
    expect(state.keysCollected).toBe(0);
    expect(state.keysNeeded).toBe(3);
    expect(state.movesLeft).toBeGreaterThan(0);
    expect(Array.isArray(state.visibleMap)).toBe(true);
    expect(state.visibleMap.some((row) => row.includes("P"))).toBe(true);
    expect(state.visited.length).toBe(1);
    expect(state.visibleMap.some((row) => row.includes("?"))).toBe(true);
  });

  it("offers only legal moves from the start", () => {
    const state = navigationMaze.initialState();
    const actions = navigationMaze.actions(state);
    const ids = actions.map((a) => a.id);

    expect(ids).toContain("right");
    expect(ids).toContain("down");
    expect(ids).not.toContain("left");
    expect(ids).not.toContain("up");
  });

  it("can collect keys and reach goal (solvable)", () => {
    type Node = { state: NavigationState; depth: number };
    const seen = new Set<string>();
    const key = (s: NavigationState) =>
      `${s.player.x},${s.player.y},${s.keysCollected}`;

    const start = navigationMaze.initialState();
    const queue: Node[] = [{ state: start, depth: 0 }];
    seen.add(key(start));

    let solved = false;
    const maxDepth = 50;

    while (queue.length > 0 && !solved) {
      const { state: current, depth } = queue.shift()!;
      if (depth > maxDepth) continue;

      for (const action of navigationMaze.actions(current)) {
        const next = navigationMaze.apply(current, action);
        const k = key(next);
        if (seen.has(k)) continue;
        seen.add(k);

        if (navigationMaze.isSolved(next)) {
          solved = true;
          break;
        }
        if (next.status === "playing" && next.movesLeft > 0) {
          queue.push({ state: next, depth: depth + 1 });
        }
      }
    }

    expect(solved).toBe(true);
  });
});

