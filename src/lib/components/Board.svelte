<script lang="ts">
  import { CELL, VIEW, allCells } from '../geometry';
  import { kindOf, TRACK_LENGTH } from '../game/board';
  import type { CellPosition } from '../geometry';

  import type { Snippet } from 'svelte';

  interface Props {
    /** Squares that are legal destinations right now. */
    live?: Set<number>;
    /** The square a bear-off would leave from, drawn as an exit. */
    exit?: number | null;
    onsquare?: (trackIndex: number) => void;
    /** Pieces, drawn in the board's own coordinate space. */
    children?: Snippet;
  }

  const { live = new Set<number>(), exit = null, onsquare, children }: Props = $props();

  const cells = allCells();

  /**
   * Sixteen cells across cannot each be 44px on a phone: that needs a 704px
   * viewport. So the *interactive* area of a live square grows beyond its drawn
   * cell, which is what keeps the thing a player actually has to hit within
   * reach. Only live squares are interactive, and they are few and rarely
   * adjacent, so the overlap this creates is not reachable in practice.
   */
  const TARGET_GROW = CELL * 0.45;

  /**
   * A deterministic wobble per square, so no two rubber strokes are identical
   * but the board does not shimmer between renders.
   */
  function jitter(index: number, seed: number): number {
    const n = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
    return (n - Math.floor(n) - 0.5) * 0.5;
  }

  function cellPath(cell: CellPosition, index: number): string {
    const j = (s: number) => jitter(index, s);
    const x0 = cell.x + j(1);
    const y0 = cell.y + j(2);
    const x1 = cell.x + CELL + j(3);
    const y1 = cell.y + CELL + j(4);
    return `M ${x0} ${y0} L ${x1} ${y0 + j(5)} L ${x1 + j(6)} ${y1} L ${x0 + j(7)} ${y1 + j(8)} Z`;
  }

  /** Rounded end squares curve their own outline: the mark is the cell. */
  function isRoundedCell(index: number): boolean {
    return kindOf(index) === 'rounded';
  }

  /**
   * The wedge bites into the penalised square alone. The printed board draws it
   * across the seam between two squares, which is exactly what makes players
   * expect both to charge. The art tells the truth about the rule instead.
   */
  function wedgePath(cell: CellPosition): string {
    const inset = CELL * 0.18;
    const depth = CELL * 0.42;
    return `M ${cell.x + inset} ${cell.y} L ${cell.x + CELL - inset} ${cell.y} L ${cell.cx} ${cell.y + depth} Z`;
  }
</script>

<svg
  class="board"
  viewBox="0 0 {VIEW.width} {VIEW.height}"
  role="grid"
  aria-label="Patolli board, sixty squares"
>
  <!-- The field is a deeper region of the same fiber, not an object on it. -->
  <g class="field">
    {#each cells as cell, index (index)}
      <path d={cellPath(cell, index)} class="cell-field" />
    {/each}
  </g>

  <g class="marks">
    {#each cells as cell, index (index)}
      {#if kindOf(index) === 'wedge'}
        <path d={wedgePath(cell)} class="wedge" />
      {:else if kindOf(index) === 'central'}
        <circle cx={cell.cx} cy={cell.cy} r={CELL * 0.16} class="pip" />
      {/if}
    {/each}
  </g>

  <!-- Live squares say it twice: a maize wash inside a rubber ring. -->
  <g class="live">
    {#each cells as cell, index (index)}
      {#if live.has(index)}
        <path d={cellPath(cell, index)} class={['cell-live', index === exit && 'exit']} />
      {/if}
    {/each}
  </g>

  <g class="lines">
    {#each cells as cell, index (index)}
      <path
        d={cellPath(cell, index)}
        class={['cell-line', isRoundedCell(index) && 'rounded', live.has(index) && 'live']}
      />
    {/each}
  </g>

  <!-- Entry squares are drawn last so the pinwheel reads over the grid. -->
  <g class="entries">
    {#each cells as cell, index (index)}
      {#if index % 15 === 0}
        <path
          d="M {cell.x + CELL * 0.2} {cell.cy} L {cell.cx} {cell.y + CELL * 0.2} L {cell.x +
            CELL * 0.8} {cell.cy} L {cell.cx} {cell.y + CELL * 0.8} Z"
          class="entry"
        />
      {/if}
    {/each}
  </g>

  {#if children}
    <g class="pieces">{@render children()}</g>
  {/if}

  {#if onsquare}
    <g class="hit">
      {#each cells as cell, index (index)}
        <rect
          x={cell.x - (live.has(index) ? TARGET_GROW : 0)}
          y={cell.y - (live.has(index) ? TARGET_GROW : 0)}
          width={CELL + (live.has(index) ? TARGET_GROW * 2 : 0)}
          height={CELL + (live.has(index) ? TARGET_GROW * 2 : 0)}
          class={['hit-area', live.has(index) && 'targetable']}
          data-square={index}
          role="gridcell"
          tabindex={live.has(index) ? 0 : -1}
          aria-label="Square {index + 1} of {TRACK_LENGTH}"
          onclick={() => onsquare?.(index)}
          onkeydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onsquare?.(index);
            }
          }}
        />
      {/each}
    </g>
  {/if}
</svg>

<style>
  /*
   * The board is square, so it must be capped by whichever axis is smaller or
   * the arms run off the side of a wide, short viewport. `min()` of the two
   * keeps the whole cross on screen without ever scrolling sideways.
   */
  .board {
    display: block;
    width: 100%;
    max-width: min(100%, 74dvh);
    height: auto;
    margin: 0 auto;
    overflow: visible;
  }

  .cell-field {
    fill: var(--mat-woven);
  }

  .cell-line {
    fill: none;
    stroke: var(--ulli);
    stroke-width: 0.35;
    stroke-linejoin: round;
  }

  /* The rounded end squares curve their own outline rather than wearing a badge. */
  .cell-line.rounded {
    stroke-width: 0.55;
    stroke-linecap: round;
  }

  .wedge {
    fill: var(--ulli);
    opacity: 0.82;
  }

  .pip {
    fill: var(--ulli);
    opacity: 0.5;
  }

  .entry {
    fill: none;
    stroke: var(--ulli);
    stroke-width: 0.3;
    opacity: 0.75;
  }

  .cell-live {
    fill: var(--maize);
  }

  .cell-live.exit {
    opacity: 0.75;
  }

  /* The ring carries the contrast; the dye carries the meaning. */
  .cell-line.live {
    stroke-width: 0.7;
  }

  /*
   * The hit layer sits above the pieces so a drag release can be resolved by
   * hit-testing, but it must not swallow pointer events aimed at a piece, so
   * only live squares are interactive.
   */
  .hit-area {
    fill: transparent;
    cursor: default;
    pointer-events: none;
  }

  .hit-area.targetable {
    cursor: pointer;
    pointer-events: auto;
  }

  .hit-area:focus-visible {
    outline: none;
    stroke: var(--ulli);
    stroke-width: 0.6;
  }
</style>
