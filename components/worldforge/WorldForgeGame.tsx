"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import type { Terrain, Tool, WorldForgeStateV1 } from "../../lib/worldforge/types";
import {
  OBJECT_LABELS,
  TERRAIN_LABELS,
  WORLD_FORGE_STORAGE_KEY,
  defaultState
} from "../../lib/worldforge/model";
import { worldForgeReducer } from "../../lib/worldforge/reducer";
import { parseState, serializeState } from "../../lib/worldforge/serialization";
import { Modal } from "./Modal";
import { WorldGrid } from "./WorldGrid";

function toolLabel(tool: Tool): string {
  if (tool.kind === "terrain") return `Terrain: ${TERRAIN_LABELS[tool.terrain]}`;
  if (tool.kind === "object") return `Object: ${OBJECT_LABELS[tool.object]}`;
  if (tool.kind === "spawn") return "Set Spawn";
  return "Eraser";
}

function terrainButton(tool: Tool, terrain: Terrain): Tool {
  if (tool.kind === "terrain" && tool.terrain === terrain) return tool;
  return { kind: "terrain", terrain };
}

function safeLoadFromStorage(): WorldForgeStateV1 | null {
  try {
    const raw = localStorage.getItem(WORLD_FORGE_STORAGE_KEY);
    if (!raw) return null;
    return parseState(raw);
  } catch {
    return null;
  }
}

function safeSaveToStorage(state: WorldForgeStateV1) {
  try {
    localStorage.setItem(WORLD_FORGE_STORAGE_KEY, serializeState(state));
  } catch {
    // ignore
  }
}

