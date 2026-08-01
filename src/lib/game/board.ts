/**
 * The Patolli board, as a single cyclic track of 60 squares.
 *
 * The saltire is four arms of 2 files x 7 ranks (14 squares each) meeting at a
 * shared central 2x2 (4 squares): 4 * 14 + 4 = 60.
 *
 * The board shape forces the track rather than merely permitting it. Each arm
 * is a 2x7 dead end, so the only way to cover an arm and leave it is to run
 * outward along one file to the rounded tip, turn across to the other file,
 * come back inward, then cross exactly one central square into the next arm.
 * That is 7 + 7 + 1 = 15 squares per quadrant, 60 in all, every square and
 * every central square used exactly once.
 *
 * Quadrant q therefore occupies indices 15q .. 15q+14:
 *
 *   offset  0..6   outbound file, ranks 7 (innermost) down to 1 (tip)
 *   offset  7..13  inbound file,  ranks 1 (tip) up to 7 (innermost)
 *   offset  14     the central square crossed into the next arm
 *
 * The X shape, the U-turns and the pinwheel of entry squares are rendering
 * concerns. Nothing here knows about them.
 */

export const TRACK_LENGTH = 60;
export const ARM_COUNT = 4;
export const RANKS_PER_FILE = 7;
/** 14 arm squares plus the one central square that leaves the arm. */
export const QUADRANT_LENGTH = 15;

/** Offset within a quadrant at which the inbound file begins. */
const INBOUND_START = RANKS_PER_FILE;
/** Offset within a quadrant of the central square. */
const CENTRAL_OFFSET = QUADRANT_LENGTH - 1;

/** The outbound file runs away from the centre; the inbound file returns. */
export type FileId = 'outbound' | 'inbound';

export type SquareKind = 'plain' | 'rounded' | 'wedge' | 'central';

/**
 * Where a track index sits on the physical board. Rank 1 is the arm tip and
 * rank 7 the square nearest the centre. Rendering consumes this; rules do not.
 */
export type SquareLocation =
  | { readonly kind: 'arm'; readonly arm: number; readonly file: FileId; readonly rank: number }
  | { readonly kind: 'central'; readonly quadrant: number };

/** Travel direction around the cycle. Each player picks one and keeps it. */
export type Direction = 1 | -1;

/** True modulo: JavaScript's % keeps the sign of the dividend. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * The entry square of an arm: the innermost square of its outbound file, and
 * the first index of that arm's quadrant. Two players seated opposite each
 * other take arms 2 apart, so their entry squares are exactly 30 indices apart.
 */
export function entryIndexForArm(arm: number): number {
  return arm * QUADRANT_LENGTH;
}

/** Where a track index sits on the physical board. */
export function locationOf(index: number): SquareLocation {
  const i = mod(index, TRACK_LENGTH);
  const quadrant = Math.floor(i / QUADRANT_LENGTH);
  const offset = i % QUADRANT_LENGTH;

  if (offset === CENTRAL_OFFSET) {
    return { kind: 'central', quadrant };
  }
  if (offset < INBOUND_START) {
    // Running outward: rank 7 at offset 0, down to rank 1 at offset 6.
    return { kind: 'arm', arm: quadrant, file: 'outbound', rank: RANKS_PER_FILE - offset };
  }
  // Running back inward: rank 1 at offset 7, up to rank 7 at offset 13.
  return { kind: 'arm', arm: quadrant, file: 'inbound', rank: offset - INBOUND_START + 1 };
}

/**
 * The eight rounded squares: the outermost rank of each arm, both files.
 * Landing on one grants another turn. They sit either side of the U-turn.
 */
export const ROUNDED_SQUARES: readonly number[] = buildSpecialSquares([
  INBOUND_START - 1,
  INBOUND_START
]);

/**
 * The eight wedge squares: rank 3 of each file of each arm, one per file per
 * arm. Landing on one costs double the agreed penalty.
 *
 * Bell's text says eight squares are reduced by wedge markings; the printed
 * board draws eight wedges each straddling the rank 3/4 boundary, which would
 * leave sixteen squares flanked. Text and art cannot both be right, and this
 * implements the text's count (decided with the user). The rank is arbitrary
 * because the wedge is drawn symmetrically about that boundary. Switching to
 * the sixteen-square reading is a change to this one definition.
 */
export const WEDGE_SQUARES: readonly number[] = buildSpecialSquares([
  RANKS_PER_FILE - 3, // outbound file, rank 3
  INBOUND_START + 2 // inbound file, rank 3
]);

/** The four central squares, one crossed per quadrant. */
export const CENTRAL_SQUARES: readonly number[] = buildSpecialSquares([CENTRAL_OFFSET]);

/** The four entry squares, one per arm, arranged as a pinwheel on the board. */
export const ENTRY_SQUARES: readonly number[] = buildSpecialSquares([0]);

function buildSpecialSquares(offsets: readonly number[]): readonly number[] {
  const squares: number[] = [];
  for (let quadrant = 0; quadrant < ARM_COUNT; quadrant++) {
    for (const offset of offsets) {
      squares.push(quadrant * QUADRANT_LENGTH + offset);
    }
  }
  return squares.sort((a, b) => a - b);
}

const roundedSet = new Set(ROUNDED_SQUARES);
const wedgeSet = new Set(WEDGE_SQUARES);
const centralSet = new Set(CENTRAL_SQUARES);

export function isRounded(index: number): boolean {
  return roundedSet.has(mod(index, TRACK_LENGTH));
}

export function isWedge(index: number): boolean {
  return wedgeSet.has(mod(index, TRACK_LENGTH));
}

export function isCentral(index: number): boolean {
  return centralSet.has(mod(index, TRACK_LENGTH));
}

export function kindOf(index: number): SquareKind {
  const i = mod(index, TRACK_LENGTH);
  if (centralSet.has(i)) return 'central';
  if (roundedSet.has(i)) return 'rounded';
  if (wedgeSet.has(i)) return 'wedge';
  return 'plain';
}

/**
 * Translate a piece's own progress into a board square.
 *
 * Every player counts from their own entry square: own index 0 is that entry
 * square, and own index 59 is the last square of the circuit, the one before
 * it. Direction decides which way round the shared cycle they count.
 */
export function toTrackIndex(entryIndex: number, direction: Direction, ownIndex: number): number {
  return mod(entryIndex + direction * ownIndex, TRACK_LENGTH);
}
