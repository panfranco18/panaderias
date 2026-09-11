const { renderizarManual } = require("./generar-manuales");
const { CAPITULOS_ADMIN } = require("./contenido-manual-admin");
const { CAPITULOS_EMPLEADOS } = require("./contenido-manual-empleados");

const rutaAdmin = renderizarManual({
  archivo: "manual-admin.pdf",
  tituloPortada: "Manual del Panel Admin",
  subtituloPortada: "Guía completa de todos los módulos del sistema, punto por punto",
  colorPortada: "#7c2d12",
  capitulos: CAPITULOS_ADMIN,
});
console.log("generado", rutaAdmin);

const rutaEmpleados = renderizarManual({
  archivo: "manual-empleados.pdf",
  tituloPortada: "Manual para Empleados",
  subtituloPortada: "Cómo usar el sistema, paso a paso",
  colorPortada: "#92400e",
  capitulos: CAPITULOS_EMPLEADOS,
});
console.log("generado", rutaEmpleados);
