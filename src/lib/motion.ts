/**
 * Motion tuning.
 *
 * Springs everywhere something is handled, and nothing anywhere something is
 * recorded: the pot is a ledger, so its numbers change by direct replacement
 * and never count up. Under `prefers-reduced-motion` the springs snap and the
 * bean tumble collapses to a fade.
 */

/** Live reduced-motion preference; springs snap and CSS falls back to fades. */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Spring tuning: drag-follow is taut, settling is soft and weighty. */
export const SPRING_FOLLOW = { stiffness: 0.3, damping: 0.75 };
export const SPRING_SETTLE = { stiffness: 0.14, damping: 0.52 };
/** Underdamped, so an illegal drop springs back with a visible refusal. */
export const SPRING_BOUNCE = { stiffness: 0.38, damping: 0.26 };

/**
 * Bean-throw theatre. The numeral is the fact and appears as the beans land,
 * so this is how long the tumble runs, not how long the result is withheld.
 */
export const TUMBLE_MS = 620;
export const TUMBLE_STAGGER_MS = 70;

/** Spring config for a piece, snapping instantly when motion is reduced. */
export function settleSpring(): { stiffness: number; damping: number } {
  return prefersReducedMotion() ? { stiffness: 1, damping: 1 } : SPRING_SETTLE;
}

export function followSpring(): { stiffness: number; damping: number } {
  return prefersReducedMotion() ? { stiffness: 1, damping: 1 } : SPRING_FOLLOW;
}
