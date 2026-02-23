import type { GameAction, LogicGame } from "../lib/gameTypes";

type ExampleState = number;

const MAX = 10;

export const examplePuzzle: LogicGame<ExampleState, GameAction> = {
  id: "example-puzzle",
  name: "Reach Ten",
  description: "Start at 0 and reach 10 using +1 or +2 steps.",

  initialState() {
    return 0;
  },

  actions(state) {
    if (state >= MAX) return [];
    const opts: GameAction[] = [{ id: "+1", label: "+1" }];
    if (state <= MAX - 2) {
      opts.push({ id: "+2", label: "+2" });
    }
    return opts;
  },

  apply(state, action) {
    if (action.id === "+1") return state + 1;
    if (action.id === "+2") return state + 2;
    return state;
  },

  isSolved(state) {
    return state >= MAX;
  }
};

