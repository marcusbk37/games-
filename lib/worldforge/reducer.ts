import type { Tool, WorldForgeStateV1 } from "./types";
import { defaultState, inBounds, indexFor, isWalkable, posKey } from "./model";
import { newId } from "./ids";
import { parseState } from "./serialization";

export type MoveDir = "up" | "down" | "left" | "right";

export type WorldForgeAction =
  | { type: "state.hydrate"; state: WorldForgeStateV1 }
  | { type: "character.setName"; name: string }
  | { type: "character.setColor"; color: string }
  | { type: "character.setClass"; className: WorldForgeStateV1["character"]["class"] }
  | { type: "game.start" }
  | { type: "mode.set"; mode: WorldForgeStateV1["mode"] }
  | { type: "tool.set"; tool: Tool }
  | { type: "world.applyTool"; x: number; y: number }
  | { type: "world.setSpawn"; x: number; y: number }
  | { type: "play.move"; dir: MoveDir }
  | { type: "play.interact" }
  | { type: "interaction.clear" }
  | { type: "toast.add"; kind: WorldForgeStateV1["toasts"][number]["kind"]; message: string }
  | { type: "toast.dismiss"; id: string }
  | { type: "world.reset" }
  | { type: "world.import"; raw: string };

function toast(
  state: WorldForgeStateV1,
  kind: WorldForgeStateV1["toasts"][number]["kind"],
  message: string
): WorldForgeStateV1 {
  const id = newId("toast");
  return {
    ...state,
    toasts: [...state.toasts, { id, kind, message }]
  };
}

function dismissToast(state: WorldForgeStateV1, id: string): WorldForgeStateV1 {
  return { ...state, toasts: state.toasts.filter((t) => t.id !== id) };
}

export function worldForgeReducer(
  state: WorldForgeStateV1,
  action: WorldForgeAction
): WorldForgeStateV1 {
  switch (action.type) {
    case "state.hydrate":
      return action.state;
    case "character.setName":
      return { ...state, character: { ...state.character, name: action.name } };
    case "character.setColor":
      return { ...state, character: { ...state.character, color: action.color } };
    case "character.setClass":
      return {
        ...state,
        character: { ...state.character, class: action.className }
      };
    case "game.start": {
      if (state.character.name.trim().length === 0) {
        return toast(state, "warning", "Give your character a name to begin.");
      }
      return { ...state, mode: "build" };
    }
    case "mode.set":
      return { ...state, mode: action.mode };
    case "tool.set":
      return { ...state, tool: action.tool };
    case "world.setSpawn": {
      if (!inBounds(state.world, action.x, action.y)) return state;
      const nextWorld = { ...state.world, spawn: { x: action.x, y: action.y } };
      const nextCharacter =
        state.mode === "create"
          ? { ...state.character, pos: { ...nextWorld.spawn } }
          : state.character;
      return { ...state, world: nextWorld, character: nextCharacter };
    }
    case "world.applyTool": {
      if (state.mode !== "build") return state;
      if (!inBounds(state.world, action.x, action.y)) return state;

      const idx = indexFor(state.world, action.x, action.y);
      const currentCell = state.world.cells[idx];
      const nextCells = [...state.world.cells];
      const nextNPCsByPos = { ...state.world.npcsByPos };
      const key = posKey(action.x, action.y);

      if (state.tool.kind === "terrain") {
        nextCells[idx] = { ...currentCell, terrain: state.tool.terrain };
      } else if (state.tool.kind === "object") {
        const object = state.tool.object;
        nextCells[idx] = { ...currentCell, object };
        if (object === "npc") {
          nextNPCsByPos[key] = {
            id: newId("npc"),
            name: "Villager",
            message: "Nice world you’re building."
          };
        } else {
          delete nextNPCsByPos[key];
        }
      } else if (state.tool.kind === "spawn") {
        return worldForgeReducer(state, {
          type: "world.setSpawn",
          x: action.x,
          y: action.y
        });
      } else if (state.tool.kind === "erase") {
        nextCells[idx] = { ...currentCell, object: "none" };
        delete nextNPCsByPos[key];
      }

      return {
        ...state,
        world: { ...state.world, cells: nextCells, npcsByPos: nextNPCsByPos }
      };
    }
    case "play.move": {
      if (state.mode !== "play") return state;
      const delta =
        action.dir === "up"
          ? { x: 0, y: -1 }
          : action.dir === "down"
            ? { x: 0, y: 1 }
            : action.dir === "left"
              ? { x: -1, y: 0 }
              : { x: 1, y: 0 };

      const nx = state.character.pos.x + delta.x;
      const ny = state.character.pos.y + delta.y;
      if (!inBounds(state.world, nx, ny)) return state;

      const nextCell = state.world.cells[indexFor(state.world, nx, ny)];
      if (!isWalkable(nextCell)) {
        return toast(state, "info", "Blocked.");
      }

      return {
        ...state,
        character: { ...state.character, pos: { x: nx, y: ny } }
      };
    }
    case "play.interact": {
      if (state.mode !== "play") return state;
      const { x, y } = state.character.pos;
      const idx = indexFor(state.world, x, y);
      const cell = state.world.cells[idx];
      const key = posKey(x, y);

      if (cell.object === "chest") {
        const nextCells = [...state.world.cells];
        nextCells[idx] = { ...cell, object: "none" };
        return toast(
          {
            ...state,
            world: { ...state.world, cells: nextCells },
            character: {
              ...state.character,
              xp: state.character.xp + 1,
              inventory: [...state.character.inventory, "Mysterious Gem"]
            }
          },
          "success",
          "You found a Mysterious Gem."
        );
      }

      if (cell.object === "npc") {
        const npc = state.world.npcsByPos[key];
        if (!npc) return toast(state, "info", "...");
        return {
          ...state,
          lastInteraction: { title: npc.name, body: npc.message }
        };
      }

      if (cell.object === "tree") {
        return toast(state, "info", "A sturdy tree.");
      }
      if (cell.object === "rock") {
        return toast(state, "info", "A heavy rock.");
      }
      if (cell.object === "house") {
        return toast(state, "info", "A cozy house. (Not walkable.)");
      }

      return toast(state, "info", "Nothing to interact with here.");
    }
    case "interaction.clear":
      return { ...state, lastInteraction: undefined };
    case "toast.add":
      return toast(state, action.kind, action.message);
    case "toast.dismiss":
      return dismissToast(state, action.id);
    case "world.reset":
      return defaultState();
    case "world.import": {
      const parsed = parseState(action.raw);
      if (!parsed) return toast(state, "warning", "Import failed (invalid JSON).");
      return toast({ ...parsed, mode: "build" }, "success", "Imported world.");
    }
    default:
      return state;
  }
}

