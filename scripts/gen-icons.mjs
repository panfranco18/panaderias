import sharp from "sharp";
import { mkdirSync } from "fs";

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#b45309"/>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#d97706"/>
      <stop offset="1" stop-color="#92400e"/>
    </linearGradient>
  </defs>
  <g transform="translate(96,140)">
    <path d="M0 96C0 42.98 43.5 0 97 0h126c53.5 0 97 42.98 97 96v40a24 24 0 0 1-24 24H24a24 24 0 0 1-24-24V96z"
      fill="none" stroke="#fff7ed" stroke-width="16" stroke-linejoin="round"/>
    <path d="M52 68c8-12 16-18 16-36M118 68c6-14 10-24 10-42M184 68c8-12 16-18 16-36"
      stroke="#fff7ed" stroke-width="14" stroke-linecap="round"/>
  </g>
</svg>
`;

mkdirSync("public/icons", { recursive: true });

const sizes = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const { file, size } of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/${file}`);
  console.log("generado", file);
}

// icono maskable con más padding (zona segura ~80%)
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#92400e"/>
  <g transform="translate(146,186)">
    <path d="M0 76C0 34 34.5 0 77 0h100c42.5 0 77 34 77 76v32a19 19 0 0 1-19 19H19A19 19 0 0 1 0 108V76z"
      fill="none" stroke="#fff7ed" stroke-width="13" stroke-linejoin="round"/>
    <path d="M41 54c6-9 13-14 13-29M93 54c5-11 8-19 8-33M145 54c6-9 13-14 13-29"
      stroke="#fff7ed" stroke-width="11" stroke-linecap="round"/>
  </g>
</svg>
`;
await sharp(Buffer.from(svgMaskable))
  .resize(512, 512)
  .png()
  .toFile("public/icons/icon-512-maskable.png");
console.log("generado icon-512-maskable.png");
