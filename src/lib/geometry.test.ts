import { describe, expect, it } from 'vitest';
import { CELL, GRID, VIEW, allCells, cellFor } from './geometry';
import { ROUNDED_SQUARES, TRACK_LENGTH, locationOf } from './game/board';

/**
 * The rendering counterpart to board.test.ts. Those tests prove the track is a
 * correct 60-square cycle; these prove the cross draws that cycle faithfully,
 * with no cell landing on top of another and no jump between consecutive
 * squares.
 */
describe('board geometry', () => {
  it('gives every track index exactly one cell', () => {
    const cells = allCells();
    expect(cells).toHaveLength(TRACK_LENGTH);
    const keys = new Set(cells.map((cell) => `${cell.col},${cell.row}`));
    expect(keys.size).toBe(TRACK_LENGTH);
  });

  it('keeps every cell inside the grid', () => {
    for (const cell of allCells()) {
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(GRID);
      expect(cell.row).toBeLessThan(GRID);
    }
  });

  it('places consecutive track indices on edge-adjacent cells', () => {
    // This is the strong one: it holds across every U-turn at an arm tip and
    // across every central square, so the drawn path never jumps.
    for (let index = 0; index < TRACK_LENGTH; index++) {
      const here = cellFor(index);
      const next = cellFor((index + 1) % TRACK_LENGTH);
      const step = Math.abs(here.col - next.col) + Math.abs(here.row - next.row);
      expect(step, `index ${index} to ${(index + 1) % TRACK_LENGTH}`).toBe(1);
    }
  });

  it('turns at the arm tips rather than running off the board', () => {
    // The two rounded squares of each arm are consecutive on the track and
    // side by side on screen: that pair is the U-turn.
    for (let i = 0; i < ROUNDED_SQUARES.length; i += 2) {
      const a = cellFor(ROUNDED_SQUARES[i]);
      const b = cellFor(ROUNDED_SQUARES[i + 1]);
      const step = Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
      expect(step).toBe(1);
    }
  });

  it('lays the arms out as a cross, not a saltire', () => {
    // Every cell lies in the central band of either its row or its column,
    // which is what makes the shape a plus rather than an X.
    const inBand = (n: number) => n === 7 || n === 8;
    for (const cell of allCells()) {
      expect(inBand(cell.col) || inBand(cell.row)).toBe(true);
    }
  });

  it('puts the four central squares in the middle 2x2', () => {
    const central = [];
    for (let index = 0; index < TRACK_LENGTH; index++) {
      if (locationOf(index).kind === 'central') central.push(cellFor(index));
    }
    expect(central).toHaveLength(4);
    for (const cell of central) {
      expect([7, 8]).toContain(cell.col);
      expect([7, 8]).toContain(cell.row);
    }
    expect(new Set(central.map((c) => `${c.col},${c.row}`)).size).toBe(4);
  });

  it('reaches all four extremes, so no arm is missing', () => {
    const cells = allCells();
    expect(Math.min(...cells.map((c) => c.row))).toBe(0);
    expect(Math.max(...cells.map((c) => c.row))).toBe(GRID - 1);
    expect(Math.min(...cells.map((c) => c.col))).toBe(0);
    expect(Math.max(...cells.map((c) => c.col))).toBe(GRID - 1);
  });

  it('expresses positions in viewBox units derived from the cell size', () => {
    const cell = cellFor(0);
    expect(cell.x).toBe(cell.col * CELL);
    expect(cell.y).toBe(cell.row * CELL);
    expect(cell.cx).toBe(cell.x + CELL / 2);
    expect(VIEW.width).toBe(GRID * CELL);
    expect(VIEW.height).toBe(VIEW.width);
  });
});
