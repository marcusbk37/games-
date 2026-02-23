import type { GameAction, LogicGame } from "../lib/gameTypes";

type Status = "playing" | "won" | "lost";

interface Position {
  x: number;
  y: number;
}

/** Keys are "x,y" for serialization. */
export interface NavigationState {
  map: string[];
  visibleMap: string[]; // foggy view: only visited + visibility radius, "?" elsewhere
  player: Position;
  visited: string[]; // "x,y" of cells ever stepped on
  keysNeeded: number;
  keysCollected: number;
  movesLeft: number;
  status: Status;
}

type DirectionId = "up" | "down" | "left" | "right";

const VISIBILITY_RADIUS = 1; // only see 1 step in each direction beyond current cell

// 11x11 maze: 3 keys, winding path. S=start, K=key, G=goal, #=wall.
const BASE_MAP: readonly string[] = [
  "###########",
  "#S........#",
  "#.#.#####.#",
  "#.#.....#.#",
  "#.#.###.#.#",
  "#.#.#K.#.#",
  "#.#...#.#.#",
  "#.#.#.K.#.#",
  "#.#.....#.#",
  "#.....K.G#",
  "###########"
] as const;

function cloneMap(map: string[]): string[] {
  return map.slice();
}

function findChar(map: string[], char: string): Position | null {
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y]?.indexOf(char);
    if (x !== -1) {
      return { x, y };
    }
  }
  return null;
}

function countChar(map: string[], char: string): number {
  return map.reduce(
    (acc, row) => acc + row.split("").filter((c) => c === char).length,
    0
  );
}

function getCell(map: string[], pos: Position): string | null {
  const row = map[pos.y];
  if (!row) return null;
  if (pos.x < 0 || pos.x >= row.length) return null;
  return row[pos.x] ?? null;
}

function setCell(map: string[], pos: Position, char: string): string[] {
  return map.map((row, y) => {
    if (y !== pos.y) return row;
    const chars = row.split("");
    if (pos.x >= 0 && pos.x < chars.length) {
      chars[pos.x] = char;
    }
    return chars.join("");
  });
}

function posKey(p: Position): string {
  return `${p.x},${p.y}`;
}

function isVisible(pos: Position, player: Position, visited: string[]): boolean {
  const key = posKey(pos);
  if (visited.includes(key)) return true;
  const dx = Math.abs(pos.x - player.x);
  const dy = Math.abs(pos.y - player.y);
  return dx <= VISIBILITY_RADIUS && dy <= VISIBILITY_RADIUS;
}

function computeVisibleMap(
  map: string[],
  player: Position,
  visited: string[]
): string[] {
  return map.map((row, y) =>
    row
      .split("")
      .map((ch, x) => {
        const pos: Position = { x, y };
        if (!isVisible(pos, player, visited)) return "?";
        if (x === player.x && y === player.y) return "P";
        return ch;
      })
      .join("")
  );
}

export const navigationMaze: LogicGame<NavigationState, GameAction> = {
  id: "navigation-maze",
  name: "Navigation Maze",
  description:
    "Navigate the maze with limited sight. Collect all 3 keys and reach the goal before you run out of moves. You only see a small area around you and where you've been.",

  initialState() {
    const map = cloneMap(BASE_MAP as string[]);
    const start = findChar(map, "S");
    if (!start) {
      throw new Error("Navigation maze map is missing a start position (S).");
    }

    const keysNeeded = countChar(map, "K");
    const visited = [posKey(start)];

    const baseState: NavigationState = {
      map,
      visibleMap: computeVisibleMap(map, start, visited),
      player: start,
      visited,
      keysNeeded,
      keysCollected: 0,
      movesLeft: 38,
      status: "playing"
    };

    return baseState;
  },

  actions(state) {
    if (state.status !== "playing" || state.movesLeft <= 0) {
      return [];
    }

    const directions: Array<{ id: DirectionId; label: string; dx: number; dy: number }> = [
      { id: "up", label: "↑ Up", dx: 0, dy: -1 },
      { id: "down", label: "↓ Down", dx: 0, dy: 1 },
      { id: "left", label: "← Left", dx: -1, dy: 0 },
      { id: "right", label: "→ Right", dx: 1, dy: 0 }
    ];

    const available: GameAction[] = [];

    for (const dir of directions) {
      const nextPos: Position = {
        x: state.player.x + dir.dx,
        y: state.player.y + dir.dy
      };
      const cell = getCell(state.map, nextPos);
      if (cell && cell !== "#") {
        available.push({
          id: dir.id,
          label: dir.label
        });
      }
    }

    return available;
  },

  apply(state, action) {
    if (state.status !== "playing" || state.movesLeft <= 0) {
      return state;
    }

    const deltas: Record<DirectionId, Position> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    const delta = deltas[action.id as DirectionId];
    if (!delta) {
      return state;
    }

    const target: Position = {
      x: state.player.x + delta.x,
      y: state.player.y + delta.y
    };

    const cell = getCell(state.map, target);
    if (!cell || cell === "#") {
      // Illegal move: ignore without consuming a move.
      return state;
    }

    let map = cloneMap(state.map);
    let keysCollected = state.keysCollected;
    let status: Status = "playing";

    if (cell === "K") {
      keysCollected += 1;
      map = setCell(map, target, ".");
    }

    let movesLeft = state.movesLeft - 1;

    const atGoal = cell === "G" && keysCollected >= state.keysNeeded;

    if (atGoal) {
      status = "won";
    } else if (movesLeft <= 0) {
      status = "lost";
    } else {
      status = "playing";
    }

    const player = target;
    const visitKey = posKey(player);
    const visited = state.visited.includes(visitKey)
      ? state.visited
      : [...state.visited, visitKey];
    const visibleMap = computeVisibleMap(map, player, visited);

    const nextState: NavigationState = {
      map,
      visibleMap,
      player,
      visited,
      keysNeeded: state.keysNeeded,
      keysCollected,
      movesLeft,
      status
    };

    return nextState;
  },

  isSolved(state) {
    return state.status === "won";
  }
};

