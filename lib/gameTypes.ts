export type GameState = unknown;

export interface GameAction {
  id: string;
  label: string;
  payload?: unknown;
}

export interface LogicGame<S = GameState, A extends GameAction = GameAction> {
  id: string;
  name: string;
  description?: string;
  initialState(): S;
  actions(state: S): A[];
  apply(state: S, action: A): S;
  isSolved(state: S): boolean;
}

