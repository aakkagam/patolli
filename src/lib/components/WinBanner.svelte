<script lang="ts">
  import { game } from '../store.svelte';
  import type { PlayerId } from '../game/types';

  interface Props {
    winner: PlayerId;
    pot: number;
  }

  const { winner, pot }: Props = $props();
  const isDisc = $derived(winner === 0);
</script>

<div class="banner" role="status">
  <p class="who">
    <span class={['mark', isDisc ? 'disc' : 'tile']} aria-hidden="true"></span>
    {isDisc ? 'Red' : 'Blue'} bears off the last piece
  </p>
  <p class="pot">and takes the pot of {pot}</p>
  <button class="primary" onclick={() => game.restart()}>Play again</button>
</div>

<style>
  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-md);
    text-align: center;
  }

  .who {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--size-display);
    line-height: var(--leading-display);
    letter-spacing: var(--tracking-display);
  }

  .pot {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--size-headline);
    color: var(--ulli-muted);
  }

  .mark {
    width: 1.4rem;
    height: 1.4rem;
    border: 1px solid var(--ulli);
    flex: none;
  }

  .mark.disc {
    border-radius: var(--radius-pill);
    background: var(--cochineal);
  }

  .mark.tile {
    border-radius: 2px;
    background: var(--indigo);
  }

  .primary {
    min-height: var(--target-min);
    margin-top: var(--space-sm);
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
  }

  .primary:hover {
    background: var(--cochineal-deep);
  }
</style>
