import type { GameAction, LogicGame } from "../lib/gameTypes";

type DialValue = 0 | 1 | 2 | 3 | 4;

interface LogicLockMaxState {
  dials: [DialValue, DialValue, DialValue, DialValue, DialValue];
  moves: number;
}

type LogicLockMaxActionId =
  | "twist-a"
  | "twist-b"
  | "twist-c"
  | "twist-d"
  | "twist-e"
  | "spin-all";

interface LogicLockMaxAction extends GameAction {
  id: LogicLockMaxActionId;
}

const MAX_DIAL: DialValue = 4;

const BASE_ACTIONS: LogicLockMaxAction[] = [
  { id: "twist-a", label: "Twist A (A+B +1)" },
  { id: "twist-b", label: "Twist B (B+C +1)" },
  { id: "twist-c", label: "Twist C (C+D +1)" },
  { id: "twist-d", label: "Twist D (D+E +1)" },
  { id: "twist-e", label: "Twist E (E+A +1)" },
  { id: "spin-all", label: "Spin All (+2,+3,+4,+1,+2)" }
];

const modInc = (value: DialValue, delta: number): DialValue =>
  ((((value + delta) % (MAX_DIAL + 1)) + (MAX_DIAL + 1)) %
    (MAX_DIAL + 1)) as DialValue;

const allZero = (state: LogicLockMaxState): boolean =>
  state.dials.every((d) => d === 0);

export const logicLockMax: LogicGame<LogicLockMaxState, LogicLockMaxAction> = {
  id: "logic-lock-max",
  name: "Logic Lock Max",
  description:
    "Five dials in a cycle. Each twist moves two neighbors; Spin All applies +2,+3,+4,+1,+2. Hardest variant—bring all to 0.",

  initialState() {
    return { dials: [1, 3, 0, 4, 2], moves: 0 };
  },

  actions(state) {
    if (allZero(state)) return [];
    return BASE_ACTIONS;
  },

  apply(state, action) {
    const [a, b, c, d, e] = state.dials;
    let next: LogicLockMaxState = {
      dials: [a, b, c, d, e],
      moves: state.moves + 1
    };

    switch (action.id) {
      case "twist-a":
        next = { ...next, dials: [modInc(a, 1), modInc(b, 1), c, d, e] };
        break;
      case "twist-b":
        next = { ...next, dials: [a, modInc(b, 1), modInc(c, 1), d, e] };
        break;
      case "twist-c":
        next = { ...next, dials: [a, b, modInc(c, 1), modInc(d, 1), e] };
        break;
      case "twist-d":
        next = { ...next, dials: [a, b, c, modInc(d, 1), modInc(e, 1)] };
        break;
      case "twist-e":
        next = { ...next, dials: [modInc(a, 1), b, c, d, modInc(e, 1)] };
        break;
      case "spin-all":
        next = {
          ...next,
          dials: [
            modInc(a, 2),
            modInc(b, 3),
            modInc(c, 4),
            modInc(d, 1),
            modInc(e, 2)
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
