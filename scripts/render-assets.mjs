/**
 * Renders the social card and the icon from the real board.
 *
 * Both assets derive from `src/lib/geometry.ts` and the colours in
 * `src/styles/tokens.css`, so they cannot drift from the board they depict:
 * change the geometry or the palette, rerun this, and the pictures follow.
 * Nothing here is hand-placed except the composition itself.
 *
 * Output is deterministic — no randomness, no timestamps — so rerunning on an
 * unchanged tree produces no diff, which is what makes it safe to run without
 * thinking about it.
 *
 * Run with `npm run assets`.
 */

import { createServer } from 'vite';
import { deflateSync } from 'node:zlib';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- colour ------------------------------------------------------------

/** OKLCH to linear sRGB, then to 8-bit gamma-encoded sRGB. */
function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
  return lin.map((v) => {
    const c = Math.max(0, Math.min(1, v));
    const g = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(g * 255);
  });
}

/**
 * The palette is read out of the token file rather than restated here, so the
 * assets can only ever use one of the five dye roles the design defines.
 */
function readTokens() {
  const css = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
  const tokens = {};
  const pattern = /--([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g;
  for (const [, name, L, C, h] of css.matchAll(pattern)) {
    tokens[name] = oklchToRgb(Number(L), Number(C), Number(h));
  }
  const required = ['mat', 'mat-woven', 'ulli', 'cochineal', 'indigo'];
  for (const name of required) {
    if (!tokens[name]) throw new Error(`Token --${name} not found in tokens.css`);
  }
  return tokens;
}

const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

// --- a very small rasteriser -------------------------------------------

function canvas(width, height, fill) {
  const data = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    data[i * 3] = fill[0];
    data[i * 3 + 1] = fill[1];
    data[i * 3 + 2] = fill[2];
  }
  return { width, height, data };
}

function put(c, x, y, colour) {
  if (x < 0 || y < 0 || x >= c.width || y >= c.height) return;
  const i = (Math.floor(y) * c.width + Math.floor(x)) * 3;
  c.data[i] = colour[0];
  c.data[i + 1] = colour[1];
  c.data[i + 2] = colour[2];
}

function fillRect(c, x, y, w, h, colour) {
  for (let py = Math.floor(y); py < Math.ceil(y + h); py++) {
    for (let px = Math.floor(x); px < Math.ceil(x + w); px++) put(c, px, py, colour);
  }
}

function strokeRect(c, x, y, w, h, weight, colour) {
  fillRect(c, x, y, w, weight, colour);
  fillRect(c, x, y + h - weight, w, weight, colour);
  fillRect(c, x, y, weight, h, colour);
  fillRect(c, x + w - weight, y, weight, h, colour);
}

function fillCircle(c, cx, cy, r, colour) {
  for (let py = Math.floor(cy - r); py <= Math.ceil(cy + r); py++) {
    for (let px = Math.floor(cx - r); px <= Math.ceil(cx + r); px++) {
      if ((px + 0.5 - cx) ** 2 + (py + 0.5 - cy) ** 2 <= r * r) put(c, px, py, colour);
    }
  }
}

/** Scanline fill for the wedge marks. */
function fillTriangle(c, p, q, r, colour) {
  const minY = Math.floor(Math.min(p[1], q[1], r[1]));
  const maxY = Math.ceil(Math.max(p[1], q[1], r[1]));
  const minX = Math.floor(Math.min(p[0], q[0], r[0]));
  const maxX = Math.ceil(Math.max(p[0], q[0], r[0]));
  const area = (a, b, m) => (b[0] - a[0]) * (m[1] - a[1]) - (b[1] - a[1]) * (m[0] - a[0]);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const m = [x + 0.5, y + 0.5];
      const d1 = area(p, q, m);
      const d2 = area(q, r, m);
      const d3 = area(r, p, m);
      const neg = d1 < 0 || d2 < 0 || d3 < 0;
      const pos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(neg && pos)) put(c, x, y, colour);
    }
  }
}

// --- PNG ---------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, body) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, crc]);
}

