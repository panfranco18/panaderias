import sharp from "sharp";
import { mkdirSync } from "fs";

// Colores tomados directo del hero (public/deleiteshero.png): el marrón/bordó
// de fondo del cartel y el crema/dorado del título.
const MARRON = "#6d2530";
const CREMA = "#f7e6cc";

mkdirSync("public/icons", { recursive: true });

// 1) Recortamos el logo "Deleites" (el cartel blanco con forma de nube) del
//    hero, ya con margen de fondo marrón parejo alrededor.
const logoCrop = await sharp("public/deleiteshero.png")
  .extract({ left: 1280, top: 0, width: 620, height: 330 })
  .toBuffer();

async function iconoConLogo(size, { padding = 0 } = {}) {
  const logoRedimensionado = await sharp(logoCrop)
    .resize({
      width: Math.round(size * (1 - padding * 2)),
      height: Math.round(size * (1 - padding * 2)),
      fit: "contain",
      background: MARRON,
    })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: MARRON },
  })
    .composite([{ input: logoRedimensionado, gravity: "center" }])
    .png()
    .toBuffer();
}

const icon192 = await iconoConLogo(192);
await sharp(icon192).toFile("public/icons/icon-192.png");
console.log("generado icon-192.png (logo Deleites)");

const icon512 = await iconoConLogo(512);
await sharp(icon512).toFile("public/icons/icon-512.png");
console.log("generado icon-512.png (logo Deleites)");

// Maskable: el sistema operativo recorta el icono a una forma (círculo, squircle,
// etc.), así que el logo va más chico y centrado, con margen de seguridad ~20%.
const icon512Maskable = await iconoConLogo(512, { padding: 0.14 });
await sharp(icon512Maskable).toFile("public/icons/icon-512-maskable.png");
console.log("generado icon-512-maskable.png (logo Deleites)");

const appleTouchIcon = await iconoConLogo(180);
await sharp(appleTouchIcon).toFile("public/icons/apple-touch-icon.png");
await sharp(appleTouchIcon).toFile("src/app/apple-icon.png");
console.log("generado apple-touch-icon.png / src/app/apple-icon.png (logo Deleites)");

// 2) Favicon de la pestaña del navegador: monograma "DL", chico y legible.
const svgFavicon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="${MARRON}"/>
  <text
    x="256" y="326"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-weight="700"
    font-size="248"
    fill="${CREMA}"
  >DL</text>
</svg>
`;

await sharp(Buffer.from(svgFavicon)).resize(512, 512).png().toFile("src/app/icon.png");
console.log("generado src/app/icon.png (favicon DL)");
