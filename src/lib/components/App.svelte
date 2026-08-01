<script lang="ts">
  import '../../styles/base.css';
  import Board from './Board.svelte';
  import Hud from './Hud.svelte';
  import Piece from './Piece.svelte';
  import Setup from './Setup.svelte';
  import WinBanner from './WinBanner.svelte';
  import { game } from '../store.svelte';
  import type { PlayerId } from '../game/types';

  const state = $derived(game.state);

  /** Every piece standing on the board, with the square it occupies. */
  const placed = $derived.by(() => {
    const list: { player: PlayerId; pieceIndex: number; trackIndex: number }[] = [];
    state.players.forEach((side, index) => {
      const player = index as PlayerId;
      side.pieces.forEach((piece, pieceIndex) => {
        if (piece.at !== 'track') return;
        const trackIndex = game.squareFor(player, piece.ownIndex);
        if (trackIndex !== null) list.push({ player, pieceIndex, trackIndex });
      });
    });
    return list;
  });

  /**
   * Squares that light up. When nothing is picked up we show the whole field of
   * play, so a player can see their options before committing; once a piece is
   * in hand we narrow to where that piece can go.
   */
  const live = $derived(
    new Set(
      (game.selection === null ? game.allTargets : game.targets).map((target) => target.trackIndex)
    )
  );

  const exit = $derived(game.targets.find((target) => target.bearsOff)?.trackIndex ?? null);

  /** Resolve a drag release to a board square by hit-testing the hit layer. */
  function squareAt(clientX: number, clientY: number): number | null {
    const element = document.elementFromPoint(clientX, clientY);
    const attribute = element?.getAttribute('data-square');
    return attribute === null || attribute === undefined ? null : Number(attribute);
  }

  function onsquare(trackIndex: number) {
    game.playTo(trackIndex);
  }
</script>

<main>
  {#if game.phase !== 'playing'}
    <Setup />
  {:else}
    {#if state.winner !== null}
      <WinBanner winner={state.winner} pot={state.lastOutcome?.potCollected ?? 0} />
    {/if}

    <div class="stage">
      <div class="board-slot">
        <Board {live} {exit} {onsquare}>
          {#each placed as item (`${item.player}-${item.pieceIndex}`)}
            <Piece
              player={item.player}
              trackIndex={item.trackIndex}
              grabbable={item.player === state.turn && game.grabbable.has(item.pieceIndex)}
              selected={game.selection?.kind === 'piece' &&
                game.selection.pieceIndex === item.pieceIndex &&
                item.player === state.turn}
              onpick={() => game.select({ kind: 'piece', pieceIndex: item.pieceIndex })}
              ondrop={(square) => (square === null ? false : game.playTo(square))}
              {squareAt}
            />
          {/each}
        </Board>
      </div>

      <Hud />
    </div>

    {#if game.canEnter}
      <div class="hand">
        <button
          class="enter"
          onclick={() => game.select({ kind: 'hand' })}
          aria-pressed={game.selection?.kind === 'hand'}
        >
          Enter a piece ({game.piecesInHand} in hand)
        </button>
        {#if game.choosingDirection}
          <p class="hint">Two squares are open. The one you take sets your way round.</p>
        {/if}
      </div>
    {/if}
  {/if}
</main>

<style>
  /* The mat is the page: one ground, no cards, no panels, nothing framed. */
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-sm) var(--space-lg);
  }

  .stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    max-width: 34rem;
    min-width: 0;
  }

  /*
   * A bare layout slot, not a frame: no border, background, radius or shadow.
   * `min-width: 0` is the flexbox escape hatch that stops the square board
   * forcing the row wider than the viewport.
   */
  .board-slot {
    min-width: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .hand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .enter {
    min-height: var(--target-min);
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--ulli);
    border-radius: var(--radius-sm);
    background: var(--mat);
    color: var(--ulli);
    font-family: var(--font-body);
    font-size: var(--size-label);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    cursor: pointer;
  }

  .enter[aria-pressed='true'] {
    background: var(--mat-shadow);
  }

  .hint {
    margin: 0;
    max-width: 32ch;
    text-align: center;
    font-size: var(--size-label);
    color: var(--ulli-muted);
  }

  /* On a wide viewport the board and its chrome sit side by side on the mat. */
  @media (min-width: 56rem) {
    .stage {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      max-width: 60rem;
      gap: var(--space-lg);
    }
  }
</style>
