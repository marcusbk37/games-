import type { WorldForgeStateV1 } from "./types";
import { defaultState } from "./model";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function serializeState(state: WorldForgeStateV1): string {
  return JSON.stringify(state);
}

export function parseState(raw: string): WorldForgeStateV1 | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.version !== 1) return null;

    const base = defaultState();
    const candidate = parsed as Partial<WorldForgeStateV1>;
    if (!candidate.world || !candidate.character) return null;

    const world = candidate.world as WorldForgeStateV1["world"];
    const character = candidate.character as WorldForgeStateV1["character"];

    if (
      typeof world.width !== "number" ||
      typeof world.height !== "number" ||
      !Array.isArray(world.cells) ||
      typeof world.spawn?.x !== "number" ||
      typeof world.spawn?.y !== "number" ||
      !isRecord(world.npcsByPos)
    ) {
      return null;
    }

    if (
      typeof character.name !== "string" ||
      typeof character.color !== "string" ||
      typeof character.class !== "string" ||
      typeof character.hp !== "number" ||
      typeof character.xp !== "number" ||
      !Array.isArray(character.inventory) ||
      typeof character.pos?.x !== "number" ||
      typeof character.pos?.y !== "number"
    ) {
      return null;
    }

    return {
      ...base,
      ...candidate,
      world,
      character
    };
  } catch {
    return null;
  }
}

