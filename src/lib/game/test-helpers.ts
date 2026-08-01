import type { BeanThrow } from './beans';
import { createGame } from './rules';
import type { Direction } from './board';
import type { GameState, PieceState, PlayerId, PlayerState } from './types';

/** Bean faces that score exactly `n`, for injecting a known throw. */
export function throwOf(n: number): BeanThrow {
  if (n === 10) return [true, true, true, true, true];
  if (n === 0) return [false, false, false, false, false];
  if (n < 0 || n > 4) throw new Error(`No bean throw scores ${n}`);
  const faces = [false, false, false, false, false];
  for (let i = 0; i < n; i++) faces[i] = true;
  return faces as unknown as BeanThrow;
}

export interface PlayerSetup {
  /** Own indices of pieces standing on the track. */
  readonly onTrack?: readonly number[];
  readonly inHand?: number;
  readonly borneOff?: number;
  readonly direction?: Direction | null;
  readonly counters?: number;
  readonly arm?: number;
}

export interface StateSetup {
  readonly turn?: PlayerId;
  readonly pendingThrow?: number | null;
  readonly pot?: number;
  readonly stake?: number;
  readonly penalty?: number;
  readonly players?: readonly [PlayerSetup, PlayerSetup];
}

const DEFAULT_COUNTERS = 20;
const DEFAULT_STAKE = 5;
const DEFAULT_PENALTY = 1;

/** Build an arbitrary reachable-looking state without playing it out. */
export function makeState(setup: StateSetup = {}): GameState {
  const base = createGame({
    startingPlayer: setup.turn ?? 0,
    stake: setup.stake ?? DEFAULT_STAKE,
    penalty: setup.penalty ?? DEFAULT_PENALTY,
    counters: DEFAULT_COUNTERS
  });

  const build = (side: PlayerState, spec: PlayerSetup | undefined): PlayerState => {
    if (!spec) return side;
    const onTrack = spec.onTrack ?? [];
    const borneOff = spec.borneOff ?? 0;
    const total = side.pieces.length;
    const inHand = spec.inHand ?? total - onTrack.length - borneOff;

    const pieces: PieceState[] = [
      ...onTrack.map((ownIndex): PieceState => ({ at: 'track', ownIndex })),
      ...Array.from({ length: borneOff }, (): PieceState => ({ at: 'off' })),
      ...Array.from({ length: inHand }, (): PieceState => ({ at: 'hand' }))
    ];
    if (pieces.length !== total) {
      throw new Error(`Player must have exactly ${total} pieces, got ${pieces.length}`);
    }

    return {
      arm: spec.arm ?? side.arm,
      direction: spec.direction === undefined ? (onTrack.length > 0 ? 1 : null) : spec.direction,
      pieces,
      counters: spec.counters ?? side.counters
    };
  };

  return {
    ...base,
    players: [
      build(base.players[0], setup.players?.[0]),
      build(base.players[1], setup.players?.[1])
    ],
    turn: setup.turn ?? 0,
    pendingThrow: setup.pendingThrow ?? null,
    pot: setup.pot ?? base.pot
  };
}
