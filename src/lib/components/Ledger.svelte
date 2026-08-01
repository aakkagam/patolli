<script lang="ts">
  import type { GameState } from '../game/types';

  interface Props {
    state: GameState;
  }

  const { state }: Props = $props();
</script>

<!--
  An account book ruled onto the mat. No container, no card, no background box.
  Values change by direct replacement: the stake is real and it is recorded,
  never celebrated, so nothing here counts up or glows.
-->
<dl class="ledger">
  <div class="row">
    <dt><span class="mark disc" aria-hidden="true"></span> Red</dt>
    <dd>{state.players[0].counters}</dd>
  </div>
  <div class="row">
    <dt><span class="mark tile" aria-hidden="true"></span> Blue</dt>
    <dd>{state.players[1].counters}</dd>
  </div>
  <div class="row pot">
    <dt>Pot</dt>
    <dd>{state.pot}</dd>
  </div>
  <div class="row">
    <dt>Penalty</dt>
    <dd>{state.penalty}</dd>
  </div>
</dl>

<style>
  .ledger {
    margin: 0;
    display: grid;
    gap: 0;
    min-width: 11rem;
  }

  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-xs) 0;
    border-bottom: 1px solid var(--mat-shadow);
  }

  .row.pot {
    border-bottom-color: var(--ulli);
  }

  dt {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--size-label);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ulli-muted);
  }

  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: var(--ulli);
  }

  /* Identity by shape first, so the ledger reads in greyscale too. */
  .mark {
    width: 0.7rem;
    height: 0.7rem;
    border: 1px solid var(--ulli);
  }

  .mark.disc {
    border-radius: var(--radius-pill);
    background: var(--cochineal);
  }

  .mark.tile {
    border-radius: 1px;
    background: var(--indigo);
  }
</style>
