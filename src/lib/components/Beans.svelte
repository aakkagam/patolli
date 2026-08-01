<script lang="ts">
  import { TUMBLE_MS, TUMBLE_STAGGER_MS, prefersReducedMotion } from '../motion';
  import type { BeanThrow } from '../game/beans';

  interface Props {
    beans: BeanThrow | null;
    /** The score. Shown as the beans land, never withheld until they stop. */
    score: number | null;
  }

  const { beans, score }: Props = $props();
  const reduced = $derived(prefersReducedMotion());
</script>

<div class="throw">
  <!--
    Only drawn when there are real faces to show. A resumed game restores the
    score but not the throw that produced it, and blank beans beside a numeral
    of 2 would contradict the one thing that is always true.
  -->
  {#if beans}
    <div class="beans" aria-hidden="true">
      {#each beans as marked, index (index)}
        <span
          class={['bean', marked && 'marked', !reduced && 'tumbling']}
          style:--delay="{index * TUMBLE_STAGGER_MS}ms"
          style:--tumble="{TUMBLE_MS}ms"
        ></span>
      {/each}
    </div>
  {/if}

  <!--
    The numeral is the fact and the tumble is theatre, so the number appears
    with the beans rather than after them. Ten is two digits: tabular figures
    keep the layout still.
  -->
  <p class="numeral" aria-live="polite">
    {#if score === null}
      <span class="waiting">–</span>
    {:else}
      {score}
    {/if}
  </p>
</div>

<style>
  .throw {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .beans {
    display: flex;
    gap: var(--space-xs);
  }

  .bean {
    width: 0.9rem;
    height: 1.4rem;
    border: 1px solid var(--ulli);
    border-radius: var(--radius-pill);
    background: var(--mat);
  }

  /* The marked face is rubber on fiber; the blank face is bare fiber. */
  .bean.marked {
    background: var(--ulli);
  }

  .bean.tumbling {
    animation: tumble var(--tumble) var(--ease-out) var(--delay) backwards;
  }

  @keyframes tumble {
    from {
      transform: translateY(-40%) rotate(-25deg);
      opacity: 0.4;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }

  .numeral {
    margin: 0;
    font-size: var(--size-numeral);
    font-weight: 700;
    line-height: var(--leading-tight);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    color: var(--ulli);
  }

  .waiting {
    color: var(--ulli-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .bean.tumbling {
      animation: none;
    }
  }
</style>
