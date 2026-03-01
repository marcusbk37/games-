"use client";

import { useState } from "react";

export function GameRequestForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/game-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("sent");
      setName("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-lg shadow-slate-950/60">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400 mb-3">
        Request a game
      </h2>
      {status === "sent" ? (
        <p className="text-sm text-slate-300">Thanks! We&apos;ll take a look.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Name (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">What would you like?</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. a daily crossword, more word games..."
              rows={3}
              required
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y min-h-[80px]"
            />
          </label>
          {status === "error" && (
            <p className="text-xs text-red-400">Something went wrong. Try again?</p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || !message.trim()}
            className="self-start rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending…" : "Submit"}
          </button>
        </form>
      )}
    </section>
  );
}
