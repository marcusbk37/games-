import type { LogicGame } from "../lib/gameTypes";
import { examplePuzzle } from "./examplePuzzle";
import { logicLock } from "./logicLock";
import { logicLockMini } from "./logicLockMini";
import { logicLockPlus } from "./logicLockPlus";
import { logicLockMax } from "./logicLockMax";
import { coldToWarm } from "./coldToWarm";
import { navigationMaze } from "./navigationMaze";
import { customWordLadderPlaceholder } from "./customWordLadder";
import { memoryMatch } from "./memoryMatch";
import { redteamPassword } from "./redteamPassword";

export const allGames: LogicGame[] = [
  examplePuzzle,
  logicLock,
  logicLockMini,
  logicLockPlus,
  logicLockMax,
  coldToWarm,
  navigationMaze,
  customWordLadderPlaceholder,
  memoryMatch,
  redteamPassword
];

export function findGame(id: string): LogicGame | undefined {
  return allGames.find((g) => g.id === id);
}

/** Used for the Logic Lock hub: one card on home, one page with all variants. */
export const LOGIC_LOCK_HUB_ID = "logic-lock";
export const LOGIC_LOCK_VARIANT_IDS = [
  "logic-lock-mini",
  "logic-lock-classic",
  "logic-lock-plus",
  "logic-lock-max"
] as const;

/** Word games (Cold to Warm + Custom Word Ladder) under one hub. */
export const WORD_LADDER_HUB_ID = "word-ladder";
export const WORD_LADDER_VARIANT_IDS = ["cold-to-warm", "custom-word-ladder"] as const;

