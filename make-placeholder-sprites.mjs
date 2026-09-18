// Draws a placeholder sprite for every species in a pack folder's species.csv, so a pack can be loaded
// and walked before any real art exists. Replace them one at a time as you draw.
// Usage: node make-placeholder-sprites.mjs <packdir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const dir = process.argv[2];
if (!dir) { console.error('usage: node make-placeholder-sprites.mjs <packdir>'); process.exit(2); }

const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function png(size, pixels) {   // pixels(x, y) -> [r, g, b, a]
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) { raw[o++] = 0;
    for (let x = 0; x < size; x++) { const [r, g, b, a] = pixels(x, y); raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a; } }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const hsl = (h, s, l) => { const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
  return [f(0), f(8), f(4)]; };

const rows = readFileSync(join(dir, 'species.csv'), 'utf8').trim().split(/\r?\n/).slice(1)
  .map(l => l.split(',')).filter(c => c[0]);
const SIZE = 64;
let made = 0;
for (const c of rows) {
  const [id, name, family, stage, , , sprite] = c;
  const seed = hash(id + family);
  const hue = seed % 360, hue2 = (hue + 40 + (seed >> 8) % 80) % 360;
  const body = hsl(hue, 0.55, 0.5), mark = hsl(hue2, 0.65, 0.62), dark = hsl(hue, 0.5, 0.28);
  const r = (SIZE / 2) - 6 - (3 - Math.min(3, +stage || 1)) * 3;   // later stages a little larger
  const buf = png(SIZE, (x, y) => {
    const cx = x - SIZE / 2 + 0.5, cy = y - SIZE / 2 + 4;
    const d = Math.hypot(cx, cy * 1.12);
    if (d > r) return [0, 0, 0, 0];
    if (d > r - 2) return [...dark, 255];
    // two eyes and a band, enough to tell one from another at a glance
    if (Math.hypot(Math.abs(cx) - r * 0.32, cy + r * 0.22) < r * 0.13) return [20, 24, 22, 255];
    if (Math.abs(cy - r * 0.35) < r * 0.1 && Math.abs(cx) < r * 0.55) return [...mark, 255];
    const shade = 1 - (cy + r) / (r * 2.6) * 0.35;
    return [Math.round(body[0] * shade), Math.round(body[1] * shade), Math.round(body[2] * shade), 255];
  });
  writeFileSync(join(dir, sprite || (id + '.png')), buf); made++;
}
console.log('wrote ' + made + ' placeholder sprites into ' + dir);
