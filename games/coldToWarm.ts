import type { GameAction, LogicGame } from "../lib/gameTypes";

export interface ColdToWarmState {
  current: string;
  target: string;
  moves: number;
  maxMoves: number;
  history: string[];
}

const START_WORD = "COLD";
const TARGET_WORD = "WARM";
const MAX_MOVES = 5;

const NEIGHBORS: Record<string, string[]> = {
  COLD: ["CORD", "COLD"],
  CORD: ["CARD", "WORD"],
  CARD: ["WARD", "CORD"],
  WORD: ["WARD", "WORM"],
  WORM: ["WORD", "WARM"],
  WARD: ["WARM", "WORD"],
  WARM: []
};

function nextOptions(word: string): string[] {
  return NEIGHBORS[word] ?? [];
}

export const coldToWarm: LogicGame<ColdToWarmState, GameAction> = {
  id: "cold-to-warm",
  name: "Cold to Warm (Word Ladder)",
  description:
    "Turn COLD into WARM by changing one letter at a time. Each step must be a valid intermediate word. You have a limited number of moves, so plan your path.",

  initialState() {
    return {
      current: START_WORD,
      target: TARGET_WORD,
      moves: 0,
      maxMoves: MAX_MOVES,
      history: [START_WORD]
    };
  },

  actions(state) {
    if (state.moves >= state.maxMoves || state.current === state.target) {
      return [];
    }

    return nextOptions(state.current).map((word) => ({
      id: word,
      label: word
    }));
  },

  apply(state, action) {
    const options = nextOptions(state.current);
    if (!options.includes(action.id)) {
      return state;
    }

    const nextWord = action.id;
    const nextMoves = state.moves + 1;

    return {
      ...state,
      current: nextWord,
      moves: nextMoves,
      history: [...state.history, nextWord]
    };
  },

  isSolved(state) {
    return state.current === state.target;
  }
};

