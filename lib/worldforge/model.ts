import type {
  Cell,
  Character,
  NPC,
  Terrain,
  Tool,
  World,
  WorldForgeStateV1
} from "./types";

export const WORLD_FORGE_STORAGE_KEY = "worldforge:v1";

export const TERRAIN_LABELS: Record<Terrain, string> = {
  grass: "Grass",
  water: "Water",
  sand: "Sand",
  forest: "Forest",
  mountain: "Mountain",
  road: "Road"
};

export const TERRAIN_COLORS: Record<Terrain, string> = {
  grass: "bg-emerald-700",
  water: "bg-sky-700",
  sand: "bg-amber-600",
  forest: "bg-emerald-900",
  mountain: "bg-slate-700",
  road: "bg-stone-700"
};

export const OBJECT_LABELS: Record<
  Exclude<Cell["object"], "none">,
  string
> = {
  tree: "Tree",
  rock: "Rock",
  house: "House",
  chest: "Chest",
  npc: "NPC"
};

export function indexFor(world: World, x: number, y: number): number {
  return y * world.width + x;
}

export function inBounds(world: World, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < world.width && y < world.height;
}

export function posKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function defaultWorld(width = 16, height = 10): World {
  const cells: Cell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nearEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const terrain: Terrain = nearEdge ? "forest" : "grass";
      cells.push({ terrain, object: "none" });
    }
  }

  const spawn = { x: 2, y: 2 };
  const npcsByPos: Record<string, NPC> = {
    [posKey(5, 4)]: {
      id: "npc-guide",
      name: "Guide",
      message:
        "Welcome to WorldForge. Build your world, then switch to Play to explore it."
    }
  };

  cells[indexFor({ width, height, cells, spawn, npcsByPos }, 5, 4)].object =
    "npc";
  cells[indexFor({ width, height, cells, spawn, npcsByPos }, 10, 6)].object =
    "chest";

  return { width, height, cells, spawn, npcsByPos };
}

export function defaultCharacter(world: World): Character {
  return {
    name: "",
    color: "#38bdf8",
    class: "Builder",
    hp: 10,
    xp: 0,
    inventory: [],
    pos: { ...world.spawn }
  };
}

export function defaultTool(): Tool {
  return { kind: "terrain", terrain: "grass" };
}

export function defaultState(): WorldForgeStateV1 {
  const world = defaultWorld();
  return {
    version: 1,
    mode: "create",
    tool: defaultTool(),
    world,
    character: defaultCharacter(world),
    toasts: []
  };
}

export function isWalkable(cell: Cell): boolean {
  if (cell.object === "house") return false;
  if (cell.terrain === "water") return false;
  if (cell.terrain === "mountain") return false;
  return true;
}

