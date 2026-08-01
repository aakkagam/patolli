import { describe, expect, it } from 'vitest';
import {
  ARM_COUNT,
  CENTRAL_SQUARES,
  ENTRY_SQUARES,
  QUADRANT_LENGTH,
  RANKS_PER_FILE,
  ROUNDED_SQUARES,
  TRACK_LENGTH,
  WEDGE_SQUARES,
  entryIndexForArm,
  isRounded,
  isWedge,
  kindOf,
  locationOf,
  toTrackIndex
} from './board';

/**
 * These are the project's load-bearing assertions. The track was reconstructed
 * from the printed board rather than stated in Bell's rules, so if that reading
 * is wrong it must fail here, before any rendering is built on top of it.
 */
describe('track structure', () => {
  it('is a cycle of 60 distinct squares', () => {
    const visited = new Set<number>();
    for (let i = 0; i < TRACK_LENGTH; i++) visited.add(i);
    expect(visited.size).toBe(60);
  });

  it('wraps from the last square back to the first', () => {
    expect(toTrackIndex(0, 1, TRACK_LENGTH)).toBe(0);
    expect(toTrackIndex(0, -1, 1)).toBe(59);
  });

  it('covers every square exactly once per circuit from any entry', () => {
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      for (const direction of [1, -1] as const) {
        const entry = entryIndexForArm(arm);
        const seen = new Set<number>();
        for (let step = 0; step < TRACK_LENGTH; step++) {
          seen.add(toTrackIndex(entry, direction, step));
        }
        expect(seen.size).toBe(TRACK_LENGTH);
      }
    }
  });

  it('gives each quadrant 14 arm squares plus one central square', () => {
    for (let quadrant = 0; quadrant < ARM_COUNT; quadrant++) {
      const locations = [];
      for (let offset = 0; offset < QUADRANT_LENGTH; offset++) {
        locations.push(locationOf(quadrant * QUADRANT_LENGTH + offset));
      }
      const armSquares = locations.filter((location) => location.kind === 'arm');
      const centralSquares = locations.filter((location) => location.kind === 'central');
      expect(armSquares).toHaveLength(14);
      expect(centralSquares).toHaveLength(1);
    }
  });

  it('runs outward to the tip, turns, and comes back inward', () => {
    // Offsets 0..6 leave the centre; 7..13 return to it.
    const outbound = [];
    const inbound = [];
    for (let offset = 0; offset < RANKS_PER_FILE; offset++) {
      outbound.push(locationOf(offset));
      inbound.push(locationOf(offset + RANKS_PER_FILE));
    }
    expect(outbound.map((l) => (l.kind === 'arm' ? l.rank : null))).toEqual([7, 6, 5, 4, 3, 2, 1]);
    expect(inbound.map((l) => (l.kind === 'arm' ? l.rank : null))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(outbound.every((l) => l.kind === 'arm' && l.file === 'outbound')).toBe(true);
    expect(inbound.every((l) => l.kind === 'arm' && l.file === 'inbound')).toBe(true);
  });

  it('uses each of the four central squares exactly once per circuit', () => {
    const entry = entryIndexForArm(0);
    const centralHits = [];
    for (let step = 0; step < TRACK_LENGTH; step++) {
      const index = toTrackIndex(entry, 1, step);
      if (kindOf(index) === 'central') centralHits.push(index);
    }
    expect(centralHits).toHaveLength(ARM_COUNT);
    expect(new Set(centralHits).size).toBe(ARM_COUNT);
    expect(CENTRAL_SQUARES).toHaveLength(ARM_COUNT);
  });

  it('places opposed players exactly half a circuit apart', () => {
    expect(Math.abs(entryIndexForArm(2) - entryIndexForArm(0))).toBe(30);
    expect(Math.abs(entryIndexForArm(3) - entryIndexForArm(1))).toBe(30);
  });

  it('gives every arm an entry square at the start of its quadrant', () => {
    expect(ENTRY_SQUARES).toEqual([0, 15, 30, 45]);
  });
});

describe('special squares', () => {
  it('has exactly eight rounded squares, two per arm at the tip', () => {
    expect(ROUNDED_SQUARES).toHaveLength(8);
    for (const index of ROUNDED_SQUARES) {
      const location = locationOf(index);
      expect(location.kind).toBe('arm');
      if (location.kind === 'arm') expect(location.rank).toBe(1);
    }
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      const inArm = ROUNDED_SQUARES.filter((index) => {
        const location = locationOf(index);
        return location.kind === 'arm' && location.arm === arm;
      });
      expect(inArm).toHaveLength(2);
    }
  });

  it('has exactly eight wedge squares, one per file per arm at rank 3', () => {
    expect(WEDGE_SQUARES).toHaveLength(8);
    for (const index of WEDGE_SQUARES) {
      const location = locationOf(index);
      expect(location.kind).toBe('arm');
      if (location.kind === 'arm') expect(location.rank).toBe(3);
    }
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      const files = WEDGE_SQUARES.filter((index) => {
        const location = locationOf(index);
        return location.kind === 'arm' && location.arm === arm;
      }).map((index) => {
        const location = locationOf(index);
        return location.kind === 'arm' ? location.file : null;
      });
      expect(new Set(files)).toEqual(new Set(['outbound', 'inbound']));
    }
  });

  it('keeps the special sets disjoint', () => {
    const rounded = new Set(ROUNDED_SQUARES);
    const wedge = new Set(WEDGE_SQUARES);
    const central = new Set(CENTRAL_SQUARES);
    for (const index of wedge) expect(rounded.has(index)).toBe(false);
    for (const index of central) {
      expect(rounded.has(index)).toBe(false);
      expect(wedge.has(index)).toBe(false);
    }
  });

  it('classifies every square exactly once', () => {
    let plain = 0;
    for (let i = 0; i < TRACK_LENGTH; i++) {
      const kind = kindOf(i);
      if (kind === 'plain') plain++;
    }
    // 60 squares less 8 rounded, 8 wedge and 4 central.
    expect(plain).toBe(40);
  });

  it('reports rounded and wedge membership consistently', () => {
    for (const index of ROUNDED_SQUARES) expect(isRounded(index)).toBe(true);
    for (const index of WEDGE_SQUARES) expect(isWedge(index)).toBe(true);
    expect(isRounded(0)).toBe(false);
    expect(isWedge(0)).toBe(false);
  });
});
