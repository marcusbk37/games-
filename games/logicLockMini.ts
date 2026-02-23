import type { GameAction, LogicGame } from "../lib/gameTypes";

type DialValue = 0 | 1 | 2 | 3 | 4;

interface LogicLockMiniState {
  dials: [DialValue, DialValue];
  moves: number;
}

type LogicLockMiniActionId = "twist-a" | "twist-b" | "double";

interface LogicLockMiniAction extends GameAction {
  id: LogicLockMiniActionId;
}

const MAX_DIAL: DialValue = 4;

const BASE_ACTIONS: LogicLockMiniAction[] = [
  { id: "twist-a", label: "Twist A (A+1, B+2)" },
  { id: "twist-b", label: "Twist B (A+2, B+1)" },
  { id: "double", label: "Double (A+1, B+1)" }
];

const modInc = (value: DialValue, delta: number): DialValue =>
  ((((value + delta) % (MAX_DIAL + 1)) + (MAX_DIAL + 1)) %
    (MAX_DIAL + 1)) as DialValue;

const allZero = (state: LogicLockMiniState): boolean =>
  state.dials[0] === 0 && state.dials[1] === 0;

export const logicLockMini: LogicGame<LogicLockMiniState, LogicLockMiniAction> = {
  id: "logic-lock-mini",
  name: "Logic Lock Mini",
  description:
    "Two linked dials (A, B). Quick warm-up: bring both to 0 with three twist types.",

  initialState() {
    return { dials: [3, 2], moves: 0 };
  },

  actions(state) {
    if (allZero(state)) return [];
    return BASE_ACTIONS;
  },

  apply(state, action) {
    const [a, b] = state.dials;
    let next: LogicLockMiniState = { dials: [a, b], moves: state.moves + 1 };

    switch (action.id) {
      case "twist-a":
        next = { ...next, dials: [modInc(a, 1), modInc(b, 2)] };
        break;
      case "twist-b":
        next = { ...next, dials: [modInc(a, 2), modInc(b, 1)] };
        break;
      case "double":
        next = { ...next, dials: [modInc(a, 1), modInc(b, 1)] };
        break;
      default:
        break;
    }
    return next;
  },

  isSolved(state) {
    return allZero(state);
  }
};
