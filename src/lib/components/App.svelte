<script lang="ts">
  import '../../styles/base.css';
  import { TRACK_LENGTH } from '../game/board';
  import { PIECES_PER_PLAYER } from '../game/types';

  // Placeholder shell. The board, pieces, bean throw and turn flow arrive in
  // the playable-core change; this exists to prove the build works end to end
  // and that the styles foundation loads.
</script>

<main>
  <div class="shell">
    <p class="mark">Patolli</p>
    <p class="note">
      The board is being built. {TRACK_LENGTH} squares, {PIECES_PER_PLAYER} pieces a side, five beans.
    </p>
  </div>
</main>

<style>
  main {
    display: grid;
    place-items: center;
    min-height: 60dvh;
    padding: var(--space-lg) var(--space-md);
  }

  .shell {
    text-align: center;
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    padding: var(--space-lg) var(--space-md);
    background: var(--surface-raised);
  }

  .mark {
    margin: 0 0 var(--space-xs);
    font-family: var(--font-display);
    font-size: 1.5rem;
    letter-spacing: 0.02em;
  }

  .note {
    margin: 0;
    color: var(--ink-muted);
  }
</style>
