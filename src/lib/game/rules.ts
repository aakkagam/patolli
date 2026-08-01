/**
 * The Patolli rule engine: R. C. Bell's 60-square reconstruction.
 *
 * Pure and framework-free. Every transition takes a state and returns a new
 * state, or `null` when the move is illegal. Illegality is not an edge case
 * here — an occupied square simply cannot be entered, and that prohibition is
 * the whole of the game's strategy, because nothing is ever captured.
 */

import {
  TRACK_LENGTH,
  entryIndexForArm,
  isRounded,
  isWedge,
  kindOf,
  toTrackIndex,
  type Direction
} from './board';
import { scoreThrow, type BeanThrow } from './beans';
import {
  LAST_OWN_INDEX,
  PIECES_PER_PLAYER,
  opponentOf,
  piecesBorneOff,
  piecesInHand,
  piecesOnTrack,
  type GameState,
  type Move,
  type MoveOutcome,
  type PieceState,
  type PlayerId,
  type PlayerState
} from './types';

export interface NewGameOptions {
  /** Which player takes the first turn; decided by the opening throw. */
  readonly startingPlayer: PlayerId;
  /** Counters each player puts into the pot at the start. */
  readonly stake: number;
  /** The agreed penalty; wedge squares cost double this. */
  readonly penalty: number;
  /** Counters each player holds before staking. */
  readonly counters: number;
  /** Arms the two players enter from. Opposite arms are 2 apart. */
  readonly arms?: readonly [number, number];
}

/**
 * Resolve the opening throw. Both players throw; the higher score starts.
 * Equal scores mean no decision, and the ritual repeats.
 */
export function resolveOpening(scoreA: number, scoreB: number): PlayerId | null {
  if (scoreA === scoreB) return null;
  return scoreA > scoreB ? 0 : 1;
}

export function createGame(options: NewGameOptions): GameState {
  const { startingPlayer, stake, penalty, counters } = options;
  // Every in-game payment is capped so a balance can never go negative. Staking
  // is the one place that guarantee could be broken from outside, so reject an
  // unaffordable stake rather than opening the game already in the red.
  if (stake < 0 || stake > counters) {
    throw new Error(`Stake of ${stake} is not payable from ${counters} counters`);
  }
  // Seated opposite each other, so their entry squares are half a circuit apart.
  const [armA, armB] = options.arms ?? [0, 2];

  const makePlayer = (arm: number): PlayerState => ({
    arm,
    direction: null,
    pieces: Array.from({ length: PIECES_PER_PLAYER }, (): PieceState => ({ at: 'hand' })),
    counters: counters - stake
  });

  return {
    players: [makePlayer(armA), makePlayer(armB)],
    turn: startingPlayer,
    pendingThrow: null,
    pot: stake * 2,
    stake,
    penalty,
    winner: null,
    lastOutcome: null
  };
}

/** Every track square currently holding a piece, from either player. */
export function occupiedSquares(state: GameState): Set<number> {
  const occupied = new Set<number>();
  for (const player of state.players) {
    if (player.direction === null) continue;
    const entry = entryIndexForArm(player.arm);
    for (const piece of player.pieces) {
      if (piece.at === 'track') {
        occupied.add(toTrackIndex(entry, player.direction, piece.ownIndex));
      }
    }
  }
  return occupied;
}

/** The board square a given player's own index maps to. */
export function trackIndexFor(
  state: GameState,
  player: PlayerId,
  ownIndex: number,
  direction?: Direction
): number {
  const side = state.players[player];
  const heading = direction ?? side.direction;
  if (heading === null) {
    throw new Error('Cannot map an own index before a direction is chosen');
  }
  return toTrackIndex(entryIndexForArm(side.arm), heading, ownIndex);
}

/**
 * Whether a piece may enter from hand this turn.
 *
 * The first piece enters on any score. Once a player has a piece on the board,
 * further pieces enter only on a throw of 1 — and a 1 never compels entry, so
 * this reports possibility, not obligation.
 *
 * Read literally: the test is whether a piece is on the board *now*, not
 * whether one ever was. A player whose last piece bore off, leaving pieces
 * still in hand, may therefore enter on any score again. Bell's rule 8 says
 * "once a player has one piece on the board", which is a present-tense
 * condition, and the alternative reading would strand those pieces behind a
 * 1-in-32 throw. Recorded because the wording genuinely admits both readings.
 */
