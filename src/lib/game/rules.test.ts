import { describe, expect, it } from 'vitest';
import { entryIndexForArm, kindOf, toTrackIndex, ROUNDED_SQUARES, WEDGE_SQUARES } from './board';
import {
  applyMove,
  applyThrow,
  createGame,
  legalMoves,
  occupiedSquares,
  resolveOpening,
  trackIndexFor
} from './rules';
import { makeState, throwOf } from './test-helpers';
import { LAST_OWN_INDEX, PIECES_PER_PLAYER, piecesBorneOff, piecesOnTrack } from './types';

/** Own index whose track square is a wedge, for the player on arm 0 heading +1. */
const wedgeOwnIndex = WEDGE_SQUARES[0]; // arm 0 outbound rank 3 -> track index 4
const roundedOwnIndex = ROUNDED_SQUARES[0]; // arm 0 outbound rank 1 -> track index 6

describe('opening throw', () => {
  it('gives the first turn to the higher throw', () => {
    expect(resolveOpening(4, 2)).toBe(0);
    expect(resolveOpening(1, 10)).toBe(1);
  });

  it('is undecided on a tie, so the ritual repeats', () => {
    expect(resolveOpening(3, 3)).toBeNull();
  });
});

describe('game setup', () => {
  it('starts with six pieces each, in hand, and an empty board', () => {
    const state = createGame({ startingPlayer: 0, stake: 5, penalty: 1, counters: 20 });
    for (const side of state.players) {
      expect(side.pieces).toHaveLength(PIECES_PER_PLAYER);
      expect(side.pieces.every((piece) => piece.at === 'hand')).toBe(true);
      expect(side.direction).toBeNull();
    }
    expect(occupiedSquares(state).size).toBe(0);
  });

  it('takes the stake from both players into the pot', () => {
    const state = createGame({ startingPlayer: 0, stake: 5, penalty: 1, counters: 20 });
    expect(state.players[0].counters).toBe(15);
    expect(state.players[1].counters).toBe(15);
    expect(state.pot).toBe(10);
  });

  it('refuses a stake the players cannot afford', () => {
    // Every in-game payment is capped so no balance goes negative; staking is
    // the one way that guarantee could be broken from outside.
    expect(() => createGame({ startingPlayer: 0, stake: 30, penalty: 1, counters: 20 })).toThrow();
    expect(() => createGame({ startingPlayer: 0, stake: -1, penalty: 1, counters: 20 })).toThrow();
    expect(() =>
      createGame({ startingPlayer: 0, stake: 20, penalty: 1, counters: 20 })
    ).not.toThrow();
  });

  it('seats the players on opposite arms', () => {
    const state = createGame({ startingPlayer: 0, stake: 5, penalty: 1, counters: 20 });
    const gap = Math.abs(
      entryIndexForArm(state.players[0].arm) - entryIndexForArm(state.players[1].arm)
    );
    expect(gap).toBe(30);
  });
});

describe('entry', () => {
  it('lands the first piece at the own index equal to the throw', () => {
    const state = { ...makeState(), pendingThrow: 3 };
    const next = applyMove(state, { kind: 'enter', direction: 1 });
    expect(next).not.toBeNull();
    const piece = next!.players[0].pieces.find((p) => p.at === 'track');
    expect(piece).toEqual({ at: 'track', ownIndex: 3 });
  });

  it('refuses entry from hand on a score other than 1 once a piece is on the board', () => {
    const state = makeState({
      pendingThrow: 3,
      players: [{ onTrack: [10], direction: 1 }, {}]
    });
    expect(legalMoves(state).some((move) => move.kind === 'enter')).toBe(false);
  });

  it('allows but does not compel entry on a throw of 1', () => {
    const state = makeState({
      pendingThrow: 1,
      players: [{ onTrack: [10], direction: 1 }, {}]
    });
    const moves = legalMoves(state);
    expect(moves.some((move) => move.kind === 'enter')).toBe(true);
    expect(moves.some((move) => move.kind === 'advance')).toBe(true);
  });

  it('offers both directions before the first entry and fixes the choice after', () => {
    const state = { ...makeState(), pendingThrow: 2 };
    const moves = legalMoves(state);
    expect(moves.filter((move) => move.kind === 'enter')).toHaveLength(2);

    const next = applyMove(state, { kind: 'enter', direction: -1 })!;
    expect(next.players[0].direction).toBe(-1);

    const later = { ...next, turn: 0 as const, pendingThrow: 1 };
    expect(
      legalMoves(later)
        .filter((move) => move.kind === 'enter')
        .every((move) => move.kind === 'enter' && move.direction === -1)
    ).toBe(true);
  });

  it('reopens entry on any score once the board is empty again', () => {
    // Rule 8 is present tense: "once a player has one piece on the board".
    // With the last piece borne off and pieces still in hand, the condition no
    // longer holds, so entry is not stranded behind a 1-in-32 throw.
    const state = makeState({
      pendingThrow: 3,
      players: [{ onTrack: [], inHand: 3, borneOff: 3, direction: 1 }, {}]
    });
    expect(legalMoves(state).some((move) => move.kind === 'enter')).toBe(true);
  });

  it('lets the two players travel in opposite directions', () => {
    const state = makeState({
      players: [
        { onTrack: [5], direction: 1 },
        { onTrack: [5], direction: -1 }
      ]
    });
    expect(state.players[0].direction).toBe(1);
    expect(state.players[1].direction).toBe(-1);
    expect(occupiedSquares(state).size).toBe(2);
  });
});

