<script lang="ts">
  import { CELL, VIEW, allCells, cellFor } from '../geometry';
  import { kindOf, TRACK_LENGTH } from '../game/board';
  import type { CellPosition } from '../geometry';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Squares that are legal destinations right now. */
    live?: Set<number>;
    /** Squares holding a piece the player to act may pick up. */
    pickable?: Set<number>;
    /** The square a bear-off would leave from, drawn as an exit. */
    exit?: number | null;
    onpick?: (trackIndex: number) => void;
    onplace?: (trackIndex: number) => void;
    /** Drag offset in viewBox units, or null when the piece is released. */
    ondrag?: (offset: { x: number; y: number } | null) => void;
    /** Pieces, drawn in the board's own coordinate space. */
    children?: Snippet;
  }

  const {
    live = new Set<number>(),
    pickable = new Set<number>(),
    exit = null,
    onpick,
    onplace,
    ondrag,
    children
  }: Props = $props();

  const cells = allCells();

  /** WCAG target-size floor, in real CSS pixels. */
  const MIN_TARGET_PX = 44;

  let svgEl: SVGSVGElement | undefined = $state.raw();
  let renderedWidth = $state.raw(0);

  const pxPerUnit = $derived(renderedWidth > 0 ? renderedWidth / VIEW.width : 0);

  /**
   * Sixteen cells across cannot each be 44px: that needs a ~704px viewport, and
   * a phone gives about 330px, so a drawn cell is roughly 20px. The drawn cell
   * therefore cannot be the target. Instead the *interactive* radius is sized
   * in real pixels and only the things a player must actually hit — the few
   * live squares and grabbable pieces — are hit-tested, by nearest centre.
   * Nearest-centre is what makes the enlarged radii safe: they overlap freely,
   * and the closest one still wins rather than whichever happens to be on top.
   */
  const targetRadius = $derived(
    pxPerUnit > 0 ? Math.max(CELL * 0.5, MIN_TARGET_PX / 2 / pxPerUnit) : CELL * 0.5
  );

  let dragging = $state.raw<{ from: { x: number; y: number } } | null>(null);

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

  /**
   * The eight end squares are drawn with genuinely curved corners, because the
   * rule they carry (land here and throw again) is structural. `stroke-linecap`
   * does nothing on a closed path — only `stroke-linejoin` applies there — so
   * the curve has to be in the path itself.
   */
  function roundedCellPath(cell: CellPosition, index: number): string {
    const r = CELL * 0.3;
    const j = (s: number) => jitter(index, s) * 0.6;
    const x0 = cell.x + j(1);
    const y0 = cell.y + j(2);
    const x1 = cell.x + CELL + j(3);
    const y1 = cell.y + CELL + j(4);
    return [
      `M ${x0 + r} ${y0}`,
      `L ${x1 - r} ${y0}`,
      `Q ${x1} ${y0} ${x1} ${y0 + r}`,
      `L ${x1} ${y1 - r}`,
      `Q ${x1} ${y1} ${x1 - r} ${y1}`,
      `L ${x0 + r} ${y1}`,
      `Q ${x0} ${y1} ${x0} ${y1 - r}`,
      `L ${x0} ${y0 + r}`,
      `Q ${x0} ${y0} ${x0 + r} ${y0}`,
      'Z'
    ].join(' ');
  }

  function outline(cell: CellPosition, index: number): string {
    return kindOf(index) === 'rounded' ? roundedCellPath(cell, index) : cellPath(cell, index);
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

  function toUnits(clientX: number, clientY: number): { x: number; y: number } | null {
    if (!svgEl) return null;
    const box = svgEl.getBoundingClientRect();
    if (box.width === 0) return null;
    return {
      x: ((clientX - box.left) / box.width) * VIEW.width,
      y: ((clientY - box.top) / box.height) * VIEW.height
    };
  }

  /** The closest candidate square to a point, within the target radius. */
  function nearest(candidates: Set<number>, point: { x: number; y: number }): number | null {
    let best: number | null = null;
    let bestDistance = Infinity;
    for (const index of candidates) {
      const cell = cellFor(index);
      const distance = Math.hypot(cell.cx - point.x, cell.cy - point.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }
    return best !== null && bestDistance <= targetRadius ? best : null;
  }

  function onpointerdown(event: PointerEvent) {
    const point = toUnits(event.clientX, event.clientY);
    if (!point) return;

    const picked = nearest(pickable, point);
    if (picked !== null) {
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
      dragging = { from: point };
      onpick?.(picked);
      return;
    }
    // Nothing to pick up here, so this is the second tap of a tap-tap move.
    const placed = nearest(live, point);
    if (placed !== null) onplace?.(placed);
  }

  function onpointermove(event: PointerEvent) {
    if (!dragging) return;
    const point = toUnits(event.clientX, event.clientY);
    if (!point) return;
    ondrag?.({ x: point.x - dragging.from.x, y: point.y - dragging.from.y });
  }

  function onpointerup(event: PointerEvent) {
    if (!dragging) return;
    const point = toUnits(event.clientX, event.clientY);
    const moved = point
      ? Math.hypot(point.x - dragging.from.x, point.y - dragging.from.y) > CELL * 0.25
      : false;
    dragging = null;
    // Releasing clears the offset, so a refused drop springs back to its square
    // under the piece's own transition rather than needing a separate bounce.
    ondrag?.(null);
    if (!moved || !point) return; // a tap: the piece stays selected
    const placed = nearest(live, point);
    if (placed !== null) onplace?.(placed);
  }
</script>

<svg
  bind:this={svgEl}
  bind:clientWidth={renderedWidth}
  class="board"
  viewBox="0 0 {VIEW.width} {VIEW.height}"
  role="grid"
  aria-label="Patolli board, sixty squares"
>
  <!-- The field is a deeper region of the same fiber, not an object on it. -->
  <g class="field">
    {#each cells as cell, index (index)}
      <path d={outline(cell, index)} class="cell-field" />
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
        <path d={outline(cell, index)} class={['cell-live', index === exit && 'exit']} />
      {/if}
    {/each}
  </g>

  <g class="lines">
    {#each cells as cell, index (index)}
      <path
        d={outline(cell, index)}
        class={['cell-line', kindOf(index) === 'rounded' && 'rounded', live.has(index) && 'live']}
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

  <!--
    Keyboard reaches the board one square at a time, so these stay per cell and
    only the interactive ones are focusable. They take no pointer events: touch
    and mouse go through the tap layer below, which resolves by nearest centre.
  -->
  <g class="cells-a11y">
    {#each cells as cell, index (index)}
      {#if live.has(index) || pickable.has(index)}
        <rect
          x={cell.x}
          y={cell.y}
          width={CELL}
          height={CELL}
          class="cell-key"
          role="gridcell"
          tabindex={0}
          aria-label={pickable.has(index)
            ? `Pick up the piece on square ${index + 1} of ${TRACK_LENGTH}`
            : `Move to square ${index + 1} of ${TRACK_LENGTH}`}
          onkeydown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            if (pickable.has(index)) onpick?.(index);
            else onplace?.(index);
          }}
        />
      {/if}
    {/each}
  </g>

  <!--
    Pointer input only. Everything this layer does is reachable from the
    keyboard through the focusable cells above, so it is hidden from assistive
    technology rather than duplicating those controls.
  -->
  <rect
    class="tap-layer"
    x="0"
    y="0"
    width={VIEW.width}
    height={VIEW.height}
    role="presentation"
    aria-hidden="true"
    {onpointerdown}
    {onpointermove}
    {onpointerup}
  />
</svg>

<style>
  /*
   * The board is square, so it must be capped by whichever axis is smaller or
   * the arms run off the side of a wide, short viewport.
   */
  .board {
    display: block;
    width: 100%;
    max-width: min(100%, 74dvh);
    height: auto;
    margin: 0 auto;
    overflow: visible;
    touch-action: none;
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

  /* The end squares curve their own outline; the curve is in the path. */
  .cell-line.rounded {
    stroke-width: 0.5;
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

  .cell-key {
    fill: transparent;
    pointer-events: none;
  }

  .cell-key:focus-visible {
    outline: none;
    stroke: var(--ulli);
    stroke-width: 0.8;
  }

  .tap-layer {
    fill: transparent;
    cursor: pointer;
  }
</style>
