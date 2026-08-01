/**
 * The reactive bridge between the pure rules and the UI.
 *
 * Randomness lives here and nowhere else: the store draws the bean faces and
 * hands them to the pure layer, which keeps every rule deterministically
 * testable. Nothing in here decides a rule. Anything that looks like one
 * belongs in `src/lib/game/`, exposed as a read-only helper.
 *
 * Game state is held in `$state.raw` rather than `$state`. The rules return a
 * whole new `GameState` on every transition and nothing is mutated in place,
 * so the deep proxying `$state` performs would be paid for and never used.
 *
 * This is a singleton module, which the Svelte docs advise against because
 * module state leaks between users under SSR. That cannot happen here: this is
 * a client-only SPA with one game per tab. Recorded so nobody "fixes" it in
 * either direction without a reason.
 */

import { BEAN_COUNT, scoreThrow, type BeanFace, type BeanThrow } from './game/beans';
import { entryIndexForArm, toTrackIndex, type Direction } from './game/board';
import { applyMove, applyThrow, createGame, legalMoves, resolveOpening } from './game/rules';
import {
  LAST_OWN_INDEX,
  opponentOf,
  piecesInHand,
  type GameState,
  type Move,
  type PlayerId
} from './game/types';
import { clear, load, save } from './persist';

export const DEFAULT_STAKE = 5;
export const DEFAULT_PENALTY = 1;
export const DEFAULT_COUNTERS = 20;
export const MAX_STAKE = 10;
export const MAX_PENALTY = 5;

/** Setup, then the opening throw ritual, then play. */
export type Phase = 'setup' | 'opening' | 'playing';

/** Where a piece could go, and the move that would take it there. */
export interface Target {
  readonly move: Move;
  /** The board square that lights up. */
  readonly trackIndex: number;
  /** True when landing there bears the piece off rather than resting on it. */
  readonly bearsOff: boolean;
}

/** What the player has picked up, for the tap-tap path. */
export type Selection = { kind: 'hand' } | { kind: 'piece'; pieceIndex: number } | null;

function rollBeans(): BeanThrow {
  const faces: BeanFace[] = [];
  for (let i = 0; i < BEAN_COUNT; i++) faces.push(Math.random() < 0.5);
  return faces as unknown as BeanThrow;
}

class PatolliGame {
  /** Reassigned wholesale on every transition; never mutated in place. */
  #state = $state.raw<GameState>(createGame(this.#defaults(0)));
  #phase = $state.raw<Phase>('setup');
  #beans = $state.raw<BeanThrow | null>(null);
  #selection = $state.raw<Selection>(null);

  /** Opening throws, indexed by player; null until that player has thrown. */
  #openingThrows = $state.raw<[number | null, number | null]>([null, null]);
  #openingBeans = $state.raw<BeanThrow | null>(null);

  #stake = $state.raw(DEFAULT_STAKE);
  #penalty = $state.raw(DEFAULT_PENALTY);

  constructor() {
    const saved = load();
    if (saved) {
      this.#state = saved;
      this.#phase = 'playing';
    }
  }

