"use client";

import type { Cell, World } from "../../lib/worldforge/types";
import { TERRAIN_COLORS, posKey } from "../../lib/worldforge/model";

const OBJECT_BADGE: Record<Cell["object"], { label: string; className: string }> =
  {
    none: { label: "", className: "" },
    tree: { label: "T", className: "bg-emerald-200 text-emerald-950" },
    rock: { label: "R", className: "bg-slate-200 text-slate-950" },
    house: { label: "H", className: "bg-amber-200 text-amber-950" },
    chest: { label: "C", className: "bg-yellow-200 text-yellow-950" },
    npc: { label: "N", className: "bg-sky-200 text-sky-950" }
  };

interface Props {
  world: World;
  characterPos: { x: number; y: number };
  onCellClick?: (x: number, y: number) => void;
  showSpawn?: boolean;
  showNPCNames?: boolean;
}

export function WorldGrid({
  world,
  characterPos,
  onCellClick,
  showSpawn = true,
  showNPCNames = false
}: Props) {
  return (
    <div
      className="grid gap-1 rounded-xl border border-slate-800 bg-slate-950 p-2"
      style={{
        gridTemplateColumns: `repeat(${world.width}, minmax(0, 1fr))`
      }}
    >
      {world.cells.map((cell, idx) => {
        const x = idx % world.width;
        const y = Math.floor(idx / world.width);
        const isPlayer = characterPos.x === x && characterPos.y === y;
        const isSpawn = showSpawn && world.spawn.x === x && world.spawn.y === y;
        const badge = OBJECT_BADGE[cell.object];
        const npc = world.npcsByPos[posKey(x, y)];
        const title =
          cell.object === "npc" && npc && showNPCNames
            ? `${npc.name} (NPC)`
            : cell.object !== "none"
              ? cell.object
              : cell.terrain;

        const base = (
          <div
            className={[
              "relative aspect-square rounded-md",
              TERRAIN_COLORS[cell.terrain]
            ].join(" ")}
          >
            {badge.label && (
              <div
                className={[
                  "absolute left-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold",
                  badge.className
                ].join(" ")}
              >
                {badge.label}
              </div>
            )}
            {isSpawn && (
              <div className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-fuchsia-200 text-[10px] font-semibold text-fuchsia-950">
                S
              </div>
            )}
            {isPlayer && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-black/50 text-xs font-bold text-white">
                  @
                </div>
              </div>
            )}
          </div>
        );

        if (!onCellClick) {
          return (
            <div key={`${x},${y}`} title={title} data-testid={`cell-${x}-${y}`}>
              {base}
            </div>
          );
        }

        return (
          <button
            key={`${x},${y}`}
            type="button"
            title={title}
            onClick={() => onCellClick(x, y)}
            className="rounded-md focus-visible:outline-offset-1"
            data-testid={`cell-${x}-${y}`}
          >
            {base}
          </button>
        );
      })}
    </div>
  );
}

