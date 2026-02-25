import { notFound } from "next/navigation";
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
  if (id === LOGIC_LOCK_HUB_ID) return <LogicLockHub />;
  if (id === WORD_LADDER_HUB_ID) return <WordLadderHub />;
  if (id === CUSTOM_WORD_LADDER_ID) return <CustomWordLadderPage />;
  if (id === MEMORY_MATCH_ID) return <MemoryMatchPage />;
  if (id === NONOGRAM_ID) return <NonogramPage />;
  if (id === REDTEAM_PASSWORD_ID) return <RedteamPasswordPage />;
  if (id === RUSH_HOUR_ID) return <RushHourPage />;
  if (id === SOKOBAN_ID) return <SokobanPage />;
  if (id === SEMANTLE_ID) return <SemantlePage />;
  const game = findGame(id);
  if (!game) return notFound();
  return <GameShell gameId={id} />;
}

