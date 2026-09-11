const { p, s, l, n } = require("./generar-manuales");

// Manual completo del panel admin, capítulo por capítulo. Para agregar o
// cambiar algo: buscá el capítulo por su título y editá su array
// "contenido" (usá p() para párrafos, s() para subtítulos, l() para
// listas con viñetas, n() para una nota destacada). Después corré:
//   node scripts/generar-manuales.js

const CAPITULOS_ADMIN = [
  {
    titulo: "Introducción",
    contenido: [
      p(
        "Este es el panel de administración de Deleites (panadería y fiambrería, con 4 sucursales en Santa Rosa y Toay, La Pampa). Desde acá se maneja todo el negocio: productos, precios, stock, personal, caja, ventas, proveedores, gastos y más."
      ),
      s("Cómo entrar"),
      p(
        "Se entra desde panaderiap-772.netlify.app/login con un email y una contraseña. Cada persona tiene su propia cuenta — no se comparten usuarios."
      ),
      s("Los tres tipos de cuenta (roles)"),
      l([
        "Superadmin (el dueño): ve y puede hacer todo, en todas las sucursales.",
        "Encargado de sucursal: maneja su propia sucursal (stock, caja, personal de esa sucursal), según los módulos que se le habiliten.",
        "Empleado: acceso acotado a lo que el superadmin le habilite (por ejemplo, solo Caja).",
      ]),
      p(
        "El menú de la izquierda cambia según el rol y los módulos habilitados: un empleado con acceso solo a Caja va a ver únicamente esa opción (y el panel Inicio)."
      ),
      n(
        "Las contraseñas no quedan guardadas en ningún lado legible — ni siquiera el superadmin puede \"verlas\" después de creadas. Si alguien se olvida la suya, se le resetea desde Personal y se genera una nueva."
      ),
    ],
  },
  {
    titulo: "Panel Inicio",
    contenido: [
      p(
        "Es la primera pantalla al entrar. Muestra el estado del negocio en vivo, actualizado al momento. El superadmin ve todas las sucursales; el resto del personal ve solo la suya."
      ),
      s("Accesos rápidos"),
      p(
        "Arriba de todo hay botones grandes de colores, uno por cada módulo al que la persona tiene acceso — sirven para entrar más rápido sin usar el menú lateral."
      ),
      s("Totales del día"),
      l([
        "Total vendido hoy, sumando todas las sucursales.",
        "Formas de pago hoy: cuánto entró por Efectivo, Posnet, Tarjeta, Transferencia y Mercado Pago.",
        "Pago a proveedores este mes (solo lo ve el superadmin): suma de las facturas de proveedores cargadas en el mes en curso.",
      ]),
      s("Por cada sucursal"),
      l([
        "Ventas de hoy y saldo de caja calculado.",
        "Pedidos pendientes (de la web).",
        "Formas de pago de esa sucursal en particular.",
        "Personal presente ahora, con la hora en que fichó su entrada.",
        "\"Stock de hoy\": si hay categorías configuradas para declaración diaria (por ejemplo Pan, Facturas, Tortas), aparece un cuadro para cargar cuánto hay al empezar el día, y va mostrando cuánto queda a medida que se vende.",
      ]),
    ],
  },
  {
    titulo: "Avisos",
    contenido: [
      p(
        "Permite mandarle un mensaje al personal que aparece como un cartel arriba de cualquier pantalla del panel cuando esa persona entra."
      ),
      l([
        "Se puede escribir un aviso general (lo ve todo el personal) o dirigido a un empleado puntual.",
        "Se elige la fecha en que tiene que aparecer (por defecto, hoy).",
        "El empleado puede ocultarlo con la cruz, pero solo por esa vez que entró — si vuelve a entrar otro día, lo ve de nuevo si sigue vigente esa fecha.",
      ]),
      n(
        "Cuando se le asigna un turno a alguien desde Horarios, se le crea automáticamente un aviso avisándole el día y horario que le toca — no hace falta escribirlo a mano."
      ),
    ],
  },
  {
    titulo: "Productos",
    contenido: [
      p(
        "El catálogo completo del negocio (más de 2.600 productos), organizado por categoría con un buscador arriba de todo."
      ),
      s("Datos de cada producto"),
      l([
        "Nombre, categoría y descripción.",
        "Precio base (y, si hace falta, un precio distinto por cada sucursal).",
        "Unidad de venta: por unidad, por kilo, por gramo o por docena.",
        "Código de barras, para poder escanearlo en Vender.",
        "Stock mínimo: si el stock baja de ese número, avisa solo.",
        "Imagen del producto.",
      ]),
      s("Monto variable"),
      p(
        "Algunos productos (como \"Varios Despensa\") no tienen un precio fijo: al venderlos, el sistema le pide al cajero que ingrese el importe en ese momento. Se activa con el tilde \"Monto variable\" al crear o editar el producto."
      ),
    ],
  },
  {
    titulo: "Categorías",
    contenido: [
      p(
        "Además de elegir la categoría al crear un producto, acá se configura cada categoría en sí (hay unas 25: Panes, Facturas, Tortas, Vinos, Limpieza, etc.)."
      ),
      l([
        "Se puede subir una imagen que se usa como fondo del banner, tanto en el panel como en la página web.",
        "\"Visible en la página de inicio\": si está destildado, esa categoría no aparece en la web para los clientes (pero sigue disponible normalmente en Productos, Stock y Caja).",
        "\"Permite reportar faltante\": si está tildado, el personal puede reportar faltantes de esa categoría desde Caja.",
        "\"El encargado declara la cantidad inicial cada día\": si está tildado, esa categoría aparece en el panel Inicio para cargar cuánto stock hay a la mañana (ver capítulo de Panel Inicio).",
      ]),
    ],
  },
  {
    titulo: "Sucursales",
    contenido: [
      p("Alta y datos de cada sucursal: nombre, dirección, horario de atención y costo de envío (para la web)."),
      p(
        "Hoy hay 4 sucursales cargadas: 13 de Caballería, 9 de Julio 190, Felice 45 y Perón 8450 (Toay)."
      ),
    ],
  },
  {
    titulo: "Personal",
    contenido: [
      p(
        "Acá se le da acceso al panel a la gente que va a trabajar con el sistema (cajeras, encargados, etc.). Es distinto del módulo \"Empleados\", que es solo el legajo de RRHH."
      ),
      s("Dar acceso a un empleado del legajo"),
      p(
        "Se elige a la persona de la lista de Empleados, se le pone un email (con eso va a iniciar sesión), el rol, la sucursal y qué módulos puede ver — se tilda uno por uno. Al crear la cuenta se genera una contraseña temporal que se muestra una sola vez: hay que copiarla y pasársela a la persona en ese momento, porque no se vuelve a mostrar."
      ),
      s("Resetear contraseña"),
      p(
        "Si alguien perdió su contraseña (o nunca se guardó cuando se creó la cuenta), se le puede generar una nueva desde el botón \"Resetear contraseña\" en su tarjeta. La contraseña anterior deja de funcionar apenas se genera la nueva."
      ),
      s("Editar y dar de baja"),
      p(
        "Se puede cambiar el nombre, cargo, sucursal, rol y los módulos habilitados, o destildar \"Empleado activo\" para que no pueda entrar más sin borrar la cuenta."
      ),
    ],
  },
  {
    titulo: "Horarios",
    contenido: [
      s("Turnos del personal"),
      p(
        "Se asigna a qué empleado, en qué sucursal, qué día y en qué horario le toca trabajar. Se puede ver la lista filtrada por hoy, esta semana o este mes. Al crear un turno, a la persona le llega un aviso con el día y el horario."
      ),
      s("Turnos de caja por sucursal (solo superadmin)"),
      p(
        "Es la configuración que decide qué botón de cierre ve el personal en Caja: \"Cierre X\" o \"Cierre Z\" (ver el capítulo de Caja para el detalle)."
      ),
      l([
        "Turno mañana: hora de inicio y de fin.",
        "Turno tarde: hora de inicio y de fin.",
        "Tilde \"Habilitar botón Cierre X en el turno mañana\": si no está tildado, esa sucursal solo usa Cierre Z, a cualquier hora del día.",
      ]),
    ],
  },
  {
    titulo: "Empleados",
    contenido: [
      p(
        "El legajo de Recursos Humanos: DNI, domicilio, fecha de nacimiento y de alta, obra social y responsable a cargo de cada persona que trabaja en el negocio (más allá de si tiene o no acceso al panel)."
      ),
    ],
  },
  {
    titulo: "Proveedores",
    contenido: [
      p("Alta de los proveedores del negocio (nombre, teléfono, contacto, notas)."),
      p(
        "Y la carga de las facturas de compra que van llegando: proveedor, sucursal, número de factura, monto, fecha y una foto de la factura."
      ),
    ],
  },
  {
    titulo: "Stock",
    contenido: [
      p("Control del stock de cada producto, por sucursal, organizado por categoría con buscador."),
      l([
        "Se carga la cantidad disponible de cada producto en cada sucursal.",
        "Si un producto tiene \"stock mínimo\" configurado en Productos y la cantidad baja de ese número, se genera una notificación automática de stock bajo.",
      ]),
    ],
  },
  {
    titulo: "Pedidos",
    contenido: [
      p("Los pedidos que los clientes hacen desde la página web (retiro en sucursal o envío a domicilio)."),
      l([
        "Se puede ver el detalle, cambiar el estado (pendiente, en preparación, listo, entregado, etc.) y ver los datos de contacto del cliente.",
        "Se puede imprimir la comanda para el mostrador o la cocina.",
      ]),
    ],
  },
  {
    titulo: "Caja",
    contenido: [
      p("Es el módulo del día a día: acá se cobra, se controla el efectivo y se hacen los cierres."),
      s("Movimientos manuales"),
      p(
        "Se puede registrar a mano una apertura de caja (el cambio con el que se arranca el día), un ingreso o un egreso (gastos chicos, retiros), o un cierre."
      ),
      s("Vender (el punto de venta)"),
      l([
        "Se elige la sucursal, se busca el producto por nombre o se escanea el código de barras.",
        "Los productos por peso piden la cantidad en kilos o gramos.",
        "Los productos de \"monto variable\" (como Varios Despensa) piden que se ingrese el importe.",
        "Se elige la forma de pago: Efectivo, Posnet, Tarjeta, Transferencia o Mercado Pago.",
        "Hay que tildar \"Venta 1\" o \"Venta Deleite\" (una de las dos, es obligatorio) antes de cobrar — si no se tilda ninguna, o se tildan las dos, el sistema avisa y no deja cobrar.",
        "Se cobra y se puede imprimir el ticket para el cliente o la comanda.",
      ]),
      s("Reportar faltante de stock"),
      p(
        "Desde Caja, si falta algo de una categoría habilitada para esto, se elige la categoría y se escribe qué falta — le llega un aviso al superadmin."
      ),
      s("Cierre de caja (solo superadmin)"),
      p(
        "Un botón para ver, en cualquier momento del día, todo el movimiento de esa sucursal hasta ese instante — sin cerrar ni resetear nada. Sirve para chequear cómo viene el día."
      ),
      s("Cierre X y Cierre Z (para el personal)"),
      p(
        "En vez del botón anterior, el personal ve \"Cierre X\" o \"Cierre Z\", según el turno configurado en Horarios para esa sucursal:"
      ),
      l([
        "Cierre X: aparece durante el turno mañana (si esa sucursal lo tiene habilitado). Sirve para que la persona controle lo que hizo en la mañana, sin cerrar el día. Se puede imprimir, y le manda un aviso al superadmin.",
        "Cierre Z: aparece en el turno tarde (o siempre, si esa sucursal no usa Cierre X). Muestra el total de la tarde y el total del día completo. También se puede imprimir y avisa al superadmin.",
      ]),
      n(
        "Si falta poco para que termine el turno mañana y todavía no se hizo el Cierre X, le va a aparecer un cartel a la empleada recordándoselo. Al tocar \"Sigo\", el sistema le avisa al superadmin que el cierre puede demorarse un poco, pero sigue mostrando Cierre X hasta que efectivamente se haga — no pasa solo a Cierre Z."
      ),
      s("Arqueo de caja"),
      p(
        "Un botón, al lado de Cierre X/Z, que lo puede usar tanto el personal como el superadmin en cualquier momento del día. Separa las ventas de hoy en \"Venta 1\" y \"Venta Deleite\", con el desglose por forma de pago y el subtotal de cada una, más el total general. También se puede imprimir."
      ),
    ],
  },
  {
    titulo: "Facturación",
    contenido: [
      p(
        "Registro de las facturas de venta emitidas, por sucursal y por fecha, con el número, el CUIT del cliente (si corresponde) y el monto."
      ),
    ],
  },
  {
    titulo: "Gastos",
    contenido: [
      p(
        "Solo lo ve el superadmin. Carga de los gastos fijos del negocio: alquileres, impuestos, sueldos, seguros, etc., con categoría, fecha, monto, vencimiento y fecha de pago."
      ),
    ],
  },
  {
    titulo: "Contratos",
    contenido: [
      p(
        "Solo lo ve el superadmin. Los contratos de alquiler de cada local: titular, inmobiliaria, vigencia, aumentos y observaciones."
      ),
    ],
  },
  {
    titulo: "Clientes con cuenta corriente",
    contenido: [
      p(
        "Solo lo ve el superadmin. Para los clientes que retiran mercadería y pagan después (por ejemplo colegios o instituciones): cada cliente tiene su propio historial de retiros y pagos, y el sistema calcula el saldo solo."
      ),
    ],
  },
  {
    titulo: "Reportes",
    contenido: [
      p("Estadísticas de ventas por sucursal y por período (hoy, últimos 7 días, últimos 30 días)."),
      l([
        "Total vendido, cantidad de ventas y ticket promedio.",
        "Ranking de los productos más vendidos, con cantidad y monto.",
      ]),
    ],
  },
  {
    titulo: "Configuración",
    contenido: [
      p("Solo lo ve el superadmin."),
      s("Cuenta de Mercado Pago"),
      p(
        "El alias, titular y CBU/CVU que se le muestran al cliente cuando elige pagar por Mercado Pago en la web. El pago se confirma a mano, no hay integración automática con la cuenta real de Mercado Pago."
      ),
      s("Mi cuenta"),
      p("Acá el superadmin puede cambiar su propio nombre visible y su contraseña de acceso al panel."),
    ],
  },
  {
    titulo: "Notificaciones",
    contenido: [
      p(
        "La campanita, visible para todo el personal logueado, avisa de novedades importantes. Se actualiza sola cada 25 segundos y suena una campanita suave cuando llega algo nuevo (se activa con el primer click que se haga en el panel, por las reglas de los navegadores)."
      ),
      s("Tipos de aviso"),
      l([
        "Stock bajo: un producto quedó por debajo de su stock mínimo (lo ve el personal de esa sucursal).",
        "Cambio de precio: se actualizó el precio de venta de un producto (lo ve el personal, para actualizar el mostrador).",
        "Faltante reportado: alguien reportó que falta algo de una categoría (lo ve el personal de esa sucursal).",
        "Venta registrada, fichaje, Cierre X, Cierre Z y \"cierre demorado\": estos cinco tipos los ve únicamente el superadmin.",
      ]),
    ],
  },
  {
    titulo: "La app en el celular y las cuentas de prueba",
    contenido: [
      s("Instalar la app"),
      p(
        "Arriba del panel (en la barra de arriba en el celular, o en el costado en la computadora) hay un botón \"Instalar app\" que deja instalar el panel como si fuera una aplicación, con su propio ícono. En iPhone no aparece ese botón porque Safari no lo permite — ahí se instala con \"Agregar a inicio\" desde el botón de compartir."
      ),
      s("Fichaje automático"),
      p(
        "Apenas alguien con sucursal asignada se loguea por primera vez en el día, el sistema lo marca solo como \"presente\" (sin que tenga que tocar ningún botón) — así el superadmin ve quién está trabajando y a qué hora entró, desde el Panel Inicio."
      ),
    ],
  },
];

module.exports = { CAPITULOS_ADMIN };
