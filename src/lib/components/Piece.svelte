<script lang="ts">
  import { CELL, cellFor } from '../geometry';
  import { prefersReducedMotion } from '../motion';
  import type { PlayerId } from '../game/types';

  interface Props {
    player: PlayerId;
    /** Board square this piece stands on. */
    trackIndex: number;
    grabbable?: boolean;
    selected?: boolean;
    onpick?: () => void;
    /** Called with the square the piece was released over, if any. */
    ondrop?: (trackIndex: number | null) => boolean | void;
    /** Maps a client point to a board square, for drag release. */
    squareAt?: (clientX: number, clientY: number) => number | null;
  }

  const {
    player,
    trackIndex,
    grabbable = false,
    selected = false,
    onpick,
    ondrop,
    squareAt
  }: Props = $props();

  const home = $derived(cellFor(trackIndex));

  // Offset from the resting position while held. Reassigned wholesale, so raw.
  let drag = $state.raw<{ dx: number; dy: number } | null>(null);
  let bouncing = $state.raw(false);

  const held = $derived(drag !== null);
  const radius = CELL * 0.34;

  /**
   * Player one is a disc, player two a tile. Shape carries identity first so it
   * survives greyscale and colour blindness; the dye reinforces it.
   */
  const isDisc = $derived(player === 0);
  const label = $derived(`${isDisc ? 'Red disc' : 'Blue tile'} on square ${trackIndex + 1}`);
  const classes = $derived([
    'piece',
    isDisc ? 'disc' : 'tile',
    grabbable && 'grabbable',
    selected && 'selected',
    held && 'held',
    bouncing && 'bouncing'
  ]);

  function onpointerdown(event: PointerEvent) {
    if (!grabbable) return;
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    drag = { dx: 0, dy: 0 };
    onpick?.();
  }

  function onpointermove(event: PointerEvent) {
    if (drag === null) return;
    drag = { dx: drag.dx + event.movementX, dy: drag.dy + event.movementY };
  }

  function onpointerup(event: PointerEvent) {
    if (drag === null) return;
    const moved = Math.hypot(drag.dx, drag.dy) > 4;
    drag = null;
    // A tap rather than a drag: selection was already handled on pick-up.
    if (!moved) return;
    const square = squareAt?.(event.clientX, event.clientY) ?? null;
    const accepted = ondrop?.(square);
    if (accepted === false || square === null) {
      // An illegal drop springs back, which is how the no-landing-on-occupied
      // rule teaches itself at the moment it bites.
      bounce();
    }
  }

  function bounce() {
    if (prefersReducedMotion()) return;
    bouncing = true;
    setTimeout(() => (bouncing = false), 320);
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onpick?.();
    }
  }
</script>

{#snippet body()}
  {#if isDisc}
    <circle r={radius} class="body" />
  {:else}
    <rect x={-radius} y={-radius} width={radius * 2} height={radius * 2} rx="0.6" class="body" />
  {/if}
{/snippet}

{#snippet reach()}
  <!--
    A drawn piece is far smaller than 44px on a phone, so a grabbable one
    carries an invisible target larger than itself. The piece is what you see;
    this is what you hit.
  -->
  <circle r={CELL * 0.62} class="reach" />
{/snippet}

{#if grabbable}
  <g
    class={classes}
    transform="translate({home.cx} {home.cy})"
    role="button"
    tabindex={0}
    aria-label={label}
    {onpointerdown}
    {onpointermove}
    {onpointerup}
    {onkeydown}
  >
    {@render reach()}
    {@render body()}
  </g>
{:else}
  <g class={classes} transform="translate({home.cx} {home.cy})" role="img" aria-label={label}>
    {@render body()}
  </g>
{/if}

<style>
  .piece {
    transition: transform var(--duration-base) var(--ease-out);
  }

  .body {
    stroke: var(--ulli);
    stroke-width: 0.35;
    paint-order: fill stroke;
  }

  .reach {
    fill: transparent;
    stroke: none;
  }

  .disc .body {
    fill: var(--cochineal);
  }

  .tile .body {
    fill: var(--indigo);
  }

  .grabbable {
    cursor: grab;
  }

  /* Grabbable pieces take a maize ring the moment a throw makes them movable. */
  .grabbable .body {
    stroke-width: 0.8;
    stroke: var(--maize);
    filter: drop-shadow(0 0 0.6px var(--ulli));
  }

  .selected .body {
    stroke-width: 1;
  }

  /* The one permitted shadow: something genuinely off the mat. */
  .held {
    cursor: grabbing;
    filter: drop-shadow(0 1.2px 2.4px oklch(0.24 0.018 130 / 0.32));
  }

  .bouncing {
    animation: refuse 320ms var(--ease-out);
  }

  @keyframes refuse {
    0%,
    100% {
      transform: translate(0, 0);
    }
  }

  .piece:focus-visible .body {
    stroke: var(--ulli);
    stroke-width: 1.2;
  }

  @media (prefers-reduced-motion: reduce) {
    .piece {
      transition: none;
    }
    .bouncing {
      animation: none;
    }
  }
</style>
