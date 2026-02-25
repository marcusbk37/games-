import type { GameAction, LogicGame } from "../lib/gameTypes";

/** Stub state; actual gameplay is in RedteamPasswordPage (chat + guess). */
type RedteamStubState = { _: "stub" };

export const redteamPassword: LogicGame<RedteamStubState, GameAction> = {
  id: "redteam-password",
  name: "Red Team Password",
  description:
    "The chatbot has a secret password and is instructed never to reveal it. Try to get it to tell you.",

  initialState(): RedteamStubState {
    return { _: "stub" };
  },

  actions(): GameAction[] {
    return [];
  },

  apply(state): RedteamStubState {
    return state;
  },

  isSolved(): boolean {
    return false;
  }
};
