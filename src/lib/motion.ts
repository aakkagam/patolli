/**
 * Motion tuning.
 *
 * Deliberately small. Pieces move under a CSS transition on their transform,
 * which is also what springs a refused drop back to its square, so there is no
 * JS spring to configure. The one thing that needs numbers here is the bean
 * tumble. Anything exported from this file should have a caller: unused
 * tuning constants read as features that exist when they do not.
 *
 * Under `prefers-reduced-motion` the tumble collapses to a fade and the piece
 * transitions resolve instantly, handled in each component's own media query.
 */

/** Live reduced-motion preference, for the rare case JS must branch on it. */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Bean-throw theatre. The numeral is the fact and appears as the beans land,
 * so this is how long the tumble runs, not how long the result is withheld.
 */
export const TUMBLE_MS = 620;
export const TUMBLE_STAGGER_MS = 70;
