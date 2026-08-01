/**
 * The reactive bridge between the pure rules and the UI.
 *
 * Randomness lives here and nowhere else: the store draws the bean faces and
 * hands them to the pure layer, which keeps every rule deterministically
 * testable.
 *
 * Game state is held in `$state.raw` rather than `$state`. The rules return a
 * whole new `GameState` on every transition and nothing is ever mutated in
 * place, so the deep proxying `$state` performs would be paid for and never
 * used. See CLAUDE.md and Svelte's own best-practice guidance.
 *
 * This is a singleton module, which the Svelte docs advise against because
 * module state leaks between users under SSR. That cannot happen here: this is
 * a client-only SPA with one game per tab. Recorded so nobody "fixes" it in
 * either direction without a reason.
 */

import { BEAN_COUNT, type BeanFace, type BeanThrow } from './game/beans';
import { applyMove, applyThrow, createGame, legalMoves, resolveOpening } from './game/rules';
import type { GameState, Move, PlayerId } from './game/types';
import { clear, load, save } from './persist';

export const DEFAULT_STAKE = 5;
export const DEFAULT_PENALTY = 1;
export const DEFAULT_COUNTERS = 20;

function rollBeans(): BeanThrow {
  const faces: BeanFace[] = [];
  for (let i = 0; i < BEAN_COUNT; i++) faces.push(Math.random() < 0.5);
  return faces as unknown as BeanThrow;
}

class PatolliGame {
  /** Reassigned wholesale on every transition; never mutated in place. */
  #state = $state.raw<GameState>(
    load() ??
      createGame({
        startingPlayer: 0,
        stake: DEFAULT_STAKE,
        penalty: DEFAULT_PENALTY,
        counters: DEFAULT_COUNTERS
      })
  );

  /** The faces of the last throw, for showing the beans themselves. */
  #beans = $state.raw<BeanThrow | null>(null);

  get state(): GameState {
    return this.#state;
  }

  get beans(): BeanThrow | null {
    return this.#beans;
  }

  readonly moves = $derived(legalMoves(this.#state));

  readonly turn = $derived(this.#state.turn);

  readonly winner = $derived(this.#state.winner);

  /** Throw the beans for the player to act. */
  throwBeans(): void {
    if (this.#state.winner !== null || this.#state.pendingThrow !== null) return;
    const beans = rollBeans();
    this.#beans = beans;
    this.#commit(applyThrow(this.#state, beans));
  }

  /** Play a move. Returns false when the move was illegal, so the UI can bounce it. */
  play(move: Move): boolean {
    const next = applyMove(this.#state, move);
    if (next === null) return false;
    this.#commit(next);
    return true;
  }

  /** Start a fresh game, discarding any saved one. */
  restart(startingPlayer: PlayerId = 0): void {
    clear();
    this.#beans = null;
    this.#commit(
      createGame({
        startingPlayer,
        stake: DEFAULT_STAKE,
        penalty: DEFAULT_PENALTY,
        counters: DEFAULT_COUNTERS
      })
    );
  }

  /** Decide who starts from two opening throws; null means throw again. */
  openingWinner(scoreA: number, scoreB: number): PlayerId | null {
    return resolveOpening(scoreA, scoreB);
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
