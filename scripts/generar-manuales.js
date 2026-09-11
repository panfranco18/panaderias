// Genera los dos manuales en PDF (panel admin y empleados) a partir del
// contenido definido más abajo. Para actualizarlos el día de mañana:
// editá el contenido (CONTENIDO_ADMIN / CONTENIDO_EMPLEADOS) y volvé a
// correr:
//
//   node scripts/generar-manuales.js
//
// Genera docs/manual-admin.pdf y docs/manual-empleados.pdf.

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "..", "docs");
fs.mkdirSync(DOCS_DIR, { recursive: true });

const COLOR = {
  acento: "#9a3412", // bordó/naranja oscuro, línea del branding "Deleites"
  titulo: "#1c1917",
  texto: "#3f3f46",
  suave: "#78716c",
  notaFondo: "#fef3c7",
  notaBorde: "#d97706",
  lineaSeparadora: "#e7e5e4",
};

const MARGEN = 56;

// ---------------------------------------------------------------------
// Utilidades de layout
// ---------------------------------------------------------------------

function nuevaPagina(doc) {
  doc.addPage();
  doc.y = MARGEN;
}

function espacioDisponible(doc) {
  return doc.page.height - doc.page.margins.bottom - doc.y;
}

function asegurarEspacio(doc, necesario) {
  if (espacioDisponible(doc) < necesario) {
    nuevaPagina(doc);
  }
}

function tituloCapitulo(doc, numero, texto) {
  asegurarEspacio(doc, 70);
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor(COLOR.acento)
    .text(`${numero}. ${texto}`, MARGEN, doc.y, { width: doc.page.width - MARGEN * 2 });
  doc
    .moveTo(MARGEN, doc.y + 4)
    .lineTo(doc.page.width - MARGEN, doc.y + 4)
    .lineWidth(1)
    .strokeColor(COLOR.lineaSeparadora)
    .stroke();
  doc.moveDown(0.6);
}

function subtitulo(doc, texto) {
  asegurarEspacio(doc, 34);
  doc.moveDown(0.3);
  doc
    .font("Helvetica-Bold")
    .fontSize(12.5)
    .fillColor(COLOR.titulo)
    .text(texto, MARGEN, doc.y, { width: doc.page.width - MARGEN * 2 });
  doc.moveDown(0.15);
}

function parrafo(doc, texto) {
  const width = doc.page.width - MARGEN * 2;
  doc.font("Helvetica").fontSize(10.3);
  const altura = doc.heightOfString(texto, { width, lineGap: 2 });
  asegurarEspacio(doc, altura + 10);
  doc
    .fillColor(COLOR.texto)
    .text(texto, MARGEN, doc.y, {
      width,
      align: "left",
      lineGap: 2,
    });
  doc.moveDown(0.25);
}

function lista(doc, items) {
  const x = MARGEN + 12;
  const width = doc.page.width - MARGEN * 2 - 12;
  doc.font("Helvetica").fontSize(10.3).fillColor(COLOR.texto);
  for (const item of items) {
    const altura = doc.heightOfString(item, { width, lineGap: 2 });
    asegurarEspacio(doc, altura + 8);
    doc.text("•", MARGEN, doc.y, { continued: false, width: 12 });
    const yBala = doc.y;
    doc.text(item, x, yBala - doc.currentLineHeight(), { width, lineGap: 2 });
  }
  doc.moveDown(0.3);
}

function nota(doc, texto) {
  const width = doc.page.width - MARGEN * 2;
  doc.font("Helvetica-Bold").fontSize(9.5);
  const alturaTexto = doc.heightOfString(`Importante: ${texto}`, {
    width: width - 20,
  });
  const alturaCaja = alturaTexto + 16;
  asegurarEspacio(doc, alturaCaja + 10);
  const x = MARGEN;
  const yInicio = doc.y;
  doc
    .rect(x, yInicio, width, alturaCaja)
    .fillColor(COLOR.notaFondo)
    .fillOpacity(1)
    .fill();
  doc
    .rect(x, yInicio, 4, alturaCaja)
    .fillColor(COLOR.notaBorde)
    .fill();
  doc
    .fillColor("#7c2d12")
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text("Importante: ", x + 12, yInicio + 8, { continued: true, width: width - 24 })
    .font("Helvetica")
    .text(texto);
  doc.y = yInicio + alturaCaja + 10;
}

function separadorSuave(doc) {
  doc.moveDown(0.2);
}

// ---------------------------------------------------------------------
// Portada
// ---------------------------------------------------------------------

function portada(doc, tituloPrincipal, subtituloTexto, colorFondo) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(colorFondo).fill();

  doc
    .fillColor("#fdf4e8")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("DELEITES", MARGEN, 90, { characterSpacing: 3 });
  doc
    .fillColor("#f5dcb8")
    .font("Helvetica")
    .fontSize(11)
    .text("Panadería y Fiambrería", MARGEN, 112);

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text(tituloPrincipal, MARGEN, 260, { width: doc.page.width - MARGEN * 2 });

  doc
    .fillColor("#f5dcb8")
    .font("Helvetica")
    .fontSize(13)
    .text(subtituloTexto, MARGEN, doc.y + 14, { width: doc.page.width - MARGEN * 2 });

  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  doc
    .fillColor("#e7c9a0")
    .font("Helvetica")
    .fontSize(9.5)
    .text(`Sistema de gestión — panaderiap-772.netlify.app — actualizado el ${fecha}`, MARGEN, doc.page.height - 70);

  nuevaPagina(doc);
}

function numerarPaginas(doc) {
  const total = doc.bufferedPageRange().count;
  for (let i = 0; i < total; i++) {
    doc.switchToPage(i);
    if (i === 0) continue; // portada sin número
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLOR.suave)
      .text(`${i} / ${total - 1}`, 0, doc.page.height - 40, {
        align: "center",
        width: doc.page.width,
        height: 20,
        lineBreak: false,
      });
  }
}

// ---------------------------------------------------------------------
// Render genérico de un manual a partir de una lista de capítulos
// ---------------------------------------------------------------------

function renderizarManual({ archivo, tituloPortada, subtituloPortada, colorPortada, capitulos }) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN },
    bufferPages: true,
  });
  doc.pipe(fs.createWriteStream(path.join(DOCS_DIR, archivo)));

  portada(doc, tituloPortada, subtituloPortada, colorPortada);

  capitulos.forEach((cap, idx) => {
    tituloCapitulo(doc, idx + 1, cap.titulo);
    for (const bloque of cap.contenido) {
      if (bloque.tipo === "parrafo") parrafo(doc, bloque.texto);
      else if (bloque.tipo === "subtitulo") subtitulo(doc, bloque.texto);
      else if (bloque.tipo === "lista") lista(doc, bloque.items);
      else if (bloque.tipo === "nota") nota(doc, bloque.texto);
      else if (bloque.tipo === "espacio") separadorSuave(doc);
    }
  });

  numerarPaginas(doc);
  doc.end();
  return path.join(DOCS_DIR, archivo);
}

// Atajos para escribir el contenido de forma más corta.
const p = (texto) => ({ tipo: "parrafo", texto });
const s = (texto) => ({ tipo: "subtitulo", texto });
const l = (items) => ({ tipo: "lista", items });
const n = (texto) => ({ tipo: "nota", texto });

module.exports = {
  renderizarManual,
  p,
  s,
  l,
  n,
};