function mayEnter(side: PlayerState, score: number): boolean {
  if (piecesInHand(side) === 0) return false;
  if (piecesOnTrack(side) === 0) return true;
  return score === 1;
}

/** Where an entering piece would come to rest, in the entering player's own index. */
function entryLanding(side: PlayerState, score: number): number {
  // The entry square is own index 0, so the piece lands `score` squares along.
  return piecesOnTrack(side) === 0 ? score : 1;
}

/**
 * Every move the player to act could legally make with the pending throw.
 * An empty list means the player cannot move at all and owes a penalty.
 */
export function legalMoves(state: GameState): Move[] {
  if (state.winner !== null || state.pendingThrow === null) return [];

  const score = state.pendingThrow;
  if (score <= 0) return [];

  const side = state.players[state.turn];
  const occupied = occupiedSquares(state);
  const moves: Move[] = [];

  if (mayEnter(side, score)) {
    const landing = entryLanding(side, score);
    // Before the first entry a player has no direction yet, and the two
    // choices lead to different squares, so they are genuinely different moves.
    const headings: Direction[] = side.direction === null ? [1, -1] : [side.direction];
    for (const heading of headings) {
      const target = toTrackIndex(entryIndexForArm(side.arm), heading, landing);
      if (!occupied.has(target)) {
        moves.push({ kind: 'enter', direction: heading });
      }
    }
  }

  if (side.direction !== null) {
    side.pieces.forEach((piece, pieceIndex) => {
      if (piece.at !== 'track') return;
      const destination = piece.ownIndex + score;
      // Overshooting the last square is not a move at all.
      if (destination > LAST_OWN_INDEX) return;
      const target = trackIndexFor(state, state.turn, destination);
      // Bearing off still means reaching the last square, so an opponent
      // sitting on it blocks the exit just as it blocks any other landing.
      if (occupied.has(target)) return;
      moves.push({ kind: 'advance', pieceIndex });
    });
  }

  return moves;
}

/** Move counters from one player to the other, capped at what the payer holds. */
function transfer(
  players: readonly [PlayerState, PlayerState],
  from: PlayerId,
  to: PlayerId,
  amount: number
): { players: [PlayerState, PlayerState]; moved: number } {
  const moved = Math.min(amount, players[from].counters);
  const next: [PlayerState, PlayerState] = [players[0], players[1]];
  next[from] = { ...next[from], counters: next[from].counters - moved };
  next[to] = { ...next[to], counters: next[to].counters + moved };
  return { players: next, moved };
}

/** Pay counters into the pot, capped at what the payer holds. */
function payPot(
  players: readonly [PlayerState, PlayerState],
  from: PlayerId,
  amount: number
): { players: [PlayerState, PlayerState]; moved: number } {
  const moved = Math.min(amount, players[from].counters);
  const next: [PlayerState, PlayerState] = [players[0], players[1]];
  next[from] = { ...next[from], counters: next[from].counters - moved };
  return { players: next, moved };
}

/**
 * Apply a throw. A zero score ends the turn at once. A score with no legal
 * move costs the player a penalty into the pot and ends the turn. Otherwise
 * the score becomes pending and the player must move.
 */
export function applyThrow(state: GameState, beans: BeanThrow): GameState {
  if (state.winner !== null) return state;

  const score = scoreThrow(beans);
  const player = state.turn;

  if (score === 0) {
    return {
      ...state,
      pendingThrow: null,
      turn: opponentOf(player),
      lastOutcome: {
        kind: 'noScore',
        player,
        pieceIndex: -1,
        from: null,
        to: null,
        landedOn: null,
        extraTurn: false,
        paidToOpponent: 0,
        paidToPot: 0,
        collectedFromOpponent: 0,
        potCollected: 0
      }
    };
  }

  const thrown: GameState = { ...state, pendingThrow: score };
  if (legalMoves(thrown).length > 0) return thrown;

  // Rule 12: unable to move, so pay into the pot and hand over the turn.
  const { players, moved } = payPot(state.players, player, state.penalty);
  return {
    ...state,
    players,
    pot: state.pot + moved,
    pendingThrow: null,
    turn: opponentOf(player),
    lastOutcome: {
      kind: 'noLegalMove',
      player,
      pieceIndex: -1,
      from: null,
      to: null,
      landedOn: null,
      extraTurn: false,
      paidToOpponent: 0,
      paidToPot: moved,
      collectedFromOpponent: 0,
      potCollected: 0
    }
  };
}

