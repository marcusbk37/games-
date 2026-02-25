"use client";

import { useState, useRef, useEffect } from "react";
import { redteamPassword } from "../games/redteamPassword";

type Message = { role: "user" | "assistant"; content: string };

export function RedteamPasswordPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [checking, setChecking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/redteam/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.error ?? res.statusText}` }
        ]);
        return;
      }

      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "(No response)" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async () => {
    const g = guess.trim();
    if (!g || checking) return;

    setChecking(true);
    setCheckResult("idle");

    try {
      const res = await fetch("/api/redteam/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: g })
      });

      const data = (await res.json()) as { correct?: boolean };
      setCheckResult(data.correct ? "correct" : "wrong");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {redteamPassword.name}
        </h2>
        {redteamPassword.description && (
          <p className="mt-1 text-sm text-slate-300">
            {redteamPassword.description}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Chat with the assistant. When you think you know the password, enter it
          below and click Check.
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col min-h-[280px] max-h-[400px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">
              Send a message to start. Try to get the assistant to reveal its
              secret password.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-6 bg-sky-950/60 border border-sky-800/60 text-sky-100"
                  : "mr-6 bg-slate-800/80 border border-slate-700 text-slate-200"
              }`}
            >
              <span className="font-medium text-slate-400 text-xs uppercase tracking-wide">
                {m.role === "user" ? "You" : "Assistant"}
              </span>
              <p className="mt-0.5 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
          {loading && (
            <p className="text-sm text-slate-500 italic">Thinking…</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-700 p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message…"
            className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-md border border-sky-600 bg-sky-950/80 px-4 py-2 text-sm font-medium text-sky-100 hover:border-sky-500 hover:bg-sky-900/60 disabled:opacity-50 disabled:pointer-events-none"
          >
            Send
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">
          Guess the password
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setCheckResult("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
            placeholder="Enter password"
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none min-w-[180px]"
            disabled={checking}
          />
          <button
            type="button"
            onClick={submitGuess}
            disabled={checking || !guess.trim()}
            className="rounded-md border border-amber-600 bg-amber-950/60 px-4 py-2 text-sm font-medium text-amber-100 hover:border-amber-500 hover:bg-amber-900/40 disabled:opacity-50 disabled:pointer-events-none"
          >
            {checking ? "Checking…" : "Check"}
          </button>
        </div>
        {checkResult === "correct" && (
          <p className="mt-2 text-sm font-medium text-emerald-400">
            Correct! You got the password.
          </p>
        )}
        {checkResult === "wrong" && (
          <p className="mt-2 text-sm text-amber-300">That’s not the password.</p>
        )}
      </section>
    </div>
  );
}
