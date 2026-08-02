<script lang="ts">
  import { CELL, cellFor } from '../geometry';
  import type { PlayerId } from '../game/types';

  interface Props {
    player: PlayerId;
    /** Board square this piece stands on. */
    trackIndex: number;
    grabbable?: boolean;
    selected?: boolean;
    /**
     * Offset from the resting square while held, in viewBox units, or null
     * when the piece is at rest. Hit resolution and dragging live in the
     * board's tap layer, so this component is purely presentational.
     */
    offset?: { x: number; y: number } | null;
  }

  const {
    player,
    trackIndex,
    grabbable = false,
    selected = false,
    offset = null
  }: Props = $props();

  const home = $derived(cellFor(trackIndex));
  const held = $derived(offset !== null);
  const radius = CELL * 0.34;

  /**
   * Player one is a disc, player two a tile. Shape carries identity first so it
   * survives greyscale and colour blindness; the dye reinforces it.
   */
  const isDisc = $derived(player === 0);
  const label = $derived(`${isDisc ? 'Red disc' : 'Blue tile'} on square ${trackIndex + 1}`);

  /*
   * Positioned with a CSS transform rather than the SVG `transform` attribute.
   * A presentation attribute carries no specificity, so any CSS transform (a
   * transition, an animation) silently overrides it and sends the element to
   * the origin of the viewBox. Driving it from CSS throughout means the
   * transition below animates the value actually in use, and a released piece
   * settles back to its square instead of leaping to the board's corner.
   */
  const tx = $derived(home.cx + (offset?.x ?? 0));
  const ty = $derived(home.cy + (offset?.y ?? 0));
</script>

<g
  class={[
    'piece',
    isDisc ? 'disc' : 'tile',
    grabbable && 'grabbable',
    selected && 'selected',
    held && 'held'
  ]}
  style:transform="translate({tx}px, {ty}px)"
  role="img"
  aria-label={label}
>
  {#if isDisc}
    <circle r={radius} class="body" />
  {:else}
    <rect x={-radius} y={-radius} width={radius * 2} height={radius * 2} rx="0.6" class="body" />
  {/if}
</g>

<style>
  /*
   * The same transition carries a piece to a new square and springs a refused
   * one back to where it started, which is what makes an illegal drop read as
   * a refusal rather than a glitch.
   */
  .piece {
    transition: transform var(--duration-base) var(--ease-out);
  }

  .held {
    /* Follow the hand exactly; a lagging piece feels broken, not weighty. */
    transition: none;
  }

  .body {
    stroke: var(--ulli);
    stroke-width: 0.35;
    paint-order: fill stroke;
  }

  .disc .body {
    fill: var(--cochineal);
  }

  .tile .body {
    fill: var(--indigo);
  }

  /*
   * A grabbable piece is at rest on the mat, so it takes no shadow: the
   * Lift-Only Rule allows one only for a piece in the grip. The maize ring is
   * paired with the rubber outline beneath it, per the Rubber Ring Rule, so
   * the state is never carried by the dye alone.
   */
  .grabbable .body {
    stroke-width: 0.9;
    stroke: var(--maize);
  }

  .selected .body {
    stroke-width: 1.2;
  }

  /* The one permitted shadow: something genuinely off the mat. */
  .held .body {
    filter: drop-shadow(0 1.4px 3.2px oklch(0.24 0.018 130 / 0.22));
  }

  @media (prefers-reduced-motion: reduce) {
    .piece {
      transition: none;
    }
  }
</style>
