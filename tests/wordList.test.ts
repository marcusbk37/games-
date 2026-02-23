import { describe, it, expect } from "vitest";
import {
  getWordsByLength,
  getNeighbors,
  findPath,
  validateLadderConfig
} from "../lib/wordList";

describe("wordList", () => {
  it("returns 4- and 5-letter words", () => {
    const w4 = getWordsByLength(4);
    const w5 = getWordsByLength(5);
    expect(w4.length).toBeGreaterThan(0);
    expect(w5.length).toBeGreaterThan(0);
    expect(w4.every((w) => w.length === 4)).toBe(true);
    expect(w5.every((w) => w.length === 5)).toBe(true);
  });

  it("getNeighbors returns words differing by one letter", () => {
    const words = getWordsByLength(4);
    const neighbors = getNeighbors("COLD", words);
    expect(neighbors).toContain("CORD");
    expect(neighbors).toContain("GOLD");
    expect(neighbors.every((n) => n.length === 4)).toBe(true);
  });

  it("findPath returns path from COLD to WARM", () => {
    const words = getWordsByLength(4);
    const path = findPath("COLD", "WARM", words);
    expect(path).not.toBeNull();
    expect(path![0]).toBe("COLD");
    expect(path![path!.length - 1]).toBe("WARM");
    for (let i = 0; i < path!.length - 1; i++) {
      const a = path![i];
      const b = path![i + 1];
      const diff = [...a].filter((c, j) => c !== b[j]).length;
      expect(diff).toBe(1);
    }
  });

  it("validateLadderConfig accepts valid COLD -> WARM", () => {
    const result = validateLadderConfig("COLD", "WARM", 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.path[0]).toBe("COLD");
  });

  it("validateLadderConfig rejects different lengths", () => {
    const result = validateLadderConfig("COLD", "HEART", 10);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/same length/);
  });

  it("validateLadderConfig rejects word not in list", () => {
    const result = validateLadderConfig("XXXX", "WARM", 10);
    expect(result.ok).toBe(false);
  });

  it("validateLadderConfig rejects when path longer than maxMoves", () => {
    const result = validateLadderConfig("COLD", "WARM", 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Shortest path|Increase/);
  });
});