  #defaults(startingPlayer: PlayerId) {
    return {
      startingPlayer,
      stake: DEFAULT_STAKE,
      penalty: DEFAULT_PENALTY,
      counters: DEFAULT_COUNTERS
    };
  }

  get state(): GameState {
    return this.#state;
  }
  get phase(): Phase {
    return this.#phase;
  }
  get beans(): BeanThrow | null {
    return this.#beans;
  }
  get openingBeans(): BeanThrow | null {
    return this.#openingBeans;
  }
  get openingThrows(): readonly [number | null, number | null] {
    return this.#openingThrows;
  }
  get selection(): Selection {
    return this.#selection;
  }
  get stake(): number {
    return this.#stake;
  }
  get penalty(): number {
    return this.#penalty;
  }

  readonly turn = $derived(this.#state.turn);
  readonly winner = $derived(this.#state.winner);
  readonly pendingThrow = $derived(this.#state.pendingThrow);
  readonly lastOutcome = $derived(this.#state.lastOutcome);
  readonly moves = $derived(legalMoves(this.#state));

  /** Piece indices the player to act may pick up. */
  readonly grabbable = $derived(
    new Set(
      this.moves
        .filter((move): move is Extract<Move, { kind: 'advance' }> => move.kind === 'advance')
        .map((move) => move.pieceIndex)
    )
  );

  /** True when a piece may be entered from hand this turn. */
  readonly canEnter = $derived(this.moves.some((move) => move.kind === 'enter'));

  /** True on the very first entry, when the direction is still open. */
  readonly choosingDirection = $derived(
    this.#state.players[this.#state.turn].direction === null && this.canEnter
  );

  readonly piecesInHand = $derived(piecesInHand(this.#state.players[this.#state.turn]));

  /** Where the current selection could go. Empty when nothing is selected. */
  readonly targets = $derived(this.#targetsFor(this.#selection));

  /** Every legal destination this turn, for showing the whole field of play. */
  readonly allTargets = $derived([
    ...this.#targetsFor({ kind: 'hand' }),
    ...[...this.grabbable].flatMap((pieceIndex) => this.#targetsFor({ kind: 'piece', pieceIndex }))
  ]);

  #targetsFor(selection: Selection): Target[] {
    if (selection === null || this.#state.pendingThrow === null) return [];
    const player = this.#state.turn;
    const side = this.#state.players[player];
    const score = this.#state.pendingThrow;
    const entry = entryIndexForArm(side.arm);

    if (selection.kind === 'hand') {
      return this.moves
        .filter((move): move is Extract<Move, { kind: 'enter' }> => move.kind === 'enter')
        .map((move) => {
          const landing = this.#state.players[player].pieces.some((p) => p.at === 'track')
            ? 1
            : score;
          return {
            move,
            trackIndex: toTrackIndex(entry, move.direction, landing),
            bearsOff: false
          };
        });
    }

    if (!this.grabbable.has(selection.pieceIndex)) return [];
    const piece = side.pieces[selection.pieceIndex];
    if (piece.at !== 'track' || side.direction === null) return [];
    const destination = piece.ownIndex + score;
    return [
      {
        move: { kind: 'advance', pieceIndex: selection.pieceIndex },
        trackIndex: toTrackIndex(entry, side.direction as Direction, destination),
        bearsOff: destination === LAST_OWN_INDEX
      }
    ];
  }

  /** The board square a given player's own index maps to, for rendering. */
  squareFor(player: PlayerId, ownIndex: number): number | null {
    const side = this.#state.players[player];
    if (side.direction === null) return null;
    return toTrackIndex(entryIndexForArm(side.arm), side.direction, ownIndex);
  }

  // --- setup and the opening ritual ------------------------------------

  setStake(value: number): void {
    this.#stake = Math.max(1, Math.min(MAX_STAKE, Math.round(value)));
  }

  setPenalty(value: number): void {
    this.#penalty = Math.max(1, Math.min(MAX_PENALTY, Math.round(value)));
  }

  /** Leave setup and begin the opening throws. */
  beginOpening(): void {
    this.#openingThrows = [null, null];
    this.#openingBeans = null;
    this.#phase = 'opening';
  }

  /**
   * Throw for the opening. Both players throw; the higher score starts. Equal
   * scores decide nothing, so the ritual repeats.
   */
  throwForOpening(player: PlayerId): void {
    if (this.#phase !== 'opening') return;
    if (this.#openingThrows[player] !== null) return;

    const beans = rollBeans();
    this.#openingBeans = beans;
    const scores: [number | null, number | null] = [...this.#openingThrows];
    scores[player] = scoreThrow(beans);
    this.#openingThrows = scores;

    const [a, b] = scores;
    if (a === null || b === null) return;

    const winner = resolveOpening(a, b);
    if (winner === null) {
      this.#openingThrows = [null, null];
      return;
    }
    this.#startGame(winner);
  }

  #startGame(startingPlayer: PlayerId): void {
    this.#beans = null;
    this.#selection = null;
    this.#phase = 'playing';
    this.#commit(
      createGame({
        startingPlayer,
        stake: this.#stake,
        penalty: this.#penalty,
        counters: DEFAULT_COUNTERS
      })
    );
  }

  // --- play -------------------------------------------------------------

  /** Throw the beans for the player to act. */
  throwBeans(): void {
    if (this.#phase !== 'playing') return;
    if (this.#state.winner !== null || this.#state.pendingThrow !== null) return;
    const beans = rollBeans();
    this.#beans = beans;
    this.#selection = null;
    this.#commit(applyThrow(this.#state, beans));
  }

  /** Pick up a piece, or the pile in hand, for the tap-tap path. */
  select(selection: Selection): void {
    if (selection === null) {
      this.#selection = null;
      return;
    }
    if (selection.kind === 'hand' && !this.canEnter) return;
    if (selection.kind === 'piece' && !this.grabbable.has(selection.pieceIndex)) return;
    this.#selection = selection;
  }

  /** Play a move. Returns false when illegal, so the UI can bounce it back. */
  play(move: Move): boolean {
    const next = applyMove(this.#state, move);
    if (next === null) return false;
    this.#selection = null;
    this.#commit(next);
    return true;
  }

  /**
   * Play whichever legal move lands on this square.
   *
   * With a piece already picked up we only consider that piece's moves. With
   * nothing picked up we consider every legal move, so tapping a highlighted
   * square just works rather than silently doing nothing: the board offers the
   * whole field of play at that point, and an offer you cannot take is worse
   * than no offer.
   *
   * When two different pieces could both land on the square the move is
   * genuinely ambiguous, so it is refused and the player picks a piece first.
   */
  playTo(trackIndex: number): boolean {
    const pool = this.#selection === null ? this.allTargets : this.targets;
    const matches = pool.filter((candidate) => candidate.trackIndex === trackIndex);
    if (matches.length !== 1) return false;
    return this.play(matches[0].move);
  }

  /** Abandon the current game and return to stake setup. */
  restart(): void {
    clear();
    this.#beans = null;
    this.#selection = null;
    this.#openingThrows = [null, null];
    this.#openingBeans = null;
    this.#phase = 'setup';
    this.#state = createGame(this.#defaults(0));
  }

  #commit(next: GameState): void {
    this.#state = next;
    // Persist from the action rather than an effect: effects are an escape
    // hatch, and this is a plain consequence of the interaction.
    if (next.winner !== null) clear();
    else save(next);
  }
}

export const game = new PatolliGame();
export { opponentOf };
