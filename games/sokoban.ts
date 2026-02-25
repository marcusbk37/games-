import type { GameAction, LogicGame } from "../lib/gameTypes";

export interface Pos {
  r: number;
  c: number;
}

function posKey(p: Pos): string {
  return `${p.r},${p.c}`;
}

export interface SokobanState {
  /** Row count */
  rows: number;
  /** Column count (max width) */
  cols: number;
  /** Set of "r,c" that are walls */
  walls: Set<string>;
  /** Set of "r,c" that are target cells */
  targets: Set<string>;
  /** Current player position */
  player: Pos;
  /** Current box positions (each "r,c") */
  boxes: Set<string>;
  moves: number;
}

// # = wall, space = floor, . = target, @ = player, + = player on target, $ = box, * = box on target
// 2 boxes, 2 targets, solvable
const LEVEL: string[] = [
  "  #####",
  "  #   #",
  "  #$  #",
  "### # ##",
  "#  $@  #",
  "#   .  #",
  "#  .   #",
  "  ######"
];

function parseLevel(lines: string[]): Omit<SokobanState, "moves"> {
  const walls = new Set<string>();
  const targets = new Set<string>();
  let player: Pos | null = null;
  const boxes = new Set<string>();
  let rows = lines.length;
  let cols = 0;

  for (let r = 0; r < lines.length; r++) {
    const row = lines[r] ?? "";
    cols = Math.max(cols, row.length);
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      const key = posKey({ r, c });
      if (ch === "#") {
        walls.add(key);
      } else if (ch === "." || ch === "*" || ch === "+") {
        targets.add(key);
        if (ch === "*") boxes.add(key);
        if (ch === "+") player = { r, c };
      } else if (ch === "$") {
        boxes.add(key);
      } else if (ch === "@") {
        player = { r, c };
      }
    }
  }
  // Treat out-of-bounds (beyond row length) as walls
  for (let r = 0; r < lines.length; r++) {
    const rowLen = (lines[r] ?? "").length;
    for (let c = rowLen; c < cols; c++) {
      walls.add(posKey({ r, c }));
    }
  }

  if (!player) {
    throw new Error("Sokoban level has no player (@ or +)");
  }

  return { rows, cols, walls, targets, player, boxes };
}

const DIRECTIONS: Array<{ id: string; label: string; dr: number; dc: number }> = [
  { id: "up", label: "↑", dr: -1, dc: 0 },
  { id: "down", label: "↓", dr: 1, dc: 0 },
  { id: "left", label: "←", dr: 0, dc: -1 },
  { id: "right", label: "→", dr: 0, dc: 1 }
];

export const sokoban: LogicGame<SokobanState, GameAction> = {
  id: "sokoban",
  name: "Sokoban",
  description:
    "Push all boxes onto the target spots. You can only push one box at a time, and you cannot pull.",

  initialState(): SokobanState {
    const parsed = parseLevel(LEVEL);
    return { ...parsed, moves: 0 };
  },

  actions(state): GameAction[] {
    if (sokoban.isSolved(state)) return [];
    return DIRECTIONS.map((d) => ({ id: d.id, label: d.label }));
  },

  apply(state, action): SokobanState {
    const dir = DIRECTIONS.find((d) => d.id === action.id);
    if (!dir) return state;

    const next: Pos = {
      r: state.player.r + dir.dr,
      c: state.player.c + dir.dc
    };
    const nextKey = posKey(next);

    if (state.walls.has(nextKey)) return state;

    if (state.boxes.has(nextKey)) {
      const beyond: Pos = { r: next.r + dir.dr, c: next.c + dir.dc };
      const beyondKey = posKey(beyond);
      if (state.walls.has(beyondKey) || state.boxes.has(beyondKey)) return state;
      const newBoxes = new Set(state.boxes);
      newBoxes.delete(nextKey);
      newBoxes.add(beyondKey);
      return {
        ...state,
        player: next,
        boxes: newBoxes,
        moves: state.moves + 1
      };
    }

    return {
      ...state,
      player: next,
      moves: state.moves + 1
    };
  },

  isSolved(state): boolean {
    for (const key of state.boxes) {
      if (!state.targets.has(key)) return false;
    }
    return state.boxes.size > 0;
  }
};
