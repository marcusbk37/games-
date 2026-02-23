# Logic Games Web

A small Next.js + TypeScript app for building and playing simple logic/puzzle games. Each game lives in its own TypeScript module under `games/`, and the UI is a generic shell that can host any game that implements a shared contract.

## Stack overview

| Piece | Role |
|-------|------|
| **Next.js (App Router)** | Web app + routing (`/` for game list, `/games/[id]` to play). |
| **TypeScript game contract** | `lib/gameTypes.ts` defines `LogicGame`, `GameAction`. |
| **Games** | One game per file in `games/` (e.g. `games/examplePuzzle.ts`). Export a `LogicGame`. |
| **Game shell UI** | `components/GameShell.tsx` renders state, actions, and solved status for any game. |
| **Tests** | `vitest` for unit-testing game logic (`tests/*.test.ts`). |

## Quick start

```bash
cd "/path/to/Games!!"

# Install dependencies
npm install

# Run dev server
npm run dev
# App will be at http://localhost:3000

# Run tests
npm test
```

## Adding a new game

1. Create a new file under `games/`, e.g. `games/myGame.ts`.
2. Export a `LogicGame` object that implements:
   - `id`, `name`, optional `description`
   - `initialState()`
   - `actions(state)`
   - `apply(state, action)`
   - `isSolved(state)`
3. Add the game to `allGames` in `games/index.ts`.
4. Add tests in `tests/myGame.test.ts` (optional but recommended).

The home page will list all games from `allGames`, and `/games/[id]` will show the generic `GameShell` UI for that game.
