import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getGameStore } from "../store";

const EMBEDDING_MODEL = "text-embedding-3-small";

/** Cosine similarity for normalized vectors = dot product. Scale from [-1,1] to [0,100]. */
function similarityPercent(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
  }
  const clamped = Math.max(-1, Math.min(1, dot));
  return Math.round(((clamped + 1) / 2) * 100);
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 500 }
    );
  }

  let body: { gameId?: string; word?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { gameId, word } = body;
  if (!gameId || typeof word !== "string") {
    return NextResponse.json(
      { error: "gameId and word are required" },
      { status: 400 }
    );
  }

  const guessWord = word.trim().toLowerCase();
  if (!guessWord) {
    return NextResponse.json(
      { error: "word cannot be empty" },
      { status: 400 }
    );
  }

  const store = getGameStore();
  const game = store.get(gameId);
  if (!game) {
    return NextResponse.json(
      { error: "Game not found or expired" },
      { status: 404 }
    );
  }

  const openai = new OpenAI({ apiKey });
  try {
    const { data } = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: guessWord
    });
    const guessEmbedding = data[0]?.embedding;
    if (!guessEmbedding || !Array.isArray(guessEmbedding)) {
      return NextResponse.json(
        { error: "Failed to get guess embedding" },
        { status: 502 }
      );
    }

    const similarity = similarityPercent(game.targetEmbedding, guessEmbedding);
    const won =
      guessWord === game.targetWord.toLowerCase();

    return NextResponse.json({
      similarity,
      won
    });
  } catch (err) {
    console.error("Semantle guess error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate guess" },
      { status: 502 }
    );
  }
}
