import { NextResponse } from "next/server";
import { REDTEAM_SECRET_PASSWORD } from "../../../../lib/redteamSecret";

export async function POST(req: Request) {
  let body: { guess?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const guess = typeof body.guess === "string" ? body.guess.trim() : "";
  const correct = guess === REDTEAM_SECRET_PASSWORD;

  return NextResponse.json({ correct });
}
