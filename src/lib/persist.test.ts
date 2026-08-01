import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SCHEMA_VERSION, STORAGE_KEY, clear, load, save } from './persist';
import { createGame } from './game/rules';
import { makeState } from './game/test-helpers';
import type { GameState } from './game/types';

/** A minimal in-memory localStorage, since tests run in the node environment. */
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number {
    return this.data.size;
  }
  clear(): void {
    this.data.clear();
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function useStorage(store: Storage): void {
  vi.stubGlobal('localStorage', store);
}

beforeEach(() => {
  vi.unstubAllGlobals();
  useStorage(new MemoryStorage());
});

const newGame = (): GameState =>
  createGame({ startingPlayer: 0, stake: 5, penalty: 1, counters: 20 });

describe('serialization', () => {
  it('round-trips any state through JSON unchanged', () => {
    const state = makeState({
      pendingThrow: 3,
      players: [
        { onTrack: [4, 17, 58], borneOff: 1, direction: 1, counters: 7 },
        { onTrack: [12], direction: -1, counters: 3 }
      ]
    });
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it('carries the whole game across a save and load', () => {
    const state = makeState({
      pendingThrow: 2,
      players: [
        { onTrack: [10, 20], borneOff: 2, direction: -1, counters: 9 },
        { onTrack: [30], direction: 1, counters: 4 }
      ]
    });
    save(state);
    const restored = load();
    expect(restored).toEqual(state);
    expect(restored?.players[0].direction).toBe(-1);
    expect(restored?.players[0].counters).toBe(9);
    expect(restored?.pot).toBe(state.pot);
    expect(restored?.penalty).toBe(state.penalty);
  });
});

describe('restoring', () => {
  it('returns null when nothing has been saved', () => {
    expect(load()).toBeNull();
  });

  it('discards a malformed payload', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(load()).toBeNull();
  });

  it('discards a payload that parses but is not a game', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: { a: 1 } }));
    expect(load()).toBeNull();
  });

  it('discards a state whose pieces do not add up', () => {
    const broken = {
      ...newGame(),
      players: [{ ...newGame().players[0], pieces: [] }, newGame().players[1]]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: broken }));
    expect(load()).toBeNull();
  });

  it('discards a non-integer or out-of-range piece position', () => {
    // Both are valid JSON but name a square the board does not have.
    for (const ownIndex of [5.5, 999, -1, 0, 59]) {
      const state = makeState({ players: [{ onTrack: [10], direction: 1 }, {}] });
      const broken = {
        ...state,
        players: [
          {
            ...state.players[0],
            pieces: [{ at: 'track', ownIndex }, ...state.players[0].pieces.slice(1)]
          },
          state.players[1]
        ]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: broken }));
      expect(load(), `ownIndex ${ownIndex} should be rejected`).toBeNull();
    }
  });

  it('discards a state with two pieces stacked on one square', () => {
    const state = makeState({ players: [{ onTrack: [10, 10], direction: 1 }, {}] });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state }));
    expect(load()).toBeNull();
  });

  it('discards a state where the two players collide on one board square', () => {
    // Player 0 own index 12 and player 1 own index 18 are the same square.
    const state = makeState({
      players: [
        { onTrack: [12], direction: 1 },
        { onTrack: [18], direction: -1 }
      ]
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state }));
    expect(load()).toBeNull();
  });

  it('discards a piece on the track before a direction was chosen', () => {
    const state = makeState({ players: [{ onTrack: [10], direction: null }, {}] });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state }));
    expect(load()).toBeNull();
  });

  it('discards a payload missing a required field', () => {
    // Build the payload without lastOutcome rather than deleting it: the field
    // is readonly, and a saved payload from an older build would simply lack it.
    const { lastOutcome: _omitted, ...withoutOutcome } = newGame();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, state: withoutOutcome })
    );
    expect(load()).toBeNull();
  });

  it('discards negative counters and pot', () => {
    const base = newGame();
    for (const broken of [
      { ...base, pot: -1 },
      { ...base, players: [{ ...base.players[0], counters: -5 }, base.players[1]] }
    ]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: broken }));
      expect(load()).toBeNull();
    }
  });

  it('discards a version it does not recognise', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION + 1, state: newGame() })
    );
    expect(load()).toBeNull();
  });

  it('does not resume a finished game', () => {
    const won: GameState = { ...newGame(), winner: 1 };
    save(won);
    expect(load()).toBeNull();
  });

  it('forgets a saved game when cleared', () => {
    save(newGame());
    expect(load()).not.toBeNull();
    clear();
    expect(load()).toBeNull();
  });
});

describe('storage failures', () => {
  it('never throws when saving is blocked', () => {
    const hostile = new MemoryStorage();
    hostile.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    useStorage(hostile);
    expect(() => save(newGame())).not.toThrow();
  });

  it('never throws when reading is blocked', () => {
    const hostile = new MemoryStorage();
    hostile.getItem = () => {
      throw new Error('SecurityError');
    };
    useStorage(hostile);
    expect(load()).toBeNull();
  });

  it('never throws when clearing is blocked', () => {
    const hostile = new MemoryStorage();
    hostile.removeItem = () => {
      throw new Error('SecurityError');
    };
    useStorage(hostile);
    expect(() => clear()).not.toThrow();
  });

  it('is inert when localStorage does not exist at all', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => save(newGame())).not.toThrow();
    expect(load()).toBeNull();
  });
});
