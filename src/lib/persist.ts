/**
 * Saving and restoring a game in progress.
 *
 * `GameState` is plain serializable data by design, so persistence is a JSON
 * round-trip behind a versioned key. Anything absent, malformed, or written by
 * a different schema version is discarded rather than partially applied: a
 * half-restored board is worse than a fresh one.
 */

import { ARM_COUNT, entryIndexForArm, toTrackIndex, type Direction } from './game/board';
import { LAST_OWN_INDEX, PIECES_PER_PLAYER, type GameState } from './game/types';

export const STORAGE_KEY = 'patolli:game';
export const SCHEMA_VERSION = 1;

interface Envelope {
  readonly version: number;
  readonly state: GameState;
}

/** localStorage is absent under SSR and throws in some privacy modes. */
function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** Persist a game in progress. Failures are swallowed: play must never break. */
export function save(state: GameState): void {
  const store = storage();
  if (!store) return;
  try {
    const envelope: Envelope = { version: SCHEMA_VERSION, state };
    store.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // A full quota or a blocked write is not worth interrupting a game over.
  }
}

/** Forget any saved game. */
export function clear(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do; the next save overwrites it anyway.
  }
}

/**
 * Restore a game in progress, or null when there is nothing usable to restore.
 * A finished game is deliberately not restored: reloading should not drop the
 * player back into a match that has already been decided.
 */
export function load(): GameState | null {
  const store = storage();
  if (!store) return null;

  let raw: string | null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isEnvelope(parsed)) return null;
  if (parsed.version !== SCHEMA_VERSION) return null;
  if (!isGameState(parsed.state)) return null;
  if (parsed.state.winner !== null) return null;

  return parsed.state;
}

function isEnvelope(value: unknown): value is Envelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    typeof (value as Envelope).version === 'number' &&
    'state' in value
  );
}

/** A whole, non-negative count. JSON admits 5.5 and 1e9 just as readily as 5. */
function isCount(value: unknown, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

/**
 * Structural validation.
 *
 * Shallow in the sense that it does not replay the game, but it must be strict
 * enough that anything it accepts can actually be drawn and played. Type tags
 * alone are not enough: a non-integer or out-of-range `ownIndex` is valid JSON
 * and would put a piece somewhere the board has no square for. The consistency
 * checks at the end are the ones that matter most, because two pieces sharing a
 * square is precisely the state the rules exist to make impossible.
 */
function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Partial<GameState>;

  if (!Array.isArray(state.players) || state.players.length !== 2) return false;

  const occupied = new Set<number>();

  for (const side of state.players) {
    if (typeof side !== 'object' || side === null) return false;
    if (!isCount(side.arm, ARM_COUNT - 1)) return false;
    if (side.direction !== 1 && side.direction !== -1 && side.direction !== null) return false;
    if (!isCount(side.counters)) return false;
    if (!Array.isArray(side.pieces) || side.pieces.length !== PIECES_PER_PLAYER) return false;

    const ownIndices = new Set<number>();
    for (const piece of side.pieces) {
      if (typeof piece !== 'object' || piece === null) return false;
      if (piece.at === 'track') {
        // Own index 0 is the entry square, which a piece passes but never rests
        // on, and 59 always bears off rather than resting.
        if (!isCount(piece.ownIndex, LAST_OWN_INDEX - 1) || piece.ownIndex < 1) return false;
        // A player cannot have two pieces stacked on one square.
        if (ownIndices.has(piece.ownIndex)) return false;
        ownIndices.add(piece.ownIndex);
      } else if (piece.at !== 'hand' && piece.at !== 'off') {
        return false;
      }
    }

    // A piece cannot be on the track before its owner has chosen a direction.
    if (ownIndices.size > 0 && side.direction === null) return false;

    // Nor can the two players' pieces share a board square.
    if (side.direction !== null) {
      const entry = entryIndexForArm(side.arm);
      for (const ownIndex of ownIndices) {
        const square = toTrackIndex(entry, side.direction as Direction, ownIndex);
        if (occupied.has(square)) return false;
        occupied.add(square);
      }
    }
  }

  if (state.turn !== 0 && state.turn !== 1) return false;
  if (state.pendingThrow !== null && !isCount(state.pendingThrow)) return false;
  if (!isCount(state.pot)) return false;
  if (!isCount(state.stake)) return false;
  if (!isCount(state.penalty)) return false;
  if (state.winner !== null && state.winner !== 0 && state.winner !== 1) return false;
  // Required by GameState, so a payload lacking it is not one.
  if (!('lastOutcome' in state)) return false;
  if (state.lastOutcome !== null && typeof state.lastOutcome !== 'object') return false;

  return true;
}
