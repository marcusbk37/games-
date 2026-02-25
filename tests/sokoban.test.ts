import { describe, expect, it } from "vitest";
import { sokoban, type SokobanState } from "../games/sokoban";

function posKey(r: number, c: number): string {
  return `${r},${c}`;
}

describe("sokoban game", () => {
  it("starts with boxes not all on targets", () => {
    const state = sokoban.initialState();
    expect(sokoban.isSolved(state)).toBe(false);
    expect(state.boxes.size).toBeGreaterThan(0);
    expect(state.targets.size).toBe(state.boxes.size);
  });

  it("offers four direction actions when not solved", () => {
    const state = sokoban.initialState();
    const actions = sokoban.actions(state);
    const ids = actions.map((a) => a.id);
    expect(ids).toContain("up");
    expect(ids).toContain("down");
    expect(ids).toContain("left");
    expect(ids).toContain("right");
  });

  it("moving into wall does not change state", () => {
    const state = sokoban.initialState();
    const next = sokoban.apply(state, { id: "up", label: "" });
    expect(next.player).toEqual(state.player);
    expect(next.boxes).toBe(state.boxes);
    expect(next.moves).toBe(state.moves);
  });

  it("moving into empty cell updates player and increments moves", () => {
    const state = sokoban.initialState();
    // From initial level, player can move right (into empty)
    const next = sokoban.apply(state, { id: "right", label: "" });
    expect(next.player.c).toBe(state.player.c + 1);
    expect(next.player.r).toBe(state.player.r);
    expect(next.moves).toBe(state.moves + 1);
    expect(next.boxes).toEqual(state.boxes);
  });

  it("pushing box moves box and player", () => {
    const state = sokoban.initialState();
    // Player at (4,4), box at (4,3). Push left: player goes to (4,3), box to (4,2)
    const next = sokoban.apply(state, { id: "left", label: "" });
    expect(next.player.r).toBe(4);
    expect(next.player.c).toBe(3);
    expect(next.boxes.has(posKey(4, 2))).toBe(true);
    expect(next.boxes.has(posKey(4, 3))).toBe(false);
    expect(next.moves).toBe(state.moves + 1);
  });

  it("pushing box into wall does not change state", () => {
    const state = sokoban.initialState();
    // Reach (2,4) via right, up, up, left so box at (2,3) is to our left; push left would hit wall (2,2)
    let s: SokobanState = state;
    s = sokoban.apply(s, { id: "right", label: "" }); // (4,5)
    s = sokoban.apply(s, { id: "up", label: "" });   // (3,5)
    s = sokoban.apply(s, { id: "up", label: "" });   // (2,5)
    s = sokoban.apply(s, { id: "left", label: "" }); // (2,4)
    const beforePush = { ...s, boxes: new Set(s.boxes) };
    const afterPush = sokoban.apply(s, { id: "left", label: "" }); // push box (2,3) left into wall
    expect(afterPush.player).toEqual(beforePush.player);
    expect(afterPush.boxes).toEqual(beforePush.boxes);
    expect(afterPush.moves).toBe(beforePush.moves);
  });

  it("is solvable within reasonable moves", () => {
    type Node = { state: SokobanState; depth: number };
    const key = (s: SokobanState) =>
      `${s.player.r},${s.player.c},${[...s.boxes].sort().join(";")}`;
    const start = sokoban.initialState();
    const seen = new Set<string>();
    const queue: Node[] = [{ state: start, depth: 0 }];
    seen.add(key(start));
    let solved = false;
    const maxDepth = 80;

    while (queue.length > 0 && !solved) {
      const { state: cur, depth } = queue.shift()!;
      if (depth > maxDepth) continue;
      for (const action of sokoban.actions(cur)) {
        const next = sokoban.apply(cur, action);
        const k = key(next);
        if (seen.has(k)) continue;
        seen.add(k);
        if (sokoban.isSolved(next)) {
          solved = true;
          break;
        }
        queue.push({ state: next, depth: depth + 1 });
      }
    }
    expect(solved).toBe(true);
  });
});
