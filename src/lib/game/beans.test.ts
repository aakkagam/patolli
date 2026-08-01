import { describe, expect, it } from 'vitest';
import { allThrows, endsTurnImmediately, scoreThrow, type BeanThrow } from './beans';

const faces = (...marked: boolean[]): BeanThrow => marked as unknown as BeanThrow;

describe('bean scoring', () => {
  it('scores one point per marked face', () => {
    expect(scoreThrow(faces(true, false, false, false, false))).toBe(1);
    expect(scoreThrow(faces(true, true, false, false, false))).toBe(2);
    expect(scoreThrow(faces(true, true, true, false, false))).toBe(3);
    expect(scoreThrow(faces(true, true, true, true, false))).toBe(4);
  });

  it('scores 10 when all five marked faces show', () => {
    expect(scoreThrow(faces(true, true, true, true, true))).toBe(10);
  });

  it('scores nothing when no marked face shows', () => {
    expect(scoreThrow(faces(false, false, false, false, false))).toBe(0);
  });

  it('ends the turn immediately only on a zero score', () => {
    expect(endsTurnImmediately(0)).toBe(true);
    expect(endsTurnImmediately(1)).toBe(false);
    expect(endsTurnImmediately(10)).toBe(false);
  });

  it('does not care which beans are marked, only how many', () => {
    expect(scoreThrow(faces(true, false, true, false, false))).toBe(2);
    expect(scoreThrow(faces(false, false, false, true, true))).toBe(2);
  });
});

describe('throw distribution', () => {
  it('enumerates all 32 equally likely combinations', () => {
    const throwSet = new Set(allThrows().map((beans) => beans.join(',')));
    expect(throwSet.size).toBe(32);
  });

  /**
   * The source PDF states this distribution explicitly, so it is worth holding
   * the implementation to it rather than trusting the arithmetic.
   */
  it('matches the distribution stated in the source', () => {
    const counts = new Map<number, number>();
    for (const beans of allThrows()) {
      const score = scoreThrow(beans);
      counts.set(score, (counts.get(score) ?? 0) + 1);
    }

    expect(counts.get(2)).toBe(10); // 5 in 16
    expect(counts.get(3)).toBe(10); // 5 in 16
    expect(counts.get(1)).toBe(5); // half as often
    expect(counts.get(4)).toBe(5); // half as often
    expect(counts.get(10)).toBe(1); // 1 in 32
    expect(counts.get(0)).toBe(1); // 1 in 32

    const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
    expect(total).toBe(32);
  });

  it('never scores 5 through 9', () => {
    const scores = new Set(allThrows().map(scoreThrow));
    for (const impossible of [5, 6, 7, 8, 9]) {
      expect(scores.has(impossible)).toBe(false);
    }
  });
});
