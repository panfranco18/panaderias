const { p, s, l, n } = require("./generar-manuales");

// Manual paso a paso para el personal (cajeras, encargados). Mismo
// sistema de edición que el manual admin: editá el capítulo que
// corresponda y volvé a correr node scripts/generar-manuales.js

const CAPITULOS_EMPLEADOS = [
  {
    titulo: "Cómo entrar al sistema",
    contenido: [
      p(
        "Entrá a panaderiap-772.netlify.app/login desde tu celular o computadora, y poné el email y la contraseña que te dio el superadmin."
      ),
      p(
        "Vas a ver solo las opciones que te habilitaron en el menú de la izquierda (por ejemplo, si solo tenés acceso a Caja, vas a ver \"Inicio\" y \"Caja\")."
      ),
      n(
        "Apenas te loguees por primera vez en el día, el sistema te marca solo como \"presente\" — no hace falta que aprietes ningún botón para eso."
      ),
    ],
  },
  {
    titulo: "Fichar entrada y salida",
    contenido: [
      p(
        "En el menú tenés un botón \"Marcar entrada\" / \"Marcar salida\". La primera entrada del día se marca sola al loguearte, pero si volvés a entrar después de haber marcado tu salida (por ejemplo, después de un corte), tenés que tocar \"Marcar entrada\" de nuevo."
      ),
    ],
  },
  {
    titulo: "Cómo hacer una venta",
    contenido: [
      p("Desde el menú, entrá a Caja y tocá el botón \"Vender\"."),
      s("Paso 1 — Elegí la sucursal"),
      p("Si tenés más de una sucursal disponible, elegí en cuál estás parada/o."),
      s("Paso 2 — Agregá los productos"),
      l([
        "Buscá el producto escribiendo su nombre, o tocá \"Escanear código\" para leer el código de barras con la cámara.",
        "Si el producto se vende por peso, poné la cantidad en kilos o gramos en el carrito.",
        "Si el producto es de \"monto libre\" (por ejemplo Varios Despensa), te va a aparecer un cartel pidiéndote que ingreses el importe de esa venta — escribilo y tocá \"Agregar\". Podés agregar varias ventas de este tipo con montos distintos, no se mezclan entre sí.",
      ]),
      s("Paso 3 — Elegí la forma de pago"),
      p("Efectivo, Posnet, Tarjeta, Transferencia o Mercado Pago."),
      s("Paso 4 — Tildá Venta 1 o Venta Deleite"),
      n(
        "Es obligatorio tildar una de las dos casillas antes de cobrar. Si no tildás ninguna, o tildás las dos, te va a aparecer un cartel con tu nombre pidiéndote que corrijas — no te deja cobrar hasta que quede tildada exactamente una."
      ),
      s("Paso 5 — Cobrar e imprimir"),
      p(
        "Tocá \"Cobrar\". Después podés imprimir el ticket para el cliente, o la comanda si hace falta prepararlo."
      ),
    ],
  },
  {
    titulo: "Reportar un faltante de stock",
    contenido: [
      p(
        "Si en tu sucursal falta algo (por ejemplo, no queda pan de una variedad), entrá a Caja y buscá el cuadro \"Reportar faltante de stock\": elegí la categoría y escribí qué falta. Le llega un aviso al superadmin al instante."
      ),
      n(
        "El desplegable solo muestra las categorías que el superadmin habilitó para reportar faltantes — si no aparece la que buscás, avisale directamente."
      ),
    ],
  },
  {
    titulo: "Cierre X y Cierre Z",
    contenido: [
      p(
        "En Caja vas a ver un botón que dice \"Cierre X\" o \"Cierre Z\", según el horario y cómo esté configurada tu sucursal — no aparecen los dos juntos."
      ),
      s("Cierre X (turno mañana)"),
      p(
        "Sirve para revisar cómo viene la caja a media mañana, sin cerrar el día. Al tocarlo, se genera un aviso al superadmin y te lleva a una pantalla con el detalle de lo vendido hasta ese momento, que podés imprimir."
      ),
      s("Cierre Z (cierre del día)"),
      p(
        "Se usa a la tarde o al final del día. Muestra el total de la tarde por separado, y el total del día completo. También avisa al superadmin y se puede imprimir."
      ),
      n(
        "Si falta poco para que termine tu turno mañana y todavía no hiciste el Cierre X, te va a aparecer un cartel con tu nombre recordándotelo. Tocá \"Sigo\" para seguir trabajando — eso le avisa al superadmin que el cierre puede demorarse un poco, pero el botón sigue siendo \"Cierre X\" hasta que efectivamente lo hagas."
      ),
    ],
  },
  {
    titulo: "Arqueo de caja",
    contenido: [
      p(
        "Al lado del botón de Cierre X o Cierre Z hay un botón \"Arqueo de caja\" que podés usar en cualquier momento del día, sin necesidad de hacer un cierre. Te muestra las ventas de hoy separadas entre \"Venta 1\" y \"Venta Deleite\", con el detalle por forma de pago, los subtotales de cada una y el total general. También se puede imprimir."
      ),
    ],
  },
  {
    titulo: "Avisos y notificaciones",
    contenido: [
      s("Avisos"),
      p(
        "Si el superadmin te dejó un mensaje (un saludo, un recordatorio, o algo puntual de tu turno), va a aparecer como un cartel arriba de la pantalla cuando entrés. Lo podés cerrar con la cruz."
      ),
      s("Notificaciones (la campanita)"),
      p(
        "En el menú hay una campanita que te avisa de cosas como stock bajo o cambios de precio. Suena una campanita suave cuando llega algo nuevo — se activa después del primer click que hagas en la pantalla."
      ),
    ],
  },
  {
    titulo: "Instalar la app en tu celular",
    contenido: [
      p(
        "Arriba del panel hay un botón \"Instalar app\". Tocalo y confirmá — así te queda un ícono en tu celular como cualquier otra aplicación, sin tener que abrir el navegador cada vez."
      ),
      n(
        "Si usás iPhone, ese botón no va a aparecer porque Safari no lo permite. En ese caso, tocá el botón de compartir del navegador y elegí \"Agregar a inicio\"."
      ),
    ],
  },
];

module.exports = { CAPITULOS_EMPLEADOS };
