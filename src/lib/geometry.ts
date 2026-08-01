/**
 * Where each of the 60 squares sits on screen.
 *
 * The board is drawn as an **axis-aligned cross**, not the diagonal saltire of
 * the printed source. The engine's track is a cycle of indices and knows
 * nothing about orientation, so this is purely a rendering choice: each
 * player's arm points squarely at them across a passed device, and the arms
 * run along the viewport axes so a portrait phone is filled rather than
 * wasted on a diagonal's bounding box. It is the same 60-cell graph rotated.
 *
 * This module derives every position from `board.ts` via `locationOf`. It does
 * not rebuild the track. The track was reconstructed from the printed board
 * rather than stated in the rules, so a second copy of that knowledge here
 * could disagree with the tested one, and the tests would not catch it.
 *
 * Layout, in cell units on a 16x16 grid:
 *
 *            col 7 8
 *              ┌─┬─┐        rows 0..6    north arm
 *              │ │ │
 *   ┌─┬─┬─┬─┬─┬─┼─┼─┼─┬─┬─┬─┬─┬─┐
 *   │ │ │ │ │ │ │ │ │ │ │ │ │ │ │  row 7  west arm / centre / east arm
 *   ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
 *   │ │ │ │ │ │ │ │ │ │ │ │ │ │ │  row 8
 *   └─┴─┴─┴─┴─┴─┼─┼─┼─┴─┴─┴─┴─┴─┘
 *              │ │ │
 *              └─┴─┘        rows 9..15   south arm
 */

import { ARM_COUNT, RANKS_PER_FILE, TRACK_LENGTH, locationOf } from './game/board';

/** The board is 16 cells across: 7 ranks, the central 2, then 7 ranks. */
export const GRID = RANKS_PER_FILE * 2 + 2;

/** Abstract units per cell. Components render in these, never in pixels. */
export const CELL = 10;

/** The square viewBox the whole board is drawn into. */
export const VIEW = { width: GRID * CELL, height: GRID * CELL } as const;

/** The two central columns, and the two central rows. */
const NEAR = RANKS_PER_FILE; // 7
const FAR = RANKS_PER_FILE + 1; // 8

export interface CellPosition {
  /** Column and row on the 16x16 grid, zero-indexed from the top left. */
  readonly col: number;
  readonly row: number;
  /** Top-left corner in viewBox units. */
  readonly x: number;
  readonly y: number;
  /** Centre in viewBox units, for placing pieces and marks. */
  readonly cx: number;
  readonly cy: number;
}

/**
 * Arms run clockwise from the top, matching the pinwheel of entry squares on
 * the printed board: each arm's outbound file is the one its entry square sits
 * in, and the inbound file is its neighbour.
 */
function armCell(arm: number, file: 'outbound' | 'inbound', rank: number): [number, number] {
  // Rank 1 is the arm tip, rank 7 the square nearest the centre.
  const fromTip = rank - 1; // 0 at the tip
  const toCentre = GRID - rank; // mirrored for the far arms

  switch (arm) {
    case 0: // north: outbound runs down the far column, inbound back up the near one
      return [file === 'outbound' ? FAR : NEAR, fromTip];
    case 1: // west
      return [fromTip, file === 'outbound' ? NEAR : FAR];
    case 2: // south
      return [file === 'outbound' ? NEAR : FAR, toCentre];
    case 3: // east
      return [toCentre, file === 'outbound' ? FAR : NEAR];
    default:
      throw new Error(`Unknown arm ${arm}`);
  }
}

/** The central square crossed on the way out of each quadrant. */
function centralCell(quadrant: number): [number, number] {
  switch (quadrant) {
    case 0:
      return [NEAR, NEAR];
    case 1:
      return [NEAR, FAR];
    case 2:
      return [FAR, FAR];
    case 3:
      return [FAR, NEAR];
    default:
      throw new Error(`Unknown quadrant ${quadrant}`);
  }
}

function toPosition(col: number, row: number): CellPosition {
  const x = col * CELL;
  const y = row * CELL;
  return { col, row, x, y, cx: x + CELL / 2, cy: y + CELL / 2 };
}

/** Where a track index sits on screen. */
export function cellFor(index: number): CellPosition {
  const location = locationOf(index);
  const [col, row] =
    location.kind === 'central'
      ? centralCell(location.quadrant)
      : armCell(location.arm, location.file, location.rank);
  return toPosition(col, row);
}

/** Every cell, in track order. */
export function allCells(): CellPosition[] {
  return Array.from({ length: TRACK_LENGTH }, (_, index) => cellFor(index));
}

/**
 * The compass direction an arm points, for orienting a player's own furniture
 * (their turn strip, their pieces in hand) toward the side they sit on.
 */
export function armHeading(arm: number): 'north' | 'west' | 'south' | 'east' {
  const headings = ['north', 'west', 'south', 'east'] as const;
  if (arm < 0 || arm >= ARM_COUNT) throw new Error(`Unknown arm ${arm}`);
  return headings[arm];
}
