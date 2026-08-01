<script lang="ts">
  import Beans from './Beans.svelte';
  import Ledger from './Ledger.svelte';
  import { game } from '../store.svelte';
  import { piecesBorneOff, piecesInHand } from '../game/types';

  const state = $derived(game.state);
  const side = $derived(state.players[state.turn]);
  const isDisc = $derived(state.turn === 0);

  /**
   * Name what the player may do now, not what happened last turn. The outcome
   * line below carries the consequence when there is one worth reading.
   */
  const prompt = $derived.by(() => {
    if (state.winner !== null) return 'Game over';
    if (state.pendingThrow === null) return 'Throw the beans';
    if (game.choosingDirection) return 'Choose a way round';
    if (game.moves.length === 0) return 'Nothing can move';
    if (game.selection === null) return 'Take a piece';
    return 'Place it';
  });

  const outcome = $derived.by(() => {
    const last = state.lastOutcome;
    if (!last) return null;
    if (last.kind === 'noScore') return 'No marked face, so the turn passed';
    if (last.kind === 'noLegalMove') return `No move was possible, ${last.paidToPot} to the pot`;
    if (last.paidToOpponent > 0) return `A wedge square, ${last.paidToOpponent} to the opponent`;
    if (last.kind === 'borneOff')
      return `A piece came off, ${last.collectedFromOpponent} collected`;
    if (last.extraTurn) return 'A rounded end, so another throw';
    return null;
  });
</script>

<div class="hud">
  <p class="turn">
    <span class={['mark', isDisc ? 'disc' : 'tile']} aria-hidden="true"></span>
    <span>{isDisc ? 'Red' : 'Blue'}: {prompt}</span>
  </p>

  <Beans beans={game.beans} score={state.pendingThrow} />

  <button
    class="throw-button"
    onclick={() => game.throwBeans()}
    disabled={state.winner !== null || state.pendingThrow !== null}
  >
    Throw
  </button>

  <p class="outcome" aria-live="polite">{outcome ?? ''}</p>

  <p class="stock">
    In hand {piecesInHand(side)} · Borne off {piecesBorneOff(side)}
  </p>

  <Ledger {state} />
</div>

<style>
  .hud {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
  }

  .turn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin: 0;
    font-size: var(--size-title);
    font-weight: 700;
    line-height: var(--leading-title);
  }

  /* Shape and colour together, never a coloured dot alone. */
  .mark {
    width: 0.85rem;
    height: 0.85rem;
    border: 1px solid var(--ulli);
    flex: none;
  }

  .mark.disc {
    border-radius: var(--radius-pill);
    background: var(--cochineal);
  }

  .mark.tile {
    border-radius: 1px;
    background: var(--indigo);
  }

  .throw-button {
    min-height: var(--target-min);
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: var(--radius-sm);
    background: var(--ulli);
    color: var(--mat);
    font-family: var(--font-body);
    font-size: var(--size-label);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .throw-button:hover:not(:disabled) {
    background: var(--cochineal-deep);
  }

  .throw-button:active:not(:disabled) {
    transform: translateY(1px);
  }

  .throw-button:disabled {
    background: var(--mat-shadow);
    color: var(--ulli-muted);
    cursor: default;
  }

  .outcome,
  .stock {
    margin: 0;
    min-height: 1.4em;
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ulli-muted);
    text-align: center;
  }
</style>
