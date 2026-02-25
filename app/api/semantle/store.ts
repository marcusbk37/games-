export interface SemantleGame {
  targetWord: string;
  targetEmbedding: number[];
}

const games = new Map<string, SemantleGame>();

export function getGameStore(): Map<string, SemantleGame> {
  return games;
}
