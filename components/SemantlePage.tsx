"use client";

import { useState, useCallback, useEffect } from "react";
import { semantle } from "../games/semantle";

type GuessEntry = { word: string; similarity: number };

export function SemantlePage() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [won, setWon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = useCallback(async () => {
    setStarting(true);
    setError(null);
    setGuesses([]);
    setWon(false);
    setInput("");
    setGameId(null);

    try {
      const res = await fetch("/api/semantle/start", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? res.statusText);
      }
      const data = (await res.json()) as { gameId: string };
      setGameId(data.gameId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const submitGuess = async () => {
    const word = input.trim().toLowerCase();
    if (!word || !gameId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/semantle/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, word })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data.error as string) ?? res.statusText);
        return;
      }

      const { similarity, won: isWon } = data as { similarity: number; won: boolean };
      setGuesses((prev) => [...prev, { word, similarity }]);
      setInput("");
      if (isWon) setWon(true);
    } finally {
      setLoading(false);
    }
  };

  const bestSoFar = guesses.length
    ? Math.max(...guesses.map((g) => g.similarity))
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {semantle.name}
          </h2>
          {semantle.description && (
            <p className="mt-1 text-sm text-slate-300">
              {semantle.description}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Guess words; you&apos;ll get a similarity score from 0 to 100. The
            secret word is from a fixed list — keep guessing until you hit 100!
          </p>
        </div>
        <button
          type="button"
          onClick={startGame}
          disabled={starting}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400 hover:bg-slate-900/80 disabled:opacity-50"
        >
          {starting ? "Starting…" : "New game"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-200">
          {error}
        </div>
      )}

      {!gameId && !starting && (
        <p className="text-sm text-slate-400">
          Could not start a game. Check that OPENAI_API_KEY is set in .env.local
          and try New game.
        </p>
      )}

      {gameId && (
        <>
          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Guesses
            </h3>
            {guesses.length === 0 && (
              <p className="text-sm text-slate-500">
                Enter a word below. Your guesses will appear here with a
                similarity score.
              </p>
            )}
            <ul className="mt-2 w-fit space-y-1.5">
              {guesses.map((g, i) => (
                <li
                  key={`${g.word}-${i}`}
                  className="grid grid-cols-[10rem_3rem] gap-3 items-center rounded-md bg-slate-800/60 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-slate-100">
                    {g.word}
                  </span>
                  <span
                    className={
                      "text-right tabular-nums " +
                      (g.similarity >= 99
                        ? "text-emerald-400 font-semibold"
                        : g.similarity >= 70
                          ? "text-amber-300"
                          : g.similarity >= 40
                            ? "text-slate-300"
                            : "text-slate-500")
                    }
                  >
                    {g.similarity}%
                  </span>
                </li>
              ))}
            </ul>
            {guesses.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Best so far: {bestSoFar}%
              </p>
            )}
          </section>

          {won && (
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-center">
              <p className="text-lg font-semibold text-emerald-300">
                You got it!
              </p>
              <p className="mt-1 text-sm text-slate-300">
                The word was the last guess. Play again with New game.
              </p>
            </div>
          )}

          {!won && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Your guess
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                  placeholder="Enter a word"
                  className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none min-w-[180px]"
                  disabled={loading}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={submitGuess}
                  disabled={loading || !input.trim()}
                  className="rounded-md border border-sky-600 bg-sky-950/80 px-4 py-2 text-sm font-medium text-sky-100 hover:border-sky-500 hover:bg-sky-900/60 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? "Checking…" : "Guess"}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
