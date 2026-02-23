import { describe, it, expect } from "vitest";
import { coldToWarm, type ColdToWarmState } from "../games/coldToWarm";

function getInitial(): ColdToWarmState {
  return coldToWarm.initialState();
}

describe("coldToWarm word ladder game", () => {
  it("starts at COLD with target WARM", () => {
    const state = getInitial();
    expect(state.current).toBe("COLD");
    expect(state.target).toBe("WARM");
    expect(state.moves).toBe(0);
    expect(state.history).toEqual(["COLD"]);
  });

  it("offers next word options from the current word", () => {
    const state = getInitial();
    const actions = coldToWarm.actions(state);
    const labels = actions.map((a) => a.label);
    expect(labels).toContain("CORD");
  });

  it("advances along the intended solution path to WARM", () => {
    let state = getInitial();

    const step = (word: string) => {
      const action = coldToWarm
        .actions(state)
        .find((a) => a.id === word);
      expect(action).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state = coldToWarm.apply(state, action!);
    };

    step("CORD");
    step("CARD");
    step("WARD");
    step("WARM");

    expect(state.current).toBe("WARM");
    expect(coldToWarm.isSolved(state)).toBe(true);
    expect(state.moves).toBeGreaterThan(0);
    expect(state.moves).toBeLessThanOrEqual(state.maxMoves);
  });

  it("does not allow moves when maxMoves reached", () => {
    const state: ColdToWarmState = {
      ...getInitial(),
      moves: 5
    };
    const actions = coldToWarm.actions(state);
    expect(actions).toEqual([]);
  });
});

