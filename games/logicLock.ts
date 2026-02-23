import type { GameAction, LogicGame } from "../lib/gameTypes";

type DialValue = 0 | 1 | 2 | 3 | 4;

interface LogicLockState {
  dials: [DialValue, DialValue, DialValue];
  moves: number;
}

type LogicLockActionId = "twist-a" | "twist-b" | "twist-c" | "spin-all";

interface LogicLockAction extends GameAction {
  id: LogicLockActionId;
}

const MAX_DIAL: DialValue = 4;

const BASE_ACTIONS: LogicLockAction[] = [
  {
    id: "twist-a",
    label: "Twist A (A+B +1)"
  },
  {
    id: "twist-b",
    label: "Twist B (B+C +1)"
  },
  {
    id: "twist-c",
    label: "Twist C (A+C +1)"
  },
  {
    id: "spin-all",
    label: "Spin All (+2,+3,+4)"
  }
];

const modInc = (value: DialValue, delta: number): DialValue => {
  return (((value + delta) % (MAX_DIAL + 1)) + (MAX_DIAL + 1)) %
    (MAX_DIAL + 1) as DialValue;
};

const isSolvedInternal = (state: LogicLockState): boolean =>
  state.dials[0] === 0 && state.dials[1] === 0 && state.dials[2] === 0;

export const logicLock: LogicGame<LogicLockState, LogicLockAction> = {
  id: "logic-lock-classic",
  name: "Logic Lock (Classic)",
  description:
    "Three interlinked dials (A, B, C). Each move nudges multiple dials at once. Bring all dials back to 0.",

  initialState() {
    // Chosen non-trivial starting configuration.
    return {
      dials: [2, 1, 4],
      moves: 0
    };
  },

  actions(state) {
    // Once solved, no more moves.
    if (isSolvedInternal(state)) {
      return [];
    }
    return BASE_ACTIONS;
  },

  apply(state, action) {
    const [a, b, c] = state.dials;

    let next: LogicLockState = {
      dials: [a, b, c],
      moves: state.moves + 1
    };

    switch (action.id) {
      case "twist-a": {
        const na = modInc(a, 1);
        const nb = modInc(b, 1);
        next = { ...next, dials: [na, nb, c] };
        break;
      }
      case "twist-b": {
        const nb = modInc(b, 1);
        const nc = modInc(c, 1);
        next = { ...next, dials: [a, nb, nc] };
        break;
      }
      case "twist-c": {
        const na = modInc(a, 1);
        const nc = modInc(c, 1);
        next = { ...next, dials: [na, b, nc] };
        break;
      }
      case "spin-all": {
        const na = modInc(a, 2);
        const nb = modInc(b, 3);
        const nc = modInc(c, 4);
        next = { ...next, dials: [na, nb, nc] };
        break;
      }
      default:
        break;
    }

    return next;
  },

  isSolved(state) {
    return isSolvedInternal(state);
  }
};

