import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SEMANTLE_WORDS } from "../../../../lib/semantleWords";
import { getGameStore } from "../store";

const EMBEDDING_MODEL = "text-embedding-3-small";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 500 }
    );
  }

  const gameId = crypto.randomUUID();
  const targetWord =
    SEMANTLE_WORDS[Math.floor(Math.random() * SEMANTLE_WORDS.length)]!;

  const openai = new OpenAI({ apiKey });
  try {
    const { data } = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: targetWord
    });
    const targetEmbedding = data[0]?.embedding;
    if (!targetEmbedding || !Array.isArray(targetEmbedding)) {
      return NextResponse.json(
        { error: "Failed to get target embedding" },
        { status: 502 }
      );
    }

    getGameStore().set(gameId, {
      targetWord,
      targetEmbedding
    });

    return NextResponse.json({ gameId });
  } catch (err) {
    console.error("Semantle start error:", err);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 502 }
    );
  }
}
