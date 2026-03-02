import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  allGames,
  findGame,
  LOGIC_LOCK_HUB_ID,
  WORD_LADDER_HUB_ID
} from "../../../games";
import { CUSTOM_WORD_LADDER_ID } from "../../../games/customWordLadder";
import { GameShell } from "../../../components/GameShell";
import { LogicLockHub } from "../../../components/LogicLockHub";
import { WordLadderHub } from "../../../components/WordLadderHub";
import { CustomWordLadderPage } from "../../../components/CustomWordLadderPage";
import { MemoryMatchPage } from "../../../components/MemoryMatchPage";
import { NonogramPage } from "../../../components/NonogramPage";
import { RedteamPasswordPage } from "../../../components/RedteamPasswordPage";
import { RushHourPage } from "../../../components/RushHourPage";
import { SokobanPage } from "../../../components/SokobanPage";
import { SemantlePage } from "../../../components/SemantlePage";

const MEMORY_MATCH_ID = "memory-match";
const NONOGRAM_ID = "nonogram";
const REDTEAM_PASSWORD_ID = "redteam-password";
const RUSH_HOUR_ID = "rush-hour";
const SOKOBAN_ID = "sokoban";
const SEMANTLE_ID = "semantle";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

function GamePageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="w-fit rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:border-sky-400 hover:bg-slate-900/80"
      >
        ← Home
      </Link>
      {children}
    </div>
  );
}

export async function generateStaticParams() {
  return [
    ...allGames.map((g) => ({ id: g.id })),
    { id: LOGIC_LOCK_HUB_ID },
    { id: WORD_LADDER_HUB_ID },
    { id: REDTEAM_PASSWORD_ID },
    { id: RUSH_HOUR_ID },
    { id: SOKOBAN_ID },
    { id: SEMANTLE_ID }
  ];
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  if (id === LOGIC_LOCK_HUB_ID) return <GamePageFrame><LogicLockHub /></GamePageFrame>;
  if (id === WORD_LADDER_HUB_ID) return <GamePageFrame><WordLadderHub /></GamePageFrame>;
  if (id === CUSTOM_WORD_LADDER_ID) return <GamePageFrame><CustomWordLadderPage /></GamePageFrame>;
  if (id === MEMORY_MATCH_ID) return <GamePageFrame><MemoryMatchPage /></GamePageFrame>;
  if (id === NONOGRAM_ID) return <GamePageFrame><NonogramPage /></GamePageFrame>;
  if (id === REDTEAM_PASSWORD_ID) return <GamePageFrame><RedteamPasswordPage /></GamePageFrame>;
  if (id === RUSH_HOUR_ID) return <GamePageFrame><RushHourPage /></GamePageFrame>;
  if (id === SOKOBAN_ID) return <GamePageFrame><SokobanPage /></GamePageFrame>;
  if (id === SEMANTLE_ID) return <GamePageFrame><SemantlePage /></GamePageFrame>;
  const game = findGame(id);
  if (!game) return notFound();
  return <GamePageFrame><GameShell gameId={id} /></GamePageFrame>;
}