export function WorldForgeGame() {
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(worldForgeReducer, undefined, () => {
    return defaultState();
  });

  const [importExportOpen, setImportExportOpen] = useState(false);
  const [importExportText, setImportExportText] = useState("");

  useEffect(() => {
    const loaded = safeLoadFromStorage();
    if (loaded) {
      dispatch({ type: "state.hydrate", state: loaded });
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeSaveToStorage(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (state.mode !== "play") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dispatch({ type: "play.move", dir: "up" });
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        dispatch({ type: "play.move", dir: "down" });
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "play.move", dir: "left" });
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "play.move", dir: "right" });
      } else if (e.key === " " || e.key === "Enter" || e.key === "e" || e.key === "E") {
        e.preventDefault();
        dispatch({ type: "play.interact" });
      } else if (e.key === "Escape") {
        dispatch({ type: "interaction.clear" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.mode]);

  const toolText = useMemo(() => toolLabel(state.tool), [state.tool]);

  const canPlay = state.character.name.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">WorldForge</h2>
          <p className="text-sm text-slate-300">
            Build a world, create a character, then explore your creation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400"
          >
            Back to games
          </Link>
          <button
            type="button"
            onClick={() => {
              setImportExportText(serializeState(state));
              setImportExportOpen(true);
            }}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400"
          >
            Import / Export
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "world.reset" })}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-rose-400"
          >
            New World
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mode
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "mode.set", mode: "create" })}
                className={[
                  "rounded-md border px-2.5 py-1 text-xs font-medium",
                  state.mode === "create"
                    ? "border-sky-400 bg-sky-500/10 text-sky-100"
                    : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-sky-400"
                ].join(" ")}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "mode.set", mode: "build" })}
                className={[
                  "rounded-md border px-2.5 py-1 text-xs font-medium",
                  state.mode === "build"
                    ? "border-sky-400 bg-sky-500/10 text-sky-100"
                    : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-sky-400"
                ].join(" ")}
              >
                Build
              </button>
              <button
                type="button"
                disabled={!canPlay}
                onClick={() => dispatch({ type: "mode.set", mode: "play" })}
                className={[
                  "rounded-md border px-2.5 py-1 text-xs font-medium",
                  !canPlay
                    ? "cursor-not-allowed border-slate-900 bg-slate-950/50 text-slate-500"
                    : state.mode === "play"
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-emerald-400"
                ].join(" ")}
                title={!canPlay ? "Name your character first" : undefined}
              >
                Play
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {state.mode === "play" ? (
              <span>
                Controls: WASD/Arrows to move, Space/Enter/E to interact, Esc to
                close dialog
              </span>
            ) : (
              <span>Tip: Place an NPC and a Chest, then switch to Play.</span>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Character
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-300">Name</span>
                <input
                  value={state.character.name}
                  onChange={(e) =>
                    dispatch({ type: "character.setName", name: e.target.value })
                  }
                  className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  placeholder="Astra, Kade, Mira..."
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-300">Class</span>
                  <select
                    value={state.character.class}
                    onChange={(e) =>
                      dispatch({
                        type: "character.setClass",
                        className: e.target.value as WorldForgeStateV1["character"]["class"]
                      })
                    }
                    className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="Builder">Builder</option>
                    <option value="Ranger">Ranger</option>
                    <option value="Mage">Mage</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-300">Color</span>
                  <input
                    type="color"
                    value={state.character.color}
                    onChange={(e) =>
                      dispatch({
                        type: "character.setColor",
                        color: e.target.value
                      })
                    }
                    className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
                  HP: <span className="text-slate-100">{state.character.hp}</span>
                </div>
                <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
                  XP: <span className="text-slate-100">{state.character.xp}</span>
                </div>
              </div>
              {state.mode === "create" && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "game.start" })}
                  className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-100 hover:border-emerald-400"
                >
                  Begin Building
                </button>
              )}
            </div>
          </section>

          {state.mode !== "play" && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tools
              </h3>
              <p className="mt-2 text-xs text-slate-400">{toolText}</p>

              <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-slate-300">Terrain</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(TERRAIN_LABELS) as Terrain[]).map((t) => {
                      const next = terrainButton(state.tool, t);
                      const active =
                        state.tool.kind === "terrain" && state.tool.terrain === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => dispatch({ type: "tool.set", tool: next })}
                          className={[
                            "rounded-md border px-2.5 py-1 text-xs font-medium",
                            active
                              ? "border-sky-400 bg-sky-500/10 text-sky-100"
                              : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-sky-400"
                          ].join(" ")}
                        >
                          {TERRAIN_LABELS[t]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-slate-300">Objects</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(OBJECT_LABELS) as Array<
                      keyof typeof OBJECT_LABELS
                    >).map((o) => {
                      const next: Tool = { kind: "object", object: o };
                      const active =
                        state.tool.kind === "object" && state.tool.object === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => dispatch({ type: "tool.set", tool: next })}
                          className={[
                            "rounded-md border px-2.5 py-1 text-xs font-medium",
                            active
                              ? "border-sky-400 bg-sky-500/10 text-sky-100"
                              : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-sky-400"
                          ].join(" ")}
                        >
                          {OBJECT_LABELS[o]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "tool.set", tool: { kind: "spawn" } })}
                    className={[
                      "rounded-md border px-2.5 py-1 text-xs font-medium",
                      state.tool.kind === "spawn"
                        ? "border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-100"
                        : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-fuchsia-400"
                    ].join(" ")}
                  >
                    Spawn
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "tool.set", tool: { kind: "erase" } })}
                    className={[
                      "rounded-md border px-2.5 py-1 text-xs font-medium",
                      state.tool.kind === "erase"
                        ? "border-rose-400 bg-rose-500/10 text-rose-100"
                        : "border-slate-800 bg-slate-950/50 text-slate-200 hover:border-rose-400"
                    ].join(" ")}
                  >
                    Erase
                  </button>
                </div>
              </div>
            </section>
          )}

          {state.mode === "play" && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Inventory
              </h3>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {state.character.inventory.length === 0 ? (
                  <div className="text-slate-400">Empty.</div>
                ) : (
                  <ul className="list-disc pl-5 text-slate-200">
                    {state.character.inventory.map((item, i) => (
                      <li key={`${item}-${i}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </aside>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              World: {state.world.width}×{state.world.height} • Player @{" "}
              {state.character.pos.x},{state.character.pos.y}
            </div>
            {state.mode === "play" && (
              <button
                type="button"
                onClick={() => dispatch({ type: "play.interact" })}
                className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-emerald-400"
              >
                Interact
              </button>
            )}
          </div>

          <WorldGrid
            world={state.world}
            characterPos={state.character.pos}
            onCellClick={
              state.mode === "build"
                ? (x, y) => dispatch({ type: "world.applyTool", x, y })
                : undefined
            }
            showNPCNames
          />

          {state.lastInteraction && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {state.lastInteraction.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {state.lastInteraction.body}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "interaction.clear" })}
                  className="rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-1 text-xs text-slate-100 hover:border-sky-400"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {state.toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 flex max-w-sm flex-col gap-2">
          {state.toasts.slice(-4).map((t) => (
            <div
              key={t.id}
              className={[
                "flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm shadow-lg",
                t.kind === "success"
                  ? "border-emerald-800 bg-emerald-950/80 text-emerald-100"
                  : t.kind === "warning"
                    ? "border-amber-800 bg-amber-950/80 text-amber-100"
                    : "border-slate-800 bg-slate-950/80 text-slate-100"
              ].join(" ")}
            >
              <div className="pr-2">{t.message}</div>
              <button
                type="button"
                onClick={() => dispatch({ type: "toast.dismiss", id: t.id })}
                className="rounded-md border border-transparent px-2 py-0.5 text-xs text-slate-100/80 hover:border-slate-700 hover:text-slate-100"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {importExportOpen && (
        <Modal
          title="Import / Export World"
          onClose={() => setImportExportOpen(false)}
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400">
              Export gives you a JSON snapshot. Import replaces your current world.
            </p>
            <textarea
              value={importExportText}
              onChange={(e) => setImportExportText(e.target.value)}
              className="h-56 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100"
              spellCheck={false}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "world.import", raw: importExportText });
                  setImportExportOpen(false);
                }}
                className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-emerald-400"
              >
                Import
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(importExportText);
                    dispatch({
                      type: "toast.add",
                      kind: "success",
                      message: "Copied to clipboard."
                    });
                  } catch {
                    dispatch({
                      type: "toast.add",
                      kind: "warning",
                      message: "Copy failed."
                    });
                  }
                }}
                className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400"
              >
                Copy
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

