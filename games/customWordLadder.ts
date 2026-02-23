import type { GameAction, LogicGame } from "../lib/gameTypes";
import {
  getWordsByLength,
  getNeighbors,
  validateLadderConfig
} from "../lib/wordList";

export const CUSTOM_WORD_LADDER_ID = "custom-word-ladder";

export interface CustomLadderConfig {
  startWord: string;
  endWord: string;
  maxMoves: number;
}

export interface CustomLadderState {
  current: string;
  target: string;
  moves: number;
  maxMoves: number;
  history: string[];
}

const DEFAULT_MAX_MOVES = 10;

/**
 * Validates config and returns an error message or null.
 */
export function validateConfig(
  startWord: string,
  endWord: string,
  maxMoves: number
): string | null {
  const result = validateLadderConfig(
    startWord.trim(),
    endWord.trim(),
    maxMoves
  );
  return result.ok ? null : result.error;
}

/**
 * Creates a word-ladder game instance for the given start/end words.
 * Call validateConfig first; only call this with valid config.
 */
export function createCustomWordLadderGame(
  config: CustomLadderConfig
): LogicGame<CustomLadderState, GameAction> {
  const start = config.startWord.trim().toUpperCase();
  const end = config.endWord.trim().toUpperCase();
  const maxMoves = Math.max(1, Math.min(20, config.maxMoves));
  const words = getWordsByLength(start.length);

  function neighbors(word: string): string[] {
    return getNeighbors(word, words);
  }

  return {
    id: CUSTOM_WORD_LADDER_ID,
    name: `Word Ladder: ${start} → ${end}`,
    description: `Change one letter at a time to get from ${start} to ${end}. Max ${maxMoves} moves.`,

    initialState() {
      return {
        current: start,
        target: end,
        moves: 0,
        maxMoves,
        history: [start]
      };
    },

    actions(state) {
      if (state.moves >= state.maxMoves || state.current === state.target) {
        return [];
      }
      return neighbors(state.current).map((word) => ({
        id: word,
        label: word
      }));
    },

    apply(state, action) {
      const options = neighbors(state.current);
      if (!options.includes(action.id)) return state;
      return {
        ...state,
        current: action.id,
        moves: state.moves + 1,
        history: [...state.history, action.id]
      };
    },

    isSolved(state) {
      return state.current === state.target;
    }
  };
}

/** Placeholder game for the list and routing; real game is created with config. */
export const customWordLadderPlaceholder: LogicGame<CustomLadderState, GameAction> = {
  id: CUSTOM_WORD_LADDER_ID,
  name: "Custom Word Ladder",
  description:
    "Pick any start and end words (4 or 5 letters). Get from one to the other by changing one letter at a time.",

  initialState() {
    return {
      current: "",
      target: "",
      moves: 0,
      maxMoves: DEFAULT_MAX_MOVES,
      history: []
    };
  },

  actions() {
    return [];
  },

  apply(state) {
    return state;
  },

  isSolved() {
    return false;
  }
};
