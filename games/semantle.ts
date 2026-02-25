import type { GameAction, LogicGame } from "../lib/gameTypes";

/** Stub state; actual gameplay is in SemantlePage (guess + semantic feedback). */
type SemantleStubState = { _: "stub" };

export const semantle: LogicGame<SemantleStubState, GameAction> = {
  id: "semantle",
  name: "Semantle",
  description:
    "Like Wordle, but with semantic feedback. Guess the secret word; each guess gets a similarity score (0–100) showing how close you are in meaning.",

  initialState(): SemantleStubState {
    return { _: "stub" };
  },

  actions(): GameAction[] {
    return [];
  },

  apply(state): SemantleStubState {
    return state;
  },

  isSolved(): boolean {
    return false;
  }
};
