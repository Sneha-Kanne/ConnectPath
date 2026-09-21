const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node PNG generator that rasterizes a clean ConnectPath icon
function createPNG(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Uncompressed RGBA scanlines (height rows, each: 1 filter byte + width * 4 bytes)
  const rowSize = 1 + width * 4;
  const buffer = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = isMaskable ? width * 0.48 : width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Coordinates relative to center
      const nx = (x - cx) / (width / 2);
      const ny = (y - cy) / (height / 2);
      const distFromCenter = Math.hypot(nx, ny);

      // Default dark obsidian background
      let r = 11;
      let g = 17;
      let b = 32;
      let a = 255;

      // Outer border / rounded corners
      if (!isMaskable && distFromCenter > 0.98) {
        // Soft rounded corners
        a = Math.max(0, Math.min(255, Math.floor((1.0 - distFromCenter) * 2550)));
      }

      // Signal wave arcs in top-right
      const waveCenterNx = 0.25;
      const waveCenterNy = -0.3;
      const waveDist = Math.hypot(nx - waveCenterNx, ny - waveCenterNy);

      // Wave 1
      if (Math.abs(waveDist - 0.22) < 0.025 && ny < waveCenterNy + 0.05) {
        r = 0; g = 240; b = 255;
      }
      // Wave 2
      else if (Math.abs(waveDist - 0.38) < 0.025 && ny < waveCenterNy + 0.1) {
        r = 0; g = 200; b = 255;
      }
      // Wave 3
      else if (Math.abs(waveDist - 0.54) < 0.025 && ny < waveCenterNy + 0.15) {
        r = 0; g = 160; b = 230;
      }
      // Beacon center
      else if (waveDist < 0.06) {
        r = 255; g = 255; b = 255;
      }

      // Navigational route path curve: S-curve from (-0.55, 0.55) to (0.55, -0.55)
      // Parametric curve approximation
      // Check distance to route curve: y = -x + 0.3 * sin(x * 3.5)
      const curveY = -nx + 0.25 * Math.sin(nx * 3.14);
      const distToCurve = Math.abs(ny - curveY);

      if (distToCurve < 0.065 && nx >= -0.65 && nx <= 0.65) {
        // Gradient along route from Coral (#ff3366) to Cyan (#00f0ff) to Emerald (#10b981)
        const t = (nx + 0.65) / 1.3;
        if (t < 0.5) {
          const subT = t * 2;
          r = Math.round(255 * (1 - subT) + 0 * subT);
          g = Math.round(51 * (1 - subT) + 240 * subT);
          b = Math.round(102 * (1 - subT) + 255 * subT);
        } else {
          const subT = (t - 0.5) * 2;
          r = Math.round(0 * (1 - subT) + 16 * subT);
          g = Math.round(240 * (1 - subT) + 185 * subT);
          b = Math.round(255 * (1 - subT) + 129 * subT);
        }
      }

      // Start Dot (Origin: Coral Glow)
      const startDist = Math.hypot(nx - (-0.55), ny - 0.55);
      if (startDist < 0.09) {
        if (startDist < 0.04) {
          r = 255; g = 255; b = 255;
        } else {
          r = 255; g = 51; b = 102;
        }
      }

      // End Dot (Destination: Emerald Glow)
      const endDist = Math.hypot(nx - 0.55, ny - (-0.55));
      if (endDist < 0.09) {
        if (endDist < 0.04) {
          r = 255; g = 255; b = 255;
        } else {
          r = 16; g = 185; b = 129;
        }
      }

      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  // Create PNG chunks
  const compressed = zlib.deflateSync(buffer);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    // Calculate CRC32 over type + data
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = crc32(toCrc);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, toCrc, crcBuf]);
  }

  // CRC32 table & calculation
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // Header chunk IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Precompute CRC table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

const pubDir = path.resolve('./public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir);

// Generate 192x192 PNG
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192));
// Generate 512x512 PNG
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512));
// Generate 512x512 maskable PNG
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPNG(512, true));
// Generate 180x180 Apple Touch Icon PNG
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180));

console.log('✓ Successfully generated PWA PNG icons in /public:');
console.log('  - pwa-192x192.png');
console.log('  - pwa-512x512.png');
console.log('  - pwa-maskable-512x512.png');
console.log('  - apple-touch-icon.png');
