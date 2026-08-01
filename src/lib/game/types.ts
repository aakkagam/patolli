import type { Direction, SquareKind } from './board';

export const PIECES_PER_PLAYER = 6;

/** The last square of a circuit: the one before the player's own entry square. */
export const LAST_OWN_INDEX = 59;

export type PlayerId = 0 | 1;

/**
 * A piece is in hand, somewhere on the track, or borne off. Track positions are
 * the piece owner's *own* index: 1..59 counted from that player's entry square
 * in that player's direction, never a shared board index.
 */
export type PieceState =
  | { readonly at: 'hand' }
  | { readonly at: 'track'; readonly ownIndex: number }
  | { readonly at: 'off' };

export interface PlayerState {
  /** Which arm of the saltire this player enters from. */
  readonly arm: number;
  /** Chosen at first entry and fixed thereafter; null until then. */
  readonly direction: Direction | null;
  readonly pieces: readonly PieceState[];
  readonly counters: number;
}

/**
 * What the last move did. Carried on the state so the UI can explain a rule at
 * the moment it bites without re-deriving it.
 */
export interface MoveOutcome {
  readonly kind: 'entered' | 'advanced' | 'borneOff' | 'noLegalMove' | 'noScore';
  readonly player: PlayerId;
  /** Index into the player's pieces array; -1 when no piece moved. */
  readonly pieceIndex: number;
  /** Own index the piece left, or null when it came from hand. */
  readonly from: number | null;
  /** Own index the piece reached, or null when it bore off. */
  readonly to: number | null;
  readonly landedOn: SquareKind | null;
  readonly extraTurn: boolean;
  /** Counters actually handed to the opponent (may be less than owed). */
  readonly paidToOpponent: number;
  /** Counters actually paid into the pot (may be less than owed). */
  readonly paidToPot: number;
  /** Counters actually collected from the opponent. */
  readonly collectedFromOpponent: number;
}

export interface GameState {
  readonly players: readonly [PlayerState, PlayerState];
  readonly turn: PlayerId;
  /** Score awaiting a move, or null when the player has yet to throw. */
  readonly pendingThrow: number | null;
  readonly pot: number;
  /** The agreed stake each player put in at the start. */
  readonly stake: number;
  /** The agreed penalty amount; wedge squares cost double this. */
  readonly penalty: number;
  readonly winner: PlayerId | null;
  readonly lastOutcome: MoveOutcome | null;
}

/**
 * Entering carries the direction because a player picks theirs at first entry,
 * and because the two directions are genuinely different moves: they lead to
 * different squares, which may or may not be occupied.
 */
export type Move =
  | { readonly kind: 'enter'; readonly direction: Direction }
  | { readonly kind: 'advance'; readonly pieceIndex: number };

export function opponentOf(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0;
}

export function piecesInHand(player: PlayerState): number {
  return player.pieces.filter((piece) => piece.at === 'hand').length;
}

export function piecesOnTrack(player: PlayerState): number {
  return player.pieces.filter((piece) => piece.at === 'track').length;
}

export function piecesBorneOff(player: PlayerState): number {
  return player.pieces.filter((piece) => piece.at === 'off').length;
}
