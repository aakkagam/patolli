/**
 * The five beans that drive movement.
 *
 * Each bean is marked on one face and blank on the other. Scoring is a pure
 * function of the faces it is handed: nothing here generates randomness, so
 * every rule downstream is deterministically testable. The store draws the
 * faces and passes them in.
 */

export const BEAN_COUNT = 5;

/** True when a bean landed marked face up. */
export type BeanFace = boolean;

export type BeanThrow = readonly [BeanFace, BeanFace, BeanFace, BeanFace, BeanFace];

/** A throw with no marked face scores nothing and ends the turn at once. */
export const NO_SCORE = 0;

/** All five marked faces score 10 rather than 5. */
export const ALL_MARKED_SCORE = 10;

/**
 * One point per marked face, except that five marked faces score 10 and no
 * marked face scores nothing.
 */
export function scoreThrow(beans: BeanThrow): number {
  const marked = beans.reduce<number>((count, face) => count + (face ? 1 : 0), 0);
  if (marked === BEAN_COUNT) return ALL_MARKED_SCORE;
  return marked;
}

/** A zero score ends the turn immediately, with no move and no choice. */
export function endsTurnImmediately(score: number): boolean {
  return score === NO_SCORE;
}

/**
 * Every distinct combination of bean faces, in a fixed order. There are
 * 2^5 = 32 of them, all equally likely, which is what makes the score
 * distribution assertable rather than merely asserted.
 */
export function allThrows(): BeanThrow[] {
  const throws: BeanThrow[] = [];
  for (let bits = 0; bits < 1 << BEAN_COUNT; bits++) {
    throws.push([
      (bits & 1) !== 0,
      (bits & 2) !== 0,
      (bits & 4) !== 0,
      (bits & 8) !== 0,
      (bits & 16) !== 0
    ]);
  }
  return throws;
}
