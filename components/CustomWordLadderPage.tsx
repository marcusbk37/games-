"use client";

import { useState, useMemo } from "react";
import { GameShell } from "./GameShell";
import {
  createCustomWordLadderGame,
  validateConfig,
  type CustomLadderConfig
} from "../games/customWordLadder";
import { getWordsByLength } from "../lib/wordList";

const DEFAULT_MAX = 10;
const WORD_LENGTHS = [4, 5] as const;

export function CustomWordLadderPage() {
  const [config, setConfig] = useState<CustomLadderConfig | null>(null);
  const [wordLength, setWordLength] = useState<4 | 5>(4);
  const [startWord, setStartWord] = useState("");
  const [endWord, setEndWord] = useState("");
  const [maxMoves, setMaxMoves] = useState(DEFAULT_MAX);
  const [error, setError] = useState<string | null>(null);

  const choices = useMemo(() => {
    const list = getWordsByLength(wordLength);
    return [...list].sort();
  }, [wordLength]);

  const handleLengthChange = (len: 4 | 5) => {
    setWordLength(len);
    setStartWord("");
    setEndWord("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validateConfig(startWord, endWord, maxMoves);
    if (err) {
      setError(err);
      return;
    }
    setConfig({
      startWord,
      endWord,
      maxMoves
    });
  };

  const handleNewPuzzle = () => {
    setConfig(null);
    setStartWord("");
    setEndWord("");
    setMaxMoves(DEFAULT_MAX);
    setError(null);
  };

  if (config) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleNewPuzzle}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:border-sky-400 hover:bg-slate-900/80"
          >
            New puzzle
          </button>
        </div>
        <GameShell game={createCustomWordLadderGame(config)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Custom Word Ladder
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Pick a start and end word from the lists. Get from one to the other by
          changing one letter at a time.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="length" className="text-xs font-medium text-slate-400">
            Word length
          </label>
          <select
            id="length"
            value={wordLength}
            onChange={(e) => handleLengthChange(Number(e.target.value) as 4 | 5)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            {WORD_LENGTHS.map((n) => (
              <option key={n} value={n}>
                {n} letters
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="start" className="text-xs font-medium text-slate-400">
            Start word
          </label>
          <select
            id="start"
            value={startWord}
            onChange={(e) => setStartWord(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Choose…</option>
            {choices.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="end" className="text-xs font-medium text-slate-400">
            End word
          </label>
          <select
            id="end"
            value={endWord}
            onChange={(e) => setEndWord(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Choose…</option>
            {choices.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="max" className="text-xs font-medium text-slate-400">
            Max moves
          </label>
          <input
            id="max"
            type="number"
            min={1}
            max={20}
            value={maxMoves}
            onChange={(e) => setMaxMoves(Number(e.target.value) || DEFAULT_MAX)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 w-24"
          />
        </div>
        {error && (
          <p className="text-sm text-amber-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!startWord || !endWord}
          className="rounded-md border border-sky-600 bg-sky-800 px-4 py-2 text-sm font-medium text-sky-100 hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          Start game
        </button>
      </form>
    </div>
  );
}