function encodePng(c) {
  const stride = c.width * 3;
  const raw = Buffer.alloc((stride + 1) * c.height);
  for (let y = 0; y < c.height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none, so output is byte-stable
    c.data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.width, 0);
  ihdr.writeUInt32BE(c.height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// --- the card ----------------------------------------------------------

const CARD = { width: 1200, height: 630 };

/**
 * Counters are placed on named track indices rather than scattered, so the
 * card shows a plausible position: a couple of pieces each, one pair adjacent
 * to hint at the blocking that is the whole of the game's strategy.
 */
const CARD_PIECES = [
  { index: 4, player: 0 },
  { index: 5, player: 0 },
  { index: 22, player: 1 },
  { index: 38, player: 1 },
  { index: 51, player: 0 }
];

function renderCard(geometry, board, tokens) {
  const { CELL, VIEW, allCells, cellFor } = geometry;
  const c = canvas(CARD.width, CARD.height, tokens.mat);

  // Fit the square board into the card's height, with room to breathe.
  const size = 578;
  const scale = size / VIEW.width;
  const originX = (CARD.width - size) / 2;
  const originY = (CARD.height - size) / 2;
  const X = (u) => originX + u * scale;
  const Y = (u) => originY + u * scale;
  const line = Math.max(2, Math.round(0.35 * scale));

  for (const [index, cell] of allCells().entries()) {
    const x = X(cell.x);
    const y = Y(cell.y);
    const side = CELL * scale;
    fillRect(c, x, y, side, side, tokens['mat-woven']);

    const kind = board.kindOf(index);
    if (kind === 'wedge') {
      const inset = 0.18 * CELL * scale;
      fillTriangle(
        c,
        [x + inset, y],
        [x + side - inset, y],
        [x + side / 2, y + 0.42 * side],
        tokens.ulli
      );
    } else if (kind === 'central') {
      fillCircle(c, x + side / 2, y + side / 2, 0.16 * side, tokens.ulli);
    }
    // Entry squares carry the pinwheel that encodes the track. Drawn as the
    // game draws it: a diamond outline, made here by laying a smaller diamond
    // of the field colour back over a solid one.
    if (index % 15 === 0) {
      const m = side / 2;
      const diamond = (inset, colour) =>
        [
          [
            [x + inset, y + m],
            [x + m, y + inset],
            [x + side - inset, y + m]
          ],
          [
            [x + inset, y + m],
            [x + m, y + side - inset],
            [x + side - inset, y + m]
          ]
        ].forEach(([p, q, r]) => fillTriangle(c, p, q, r, colour));
      diamond(0.16 * side, tokens.ulli);
      diamond(0.16 * side + line, tokens['mat-woven']);
    }
    strokeRect(c, x, y, side, side, line, tokens.ulli);
  }

  for (const { index, player } of CARD_PIECES) {
    const cell = cellFor(index);
    const cx = X(cell.cx);
    const cy = Y(cell.cy);
    const r = 0.34 * CELL * scale;
    if (player === 0) {
      fillCircle(c, cx, cy, r, tokens.ulli);
      fillCircle(c, cx, cy, r - line, tokens.cochineal);
    } else {
      fillRect(c, cx - r, cy - r, r * 2, r * 2, tokens.ulli);
      fillRect(c, cx - r + line, cy - r + line, (r - line) * 2, (r - line) * 2, tokens.indigo);
    }
  }

  return encodePng(c);
}

// --- the icon ----------------------------------------------------------

/**
 * Deliberately not the card at a smaller size. Sixty squares at 32px is about
 * five pixels each and turns to mush, so the icon keeps the silhouette and
 * drops the grid. It carries its own mat ground because the browser chrome
 * behind it may be dark, and the mat is light.
 */
function renderIcon(tokens) {
  const arm = 25; // reach from centre to arm tip
  const half = 8; // half the width of an arm
  const mid = 32;
  const mat = hex(tokens.mat);
  const ulli = hex(tokens.ulli);
  const cochineal = hex(tokens.cochineal);

  // A solid mark, not an outline. A hairline stroke is the first thing to
  // disappear when an icon is scaled to a tab bar, and it did: rendered at
  // 32px the stroked version left nothing but two specks.
  const cross = [
    `M ${mid - half} ${mid - arm}`,
    `H ${mid + half} V ${mid - half}`,
    `H ${mid + arm} V ${mid + half}`,
    `H ${mid + half} V ${mid + arm}`,
    `H ${mid - half} V ${mid + half}`,
    `H ${mid - arm} V ${mid - half}`,
    `H ${mid - half} Z`
  ].join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Patolli">
  <!-- Generated by scripts/render-assets.mjs from the design tokens. Do not edit by hand. -->
  <rect width="64" height="64" rx="10" fill="${mat}" />
  <path d="${cross}" fill="${ulli}" />
  <rect x="${mid - 7}" y="${mid - 7}" width="14" height="14" rx="1.5" fill="${cochineal}" />
</svg>
`;
}

// --- run ---------------------------------------------------------------

const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  // No watcher: this is a one-shot render, and watching the tree can exhaust
  // the system's inotify limit.
  server: { middlewareMode: true, watch: null },
  appType: 'custom'
});

try {
  const geometry = await server.ssrLoadModule('/src/lib/geometry.ts');
  const board = await server.ssrLoadModule('/src/lib/game/board.ts');
  const tokens = readTokens();

  writeFileSync(resolve(root, 'public/og.png'), renderCard(geometry, board, tokens));
  writeFileSync(resolve(root, 'public/icon.svg'), renderIcon(tokens));
  console.log('wrote public/og.png and public/icon.svg');
} finally {
  await server.close();
}
