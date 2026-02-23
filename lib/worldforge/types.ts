export type WorldForgeMode = "create" | "build" | "play";

export type Terrain = "grass" | "water" | "sand" | "forest" | "mountain" | "road";

export type PlacedObject =
  | "none"
  | "tree"
  | "rock"
  | "house"
  | "chest"
  | "npc";

export type Tool =
  | { kind: "terrain"; terrain: Terrain }
  | { kind: "object"; object: Exclude<PlacedObject, "none"> }
  | { kind: "spawn" }
  | { kind: "erase" };

export interface Cell {
  terrain: Terrain;
  object: PlacedObject;
}

export interface NPC {
  id: string;
  name: string;
  message: string;
}

export interface Character {
  name: string;
  color: string;
  class: "Builder" | "Ranger" | "Mage";
  hp: number;
  xp: number;
  inventory: string[];
  pos: { x: number; y: number };
}

export interface World {
  width: number;
  height: number;
  cells: Cell[];
  spawn: { x: number; y: number };
  npcsByPos: Record<string, NPC>;
}

export interface Toast {
  id: string;
  kind: "info" | "success" | "warning";
  message: string;
}

export interface WorldForgeStateV1 {
  version: 1;
  mode: WorldForgeMode;
  tool: Tool;
  world: World;
  character: Character;
  toasts: Toast[];
  lastInteraction?: { title: string; body: string };
}

export type WorldForgeState = WorldForgeStateV1;

