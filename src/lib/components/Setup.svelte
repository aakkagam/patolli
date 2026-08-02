<script lang="ts">
  import Beans from './Beans.svelte';
  import { game, MAX_PENALTY, MAX_STAKE } from '../store.svelte';
  import { scoreThrow } from '../game/beans';

  const throws = $derived(game.openingThrows);
  const opening = $derived(game.openingBeans);
</script>

{#if game.phase === 'setup'}
  <section class="setup">
    <h2>Agree the stakes</h2>

    <div class="field">
      <span class="label" id="stake-label">Stake each</span>
      <div class="stepper" role="group" aria-labelledby="stake-label">
        <button onclick={() => game.setStake(game.stake - 1)} disabled={game.stake <= 1}>–</button>
        <output>{game.stake}</output>
        <button onclick={() => game.setStake(game.stake + 1)} disabled={game.stake >= MAX_STAKE}>
          +
        </button>
      </div>
    </div>

    <div class="field">
      <span class="label" id="penalty-label">Penalty</span>
      <div class="stepper" role="group" aria-labelledby="penalty-label">
        <button onclick={() => game.setPenalty(game.penalty - 1)} disabled={game.penalty <= 1}>
          –
        </button>
        <output>{game.penalty}</output>
        <button
          onclick={() => game.setPenalty(game.penalty + 1)}
          disabled={game.penalty >= MAX_PENALTY}
        >
          +
        </button>
      </div>
    </div>

    <p class="note">A wedge square costs double. The pot goes to whoever bears off all six.</p>

    <button class="primary" onclick={() => game.beginOpening()}>Throw for first turn</button>
  </section>
{:else if game.phase === 'opening'}
  <section class="setup">
    <h2>Highest throw begins</h2>

    <Beans beans={opening} score={opening ? scoreThrow(opening) : null} />

    <div class="opening">
      {#each [0, 1] as const as player (player)}
        <button
          class="primary"
          onclick={() => game.throwForOpening(player)}
          disabled={throws[player] !== null}
        >
          {player === 0 ? 'Red' : 'Blue'} throws{throws[player] !== null
            ? `: ${throws[player]}`
            : ''}
        </button>
      {/each}
    </div>

    {#if throws[0] !== null && throws[1] !== null}
      <p class="note">A tie decides nothing, so throw again.</p>
    {/if}
  </section>
{/if}

<style>
  .setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) var(--space-md);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--size-headline);
    font-weight: 400;
  }

  .field {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .label {
    font-size: var(--size-label);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ulli-muted);
  }

  /* Clamps at its bounds, so there is no invalid state to validate. */
  .stepper {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .stepper button {
    min-width: var(--target-min);
    min-height: var(--target-min);
    border: 1px solid var(--ulli);
    border-radius: var(--radius-sm);
    background: var(--mat);
    color: var(--ulli);
    font-size: var(--size-title);
    cursor: pointer;
  }

  .stepper button:disabled {
    color: var(--ulli-muted);
    cursor: default;
  }

  .stepper output {
    min-width: 2ch;
    text-align: center;
    font-size: var(--size-title);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .opening {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
  }

  .primary {
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

  .primary:hover:not(:disabled) {
    background: var(--cochineal-deep);
  }

  /* Ulli on Mat Shadow is 8.79:1; muted would be 3.80:1 and fail AA. */
  .primary:disabled {
    background: var(--mat-shadow);
    color: var(--ulli);
    opacity: 0.85;
    cursor: default;
  }

  .note {
    margin: 0;
    max-width: 34ch;
    text-align: center;
    font-size: var(--size-label);
    color: var(--ulli-muted);
  }
</style>
