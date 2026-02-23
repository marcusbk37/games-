import { describe, it, expect } from "vitest";
import {
  createCustomWordLadderGame,
  validateConfig,
  CUSTOM_WORD_LADDER_ID
} from "../games/customWordLadder";

describe("customWordLadder", () => {
  it("validateConfig returns null for valid config", () => {
    expect(validateConfig("COLD", "WARM", 10)).toBeNull();
  });

  it("validateConfig returns error for invalid word", () => {
    expect(validateConfig("XXXX", "WARM", 10)).not.toBeNull();
  });

  it("createCustomWordLadderGame produces game with correct id", () => {
    const game = createCustomWordLadderGame({
      startWord: "COLD",
      endWord: "WARM",
      maxMoves: 10
    });
    expect(game.id).toBe(CUSTOM_WORD_LADDER_ID);
  });

  it("game starts at start word and can reach end", () => {
    const game = createCustomWordLadderGame({
      startWord: "COLD",
      endWord: "WARM",
      maxMoves: 10
    });
    let state = game.initialState();
    expect(state.current).toBe("COLD");
    expect(state.target).toBe("WARM");
    expect(state.moves).toBe(0);

    const path = ["CORD", "CARD", "WARD", "WARM"];
    for (const word of path) {
      const actions = game.actions(state);
      const action = actions.find((a) => a.id === word);
      expect(action).toBeDefined();
      state = game.apply(state, action!);
    }
    expect(state.current).toBe("WARM");
    expect(game.isSolved(state)).toBe(true);
  });

  it("game limits moves", () => {
    const game = createCustomWordLadderGame({
      startWord: "COLD",
      endWord: "WARM",
      maxMoves: 2
    });
    let state = game.initialState();
    state = game.apply(state, { id: "CORD", label: "CORD" });
    state = game.apply(state, { id: "CARD", label: "CARD" });
    expect(game.actions(state)).toEqual([]);
  });
});
