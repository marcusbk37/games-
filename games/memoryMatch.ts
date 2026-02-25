import type { GameAction, LogicGame } from "../lib/gameTypes";

const PAIR_COUNT = 8; // 16 cards, 8 pairs
const EMOJIS = ["🌸", "🌺", "🌻", "🌼", "🌷", "🦋", "🐝", "🐞"];

export type Phase = "first" | "second" | "resolve";

export interface MemoryMatchState {
  /** Card values (pair ids 0..PAIR_COUNT-1), shuffled, length 16 */
  cards: number[];
  /** Which indices are currently face-up */
  revealed: boolean[];
  /** Which indices are matched and stay face-up */
  matched: boolean[];
  /** After first flip */
  firstIndex: number | null;
  /** After second flip when no match (for resolve) */
  secondIndex: number | null;
  phase: Phase;
  moves: number;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const memoryMatch: LogicGame<MemoryMatchState, GameAction> = {
  id: "memory-match",
  name: "Memory Match",
  description:
    "Flip cards to find matching pairs. Remember where each symbol is and match all pairs with as few moves as possible.",

  initialState(): MemoryMatchState {
    const pairIds = Array.from({ length: PAIR_COUNT }, (_, i) => i);
    const cards = shuffle([...pairIds, ...pairIds]);
    return {
      cards,
      revealed: Array(16).fill(false),
      matched: Array(16).fill(false),
      firstIndex: null,
      secondIndex: null,
      phase: "first",
      moves: 0
    };
  },

  actions(state): GameAction[] {
    if (state.phase === "resolve") {
      return [{ id: "continue", label: "Continue" }];
    }

    const actions: GameAction[] = [];
    for (let i = 0; i < 16; i++) {
      if (state.matched[i] || state.revealed[i]) continue;
      if (state.phase === "second" && state.firstIndex === i) continue;
      actions.push({
        id: `flip-${i}`,
        label: `Card ${i + 1}`,
        payload: i
      });
    }
    return actions;
  },

  apply(state, action): MemoryMatchState {
    if (action.id === "continue") {
      if (state.phase !== "resolve" || state.firstIndex == null || state.secondIndex == null) {
        return state;
      }
      const revealed = [...state.revealed];
      revealed[state.firstIndex] = false;
      revealed[state.secondIndex] = false;
      return {
        ...state,
        revealed,
        firstIndex: null,
        secondIndex: null,
        phase: "first"
      };
    }

    if (!action.id.startsWith("flip-")) return state;
    const i = Number(action.payload);
    if (Number.isNaN(i) || i < 0 || i >= 16 || state.matched[i] || state.revealed[i]) {
      return state;
    }

    if (state.phase === "first") {
      const revealed = [...state.revealed];
      revealed[i] = true;
      return {
        ...state,
        revealed,
        firstIndex: i,
        phase: "second",
        moves: state.moves + 1
      };
    }

    if (state.phase === "second" && state.firstIndex != null) {
      const revealed = [...state.revealed];
      revealed[i] = true;
      const firstVal = state.cards[state.firstIndex];
      const secondVal = state.cards[i];
      const isMatch = firstVal === secondVal;

      if (isMatch) {
        const matched = [...state.matched];
        matched[state.firstIndex] = true;
        matched[i] = true;
        return {
          ...state,
          revealed,
          matched,
          firstIndex: null,
          secondIndex: null,
          phase: "first"
        };
      }

      return {
        ...state,
        revealed,
        secondIndex: i,
        phase: "resolve"
      };
    }

    return state;
  },

  isSolved(state): boolean {
    return state.matched.every(Boolean);
  }
};

export function getEmoji(pairId: number): string {
  return EMOJIS[pairId] ?? "?";
}