function sameMove(a: Move, b: Move): boolean {
  if (a.kind === 'enter' && b.kind === 'enter') return a.direction === b.direction;
  if (a.kind === 'advance' && b.kind === 'advance') return a.pieceIndex === b.pieceIndex;
  return false;
}

/**
 * Play a move. Returns the new state, or `null` when the move is not one of
 * the legal moves for the pending throw.
 */
export function applyMove(state: GameState, move: Move): GameState | null {
  if (state.winner !== null || state.pendingThrow === null) return null;
  if (!legalMoves(state).some((candidate) => sameMove(candidate, move))) return null;

  const score = state.pendingThrow;
  const player = state.turn;
  const opponent = opponentOf(player);
  const side = state.players[player];

  let players: [PlayerState, PlayerState] = [state.players[0], state.players[1]];
  let pot = state.pot;
  let pieceIndex: number;
  let from: number | null;
  let to: number | null;
  let kind: MoveOutcome['kind'];
  let direction: Direction;

  if (move.kind === 'enter') {
    direction = move.direction;
    pieceIndex = side.pieces.findIndex((piece) => piece.at === 'hand');
    from = null;
    to = entryLanding(side, score);
    kind = 'entered';
    const pieces = side.pieces.map((piece, index) =>
      index === pieceIndex ? ({ at: 'track', ownIndex: to as number } as PieceState) : piece
    );
    players[player] = { ...side, direction, pieces };
  } else {
    direction = side.direction as Direction;
    pieceIndex = move.pieceIndex;
    const piece = side.pieces[pieceIndex] as { at: 'track'; ownIndex: number };
    from = piece.ownIndex;
    const destination = piece.ownIndex + score;
    const bearsOff = destination === LAST_OWN_INDEX;
    to = bearsOff ? null : destination;
    kind = bearsOff ? 'borneOff' : 'advanced';
    const pieces = side.pieces.map((current, index) =>
      index === pieceIndex
        ? bearsOff
          ? ({ at: 'off' } as PieceState)
          : ({ at: 'track', ownIndex: destination } as PieceState)
        : current
    );
    players[player] = { ...side, pieces };
  }

  // The square the piece came to rest on decides what it costs or grants.
  // A piece that bore off left the board, so it triggers neither.
  const landedTrackIndex =
    to === null ? null : toTrackIndex(entryIndexForArm(side.arm), direction, to);
  const landedOn = landedTrackIndex === null ? null : kindOf(landedTrackIndex);

  let paidToOpponent = 0;
  let collectedFromOpponent = 0;
  let extraTurn = false;

  if (landedTrackIndex !== null && isWedge(landedTrackIndex)) {
    const result = transfer(players, player, opponent, state.penalty * 2);
    players = result.players;
    paidToOpponent = result.moved;
  }

  if (landedTrackIndex !== null && isRounded(landedTrackIndex)) {
    extraTurn = true;
  }

  if (kind === 'borneOff') {
    const result = transfer(players, opponent, player, state.penalty);
    players = result.players;
    collectedFromOpponent = result.moved;
  }

  const won = piecesBorneOff(players[player]) === PIECES_PER_PLAYER;
  let potCollected = 0;
  if (won) {
    // The winner takes the pot. Record the amount first: once transferred the
    // pot is zero, and nothing downstream could say what was won.
    potCollected = pot;
    players[player] = { ...players[player], counters: players[player].counters + pot };
    pot = 0;
  }

  return {
    ...state,
    players,
    pot,
    pendingThrow: null,
    turn: won ? player : extraTurn ? player : opponent,
    winner: won ? player : null,
    lastOutcome: {
      kind,
      player,
      pieceIndex,
      from,
      to,
      landedOn,
      extraTurn: won ? false : extraTurn,
      paidToOpponent,
      paidToPot: 0,
      collectedFromOpponent,
      potCollected
    }
  };
}

/** Convenience for reading the board: every occupied square and its owner. */
export function boardOccupancy(state: GameState): Map<number, PlayerId> {
  const occupancy = new Map<number, PlayerId>();
  state.players.forEach((side, index) => {
    if (side.direction === null) return;
    const entry = entryIndexForArm(side.arm);
    for (const piece of side.pieces) {
      if (piece.at === 'track') {
        occupancy.set(toTrackIndex(entry, side.direction, piece.ownIndex), index as PlayerId);
      }
    }
  });
  return occupancy;
}

export { TRACK_LENGTH, piecesBorneOff, piecesInHand, piecesOnTrack };
