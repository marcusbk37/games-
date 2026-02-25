import type { GameAction, LogicGame } from "../lib/gameTypes";

export interface Car {
  id: string;
  /** Top-left row (for horizontal) or top row (for vertical) */
  r: number;
  /** Top-left column (for horizontal) or column (for vertical) */
  c: number;
  /** Number of cells (2 or 3) */
  length: number;
  /** True = moves left/right, false = moves up/down */
  horizontal: boolean;
}

export interface RushHourState {
  rows: number;
  cols: number;
  /** Row where the exit is on the right (0-indexed) */
  exitRow: number;
  /** First car (id "red") is the one that must reach the exit */
  cars: Car[];
  moves: number;
}

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

/** Returns set of cell keys occupied by this car (excluding the car itself for overlap checks). */
export function carCells(car: Car): string[] {
  const keys: string[] = [];
  if (car.horizontal) {
    for (let i = 0; i < car.length; i++) keys.push(cellKey(car.r, car.c + i));
  } else {
    for (let i = 0; i < car.length; i++) keys.push(cellKey(car.r + i, car.c));
  }
  return keys;
}

function occupiedSet(state: RushHourState, excludeCarId?: string): Set<string> {
  const set = new Set<string>();
  for (const car of state.cars) {
    if (car.id === excludeCarId) continue;
    for (const k of carCells(car)) set.add(k);
  }
  return set;
}

/** Classic 6×6 Rush Hour: red car must reach the right exit in row 2. */
const RED_ID = "red";

const INITIAL_CARS: Car[] = [
  { id: RED_ID, r: 2, c: 0, length: 2, horizontal: true },
  { id: "truck1", r: 0, c: 0, length: 2, horizontal: false },
  { id: "car1", r: 0, c: 3, length: 3, horizontal: false },
  { id: "car2", r: 1, c: 1, length: 2, horizontal: true },
  { id: "truck2", r: 3, c: 2, length: 3, horizontal: false },
  { id: "car3", r: 4, c: 4, length: 2, horizontal: true },
  { id: "car4", r: 5, c: 4, length: 2, horizontal: true }
];

export const rushHour: LogicGame<RushHourState, GameAction> = {
  id: "rush-hour",
  name: "Rush Hour",
  description:
    "Slide the red car to the exit on the right. Cars move only along their length (horizontal cars left/right, vertical cars up/down).",

  initialState(): RushHourState {
    return {
      rows: 6,
      cols: 6,
      exitRow: 2,
      cars: JSON.parse(JSON.stringify(INITIAL_CARS)),
      moves: 0
    };
  },

  actions(state): GameAction[] {
    if (rushHour.isSolved(state)) return [];
    const occupied = occupiedSet(state);
    const actions: GameAction[] = [];

    for (const car of state.cars) {
      const otherOccupied = occupiedSet(state, car.id);

      if (car.horizontal) {
        // Left: cell (car.r, car.c - 1) must be in bounds and empty (or exit for red)
        if (car.c > 0) {
          const leftKey = cellKey(car.r, car.c - 1);
          if (!otherOccupied.has(leftKey)) {
            actions.push({ id: `${car.id}-left`, label: `${car.id} ←` });
          }
        }
        // Right: cell (car.r, car.c + length) must be in bounds and empty, or for red at exit row it can be off-board
        const rightCol = car.c + car.length;
        if (rightCol < state.cols) {
          const rightKey = cellKey(car.r, rightCol);
          if (!otherOccupied.has(rightKey)) {
            actions.push({ id: `${car.id}-right`, label: `${car.id} →` });
          }
        } else if (car.id === RED_ID && car.r === state.exitRow && rightCol === state.cols) {
          // Red at exit: one more step right wins
          actions.push({ id: `${car.id}-right`, label: `${car.id} →` });
        }
      } else {
        // Vertical: up
        if (car.r > 0) {
          const upKey = cellKey(car.r - 1, car.c);
          if (!otherOccupied.has(upKey)) {
            actions.push({ id: `${car.id}-up`, label: `${car.id} ↑` });
          }
        }
        // Down
        if (car.r + car.length < state.rows) {
          const downKey = cellKey(car.r + car.length, car.c);
          if (!otherOccupied.has(downKey)) {
            actions.push({ id: `${car.id}-down`, label: `${car.id} ↓` });
          }
        }
      }
    }

    return actions;
  },

  apply(state, action): RushHourState {
    const parts = action.id.split("-");
    if (parts.length < 2) return state;
    const carId = parts.slice(0, -1).join("-");
    const dir = parts[parts.length - 1];
    const carIndex = state.cars.findIndex((c) => c.id === carId);
    if (carIndex < 0) return state;

    const car = state.cars[carIndex];
    const otherOccupied = occupiedSet(state, car.id);

    let newCar: Car = { ...car };

    if (car.horizontal) {
      if (dir === "left" && car.c > 0 && !otherOccupied.has(cellKey(car.r, car.c - 1))) {
        newCar = { ...car, c: car.c - 1 };
      } else if (dir === "right") {
        const rightCol = car.c + car.length;
        if (rightCol < state.cols && !otherOccupied.has(cellKey(car.r, rightCol))) {
          newCar = { ...car, c: car.c + 1 };
        } else if (car.id === RED_ID && car.r === state.exitRow && rightCol === state.cols) {
          // Red exits
          newCar = { ...car, c: car.c + 1 };
        } else {
          return state;
        }
      } else {
        return state;
      }
    } else {
      if (dir === "up" && car.r > 0 && !otherOccupied.has(cellKey(car.r - 1, car.c))) {
        newCar = { ...car, r: car.r - 1 };
      } else if (
        dir === "down" &&
        car.r + car.length < state.rows &&
        !otherOccupied.has(cellKey(car.r + car.length, car.c))
      ) {
        newCar = { ...car, r: car.r + 1 };
      } else {
        return state;
      }
    }

    const newCars = state.cars.slice();
    newCars[carIndex] = newCar;
    return {
      ...state,
      cars: newCars,
      moves: state.moves + 1
    };
  },

  isSolved(state): boolean {
    const red = state.cars.find((c) => c.id === RED_ID);
    if (!red || !red.horizontal) return false;
    // Red car has reached the exit when its right end is at the right edge (or past it)
    return red.r === state.exitRow && red.c + red.length >= state.cols;
  }
};