describe('movement and blocking', () => {
  it('advances a piece by the throw in the owner direction', () => {
    const state = makeState({
      pendingThrow: 3,
      players: [{ onTrack: [10], direction: 1 }, {}]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.players[0].pieces[0]).toEqual({ at: 'track', ownIndex: 13 });
  });

  it('refuses a destination held by the mover own piece', () => {
    const state = makeState({
      pendingThrow: 2,
      players: [{ onTrack: [10, 12], direction: 1 }, {}]
    });
    expect(applyMove(state, { kind: 'advance', pieceIndex: 0 })).toBeNull();
  });

  it('refuses a destination held by the opponent, and takes nothing', () => {
    // Player 0 on arm 0 heading +1: own index 12 is track index 12.
    // Player 1 on arm 2 heading -1 sits on track index 12 from own index 18.
    const state = makeState({
      pendingThrow: 2,
      players: [
        { onTrack: [10], direction: 1 },
        { onTrack: [18], direction: -1 }
      ]
    });
    expect(trackIndexFor(state, 0, 12)).toBe(trackIndexFor(state, 1, 18));
    expect(applyMove(state, { kind: 'advance', pieceIndex: 0 })).toBeNull();
    // Nothing was captured or displaced.
    expect(piecesOnTrack(state.players[1])).toBe(1);
  });

  it('allows passing over occupied squares when the destination is free', () => {
    const state = makeState({
      pendingThrow: 3,
      players: [{ onTrack: [10, 11, 12], direction: 1 }, {}]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.players[0].pieces[0]).toEqual({ at: 'track', ownIndex: 13 });
  });

  it('never removes a piece from the board', () => {
    const state = makeState({
      pendingThrow: 1,
      players: [
        { onTrack: [10], direction: 1 },
        { onTrack: [20], direction: 1 }
      ]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(piecesOnTrack(next.players[0])).toBe(1);
    expect(piecesOnTrack(next.players[1])).toBe(1);
  });
});

describe('forced moves and the no-move penalty', () => {
  it('reports no legal move when the only piece is blocked and nothing can enter', () => {
    // A lone piece one square short of the exit, with nothing left in hand.
    // A throw of 1 would bear it off, so the opponent is placed on that exact
    // square: reaching the last square is still a landing, and landings onto
    // occupied squares are illegal.
    const probe = makeState({
      pendingThrow: 1,
      players: [{ onTrack: [LAST_OWN_INDEX - 1], inHand: 0, borneOff: 5, direction: 1 }, {}]
    });
    const exitSquare = trackIndexFor(probe, 0, LAST_OWN_INDEX);
    const blocker = (((entryIndexForArm(probe.players[1].arm) - exitSquare) % 60) + 60) % 60;
    const blocked = makeState({
      pendingThrow: 1,
      players: [
        { onTrack: [LAST_OWN_INDEX - 1], inHand: 0, borneOff: 5, direction: 1 },
        { onTrack: [blocker], direction: -1 }
      ]
    });
    expect(trackIndexFor(blocked, 1, blocker)).toBe(exitSquare);
    expect(legalMoves(blocked)).toHaveLength(0);
  });

  it('pays a penalty into the pot and ends the turn when nothing can move', () => {
    // Own index 56 with a throw of 4 would reach 60, past the last square, so
    // the move is illegal; nothing in hand, so nothing can enter either. This
    // is a state the engine can actually reach, unlike parking a piece on the
    // last square, which always bears off instead of resting there.
    const stuck = makeState({
      pendingThrow: null,
      players: [{ onTrack: [56], inHand: 0, borneOff: 5, direction: 1 }, {}],
      penalty: 2,
      pot: 10
    });
    const before = stuck.players[0].counters;
    const next = applyThrow(stuck, throwOf(4));
    expect(next.pendingThrow).toBeNull();
    expect(next.turn).toBe(1);
    expect(next.pot).toBe(12);
    expect(next.players[0].counters).toBe(before - 2);
    expect(next.lastOutcome?.kind).toBe('noLegalMove');
  });

  it('ends the turn immediately on a no-score throw without a penalty', () => {
    const state = makeState({ players: [{ onTrack: [10], direction: 1 }, {}], pot: 10 });
    const next = applyThrow(state, throwOf(0));
    expect(next.turn).toBe(1);
    expect(next.pot).toBe(10);
    expect(next.lastOutcome?.kind).toBe('noScore');
  });
});

describe('wedge squares', () => {
  it('costs double the agreed penalty, paid to the opponent', () => {
    const state = makeState({
      pendingThrow: 1,
      penalty: 3,
      players: [{ onTrack: [wedgeOwnIndex - 1], direction: 1 }, {}]
    });
    const before = [state.players[0].counters, state.players[1].counters];
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.lastOutcome?.landedOn).toBe('wedge');
    expect(next.players[0].counters).toBe(before[0] - 6);
    expect(next.players[1].counters).toBe(before[1] + 6);
  });

  it('costs nothing when merely passed over', () => {
    const state = makeState({
      pendingThrow: 2,
      penalty: 3,
      players: [{ onTrack: [wedgeOwnIndex - 1], direction: 1 }, {}]
    });
    const before = state.players[0].counters;
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.lastOutcome?.landedOn).not.toBe('wedge');
    expect(next.players[0].counters).toBe(before);
  });
});

describe('rounded squares', () => {
  it('grants another turn on landing', () => {
    const state = makeState({
      pendingThrow: 1,
      players: [{ onTrack: [roundedOwnIndex - 1], direction: 1 }, {}]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.lastOutcome?.landedOn).toBe('rounded');
    expect(next.lastOutcome?.extraTurn).toBe(true);
    expect(next.turn).toBe(0);
  });

  it('passes the turn when the landing square is ordinary', () => {
    const state = makeState({
      pendingThrow: 1,
      players: [{ onTrack: [10], direction: 1 }, {}]
    });
    // Assert the premise rather than assuming it: own index 11 must really be
    // a plain square, or this test would pass for the wrong reason.
    expect(kindOf(trackIndexFor(state, 0, 11))).toBe('plain');
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.turn).toBe(1);
  });

  it('grants nothing when merely passed over', () => {
    const state = makeState({
      pendingThrow: 3,
      players: [{ onTrack: [roundedOwnIndex - 1], direction: 1 }, {}]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.lastOutcome?.extraTurn).toBe(false);
    expect(next.turn).toBe(1);
  });
});

describe('bearing off', () => {
  it('bears a piece off on an exact throw onto the last square', () => {
    const state = makeState({
      pendingThrow: 4,
      penalty: 2,
      players: [{ onTrack: [LAST_OWN_INDEX - 4], direction: 1 }, {}]
    });
    const before = [state.players[0].counters, state.players[1].counters];
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(piecesBorneOff(next.players[0])).toBe(1);
    expect(next.lastOutcome?.kind).toBe('borneOff');
    expect(next.players[0].counters).toBe(before[0] + 2);
    expect(next.players[1].counters).toBe(before[1] - 2);
  });

  it('refuses a move that would overshoot the last square', () => {
    const state = makeState({
      pendingThrow: 4,
      players: [{ onTrack: [LAST_OWN_INDEX - 2], direction: 1 }, {}]
    });
    expect(applyMove(state, { kind: 'advance', pieceIndex: 0 })).toBeNull();
    expect(legalMoves(state)).toHaveLength(0);
  });

  it('stops a borne-off piece blocking anything', () => {
    const state = makeState({
      pendingThrow: 1,
      players: [{ onTrack: [LAST_OWN_INDEX - 1], direction: 1 }, {}]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(occupiedSquares(next).size).toBe(0);
  });
});

describe('the pot', () => {
  it('caps a penalty at what the payer actually holds', () => {
    const state = makeState({
      pendingThrow: 1,
      penalty: 2,
      players: [
        { onTrack: [wedgeOwnIndex - 1], direction: 1, counters: 1 },
        { counters: 0, direction: null }
      ]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    // Owed 4, held 1: pays 1, the rest is forgiven, and nothing goes negative.
    expect(next.players[0].counters).toBe(0);
    expect(next.players[1].counters).toBe(1);
    expect(next.lastOutcome?.paidToOpponent).toBe(1);
  });

  it('takes nothing from a player who holds nothing', () => {
    const state = makeState({
      pendingThrow: 1,
      penalty: 2,
      players: [
        { onTrack: [wedgeOwnIndex - 1], direction: 1, counters: 0 },
        { counters: 5, direction: null }
      ]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.players[0].counters).toBe(0);
    expect(next.players[1].counters).toBe(5);
    expect(next.lastOutcome?.paidToOpponent).toBe(0);
  });

  it('never lets a balance fall below zero on a pot penalty', () => {
    const stuck = makeState({
      players: [{ onTrack: [56], inHand: 0, borneOff: 5, direction: 1, counters: 1 }, {}],
      penalty: 5,
      pot: 0
    });
    const next = applyThrow(stuck, throwOf(4));
    expect(next.players[0].counters).toBe(0);
    expect(next.pot).toBe(1);
  });
});

describe('winning', () => {
  it('wins on bearing off the sixth piece and takes the pot', () => {
    const state = makeState({
      pendingThrow: 1,
      penalty: 1,
      pot: 10,
      players: [{ onTrack: [LAST_OWN_INDEX - 1], inHand: 0, borneOff: 5, direction: 1 }, {}]
    });
    const before = state.players[0].counters;
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.winner).toBe(0);
    expect(piecesBorneOff(next.players[0])).toBe(PIECES_PER_PLAYER);
    expect(next.pot).toBe(0);
    // Collected the bear-off penalty of 1, then the pot of 10.
    expect(next.players[0].counters).toBe(before + 1 + 10);
    // The pot is zeroed on transfer, so the amount won is recorded separately
    // or nothing downstream could report what was taken.
    expect(next.lastOutcome?.potCollected).toBe(10);
  });

  it('reports no pot collected on a move that does not win', () => {
    const state = makeState({
      pendingThrow: 1,
      pot: 10,
      players: [{ onTrack: [20], direction: 1 }, {}]
    });
    const next = applyMove(state, { kind: 'advance', pieceIndex: 0 })!;
    expect(next.lastOutcome?.potCollected).toBe(0);
    expect(next.pot).toBe(10);
  });

  it('accepts no further throw or move once won', () => {
    const won = makeState({
      players: [{ onTrack: [], inHand: 0, borneOff: 6, direction: 1 }, {}]
    });
    const decided = { ...won, winner: 0 as const };
    expect(legalMoves(decided)).toHaveLength(0);
    expect(applyMove(decided, { kind: 'advance', pieceIndex: 0 })).toBeNull();
    expect(applyThrow(decided, throwOf(3))).toBe(decided);
  });
});

describe('blocking the exit', () => {
  it('stops a bear-off when the last square is held by the opponent', () => {
    const probe = makeState({ players: [{ onTrack: [1], direction: 1 }, {}] });
    const lastSquare = trackIndexFor(probe, 0, LAST_OWN_INDEX);
    // Put an opponent piece on that exact board square.
    const entryB = entryIndexForArm(probe.players[1].arm);
    let blockerOwn = -1;
    for (let own = 1; own <= LAST_OWN_INDEX; own++) {
      if (toTrackIndex(entryB, -1, own) === lastSquare) {
        blockerOwn = own;
        break;
      }
    }
    expect(blockerOwn).toBeGreaterThan(0);

    const state = makeState({
      pendingThrow: 1,
      players: [
        { onTrack: [LAST_OWN_INDEX - 1], direction: 1 },
        { onTrack: [blockerOwn], direction: -1 }
      ]
    });
    expect(applyMove(state, { kind: 'advance', pieceIndex: 0 })).toBeNull();
  });
});
