import type { GameAction, LogicGame } from "../lib/gameTypes";

type DialValue = 0 | 1 | 2 | 3 | 4;

interface LogicLockPlusState {
  dials: [DialValue, DialValue, DialValue, DialValue];
  moves: number;
}

type LogicLockPlusActionId =
  | "twist-a"
  | "twist-b"
  | "twist-c"
  | "twist-d"
  | "spin-all";

interface LogicLockPlusAction extends GameAction {
  id: LogicLockPlusActionId;
}

const MAX_DIAL: DialValue = 4;

const BASE_ACTIONS: LogicLockPlusAction[] = [
  { id: "twist-a", label: "Twist A (A+B +1)" },
  { id: "twist-b", label: "Twist B (B+C +1)" },
  { id: "twist-c", label: "Twist C (C+D +1)" },
  { id: "twist-d", label: "Twist D (D+A +1)" },
  { id: "spin-all", label: "Spin All (+1,+2,+3,+4)" }
];

const modInc = (value: DialValue, delta: number): DialValue =>
  ((((value + delta) % (MAX_DIAL + 1)) + (MAX_DIAL + 1)) %
    (MAX_DIAL + 1)) as DialValue;

const allZero = (state: LogicLockPlusState): boolean =>
  state.dials.every((d) => d === 0);

export const logicLockPlus: LogicGame<LogicLockPlusState, LogicLockPlusAction> = {
  id: "logic-lock-plus",
  name: "Logic Lock Plus",
  description:
    "Four dials in a cycle (A→B→C→D→A). Each twist moves two neighbors; Spin All shifts each by 1–4. Bring all to 0.",

  initialState() {
    return { dials: [2, 0, 4, 1], moves: 0 };
  },

  actions(state) {
    if (allZero(state)) return [];
    return BASE_ACTIONS;
  },

  apply(state, action) {
    const [a, b, c, d] = state.dials;
    let next: LogicLockPlusState = {
      dials: [a, b, c, d],
      moves: state.moves + 1
    };

    switch (action.id) {
      case "twist-a":
        next = { ...next, dials: [modInc(a, 1), modInc(b, 1), c, d] };
        break;
      case "twist-b":
        next = { ...next, dials: [a, modInc(b, 1), modInc(c, 1), d] };
        break;
      case "twist-c":
        next = { ...next, dials: [a, b, modInc(c, 1), modInc(d, 1)] };
        break;
      case "twist-d":
        next = { ...next, dials: [modInc(a, 1), b, c, modInc(d, 1)] };
        break;
      case "spin-all":
        next = {
          ...next,
          dials: [
            modInc(a, 1),
            modInc(b, 2),
            modInc(c, 3),
            modInc(d, 4)
          ]
        };
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
