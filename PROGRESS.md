# Panadería (sin nombre todavía) — Progreso del proyecto

> Este archivo se actualiza en cada sesión con lo que se hizo y lo que falta. Es la fuente de verdad del proyecto.

## Visión general

Sistema para una panadería con múltiples sucursales, propiedad de un solo dueño. Tiene dos frentes:

1. **Sitio web cliente**: catálogo de productos, compra online.
2. **Panel admin**: control del dueño sobre todas las sucursales.

Si sale la venta del sistema, se le pone el nombre real de la panadería (por ahora el repo/carpeta se llama `panaderiap`).

## Formato de planilla de ventas en papel (propuesto 2026-07-14)

Mientras no se defina el formato real que usan en las sucursales, se adopta este por defecto — se puede ajustar cuando el usuario cuente cómo anotan hoy:

```
PLANILLA DE VENTAS — [fecha] — Sucursal: __________

PRODUCTO              CANTIDAD    PRECIO UNIT.
------------------------------------------------
Medialuna                12          700
Pan francés               3         1500
...

TOTAL DEL DÍA: ______________
```

Una fila por producto vendido en el día (no una fila por venta individual), cantidad total y precio unitario de ese producto. Foto de esta planilla → se sube en el panel → un modelo con visión (Claude) extrae las filas → el encargado revisa/corrige antes de confirmar → se crea una venta con esos items (`origen = 'escaneo'`), igual que el POS.

## Funcionalidad esperada

### Sitio cliente
- Catálogo de productos de la panadería (con fotos, precio, disponibilidad).
- Compra online (carrito + checkout).
- Elegir sucursal de retiro o delivery (a definir).

### Panel admin (dueño)
- **Multi-sucursal**: alta de sucursales, cada una con sus propios productos/stock/ventas.
- **Facturación**: control de facturas por venta (online y en sucursal).
- **Compra en sucursal**: registro de ventas presenciales.
- **Control en vivo**: ver en tiempo real qué está pasando en cada sucursal (ventas del día, totales, etc).
- **Carga manual de ventas por escaneo de papel**: cada sucursal anota las ventas del día en un papel con un formato preestablecido. Se escanea (foto/imagen) y el sistema:
  1. Lee el papel (OCR).
  2. Identifica cada venta según el formato definido.
  3. Guarda cada venta en la tabla correspondiente.
  - **Pendiente de definir con el usuario**: el formato exacto de la planilla en papel (columnas: producto, cantidad, precio, hora, etc.) antes de poder diseñar el parser de OCR.

### Detalle del panel admin por módulo (pedido 2026-07-14)

1. **Productos**: alta/edición con imagen subida desde la PC (facturas, tortas, sandwiches, panes, etc.), precio base y precio override por sucursal (una sucursal puede cobrar distinto que otra).
2. **Sucursales**: ícono propio en el menú. Formulario: nombre, teléfono, dirección. Cada sucursal tiene un desplegable que muestra los empleados asignados a ella.
3. **Personal**: ícono propio en el menú. Alta de empleados por sucursal, con cargo y nivel de acceso al panel admin (qué puede ver/hacer cada uno). Solo el superadmin asigna niveles de acceso.
4. **Superadmin** (dueño): además de todo lo anterior, controla:
   - Stock (carga y control de stock por sucursal/producto).
   - Proveedores (alta de proveedores).
   - Facturas de proveedores (carga de comprobantes de compra).
   - Asignación de nivel de acceso al panel para cada empleado.
5. **Registro de ingreso de personal**: fichaje/registro de entrada de empleados por sucursal.
6. **Pedidos**:
   - Solicitud de pedidos (para el sitio cliente: pedidos online, compras en la página, carrito de compras).
   - Consultas sobre pedidos para fiestas/eventos (formulario de consulta, no venta directa).
7. **Caja y facturación**:
   - Control de caja por sucursal.
   - Facturación diaria.
   - Ingresos por sucursal (reporte).
   - Carga manual de ventas (sistema de caja) **o** escaneo de planilla en papel (OCR) — mismo mecanismo descripto arriba.

**Roles previstos**: `superadmin` (dueño, acceso total), `encargado_sucursal` (gestiona su sucursal: stock, caja, personal de esa sucursal), `empleado` (acceso acotado según nivel asignado — ej. solo carga de ventas/caja). El nivel exacto de cada rol se ajusta con permisos granulares por módulo, asignados desde el panel de Personal.

## Stack técnico

- **Frontend/Backend**: Next.js 16 (App Router, TypeScript, Tailwind v4, ESLint), `src/` dir.
- **Base de datos / auth / storage**: Supabase.
- **Repo**: GitHub — https://github.com/panfranco18/panaderias.git (rama `main`, todo pusheado).
- **Supabase**: proyecto "panfranco18's Project", ref `wlqgcritlefztwrprboe`. Credenciales en `.env.local` (no versionado).
- **Deploy**: **Netlify** (no Vercel — ver nota abajo) → https://panaderiap-772.netlify.app, sitio `panaderiap-772`, cuenta `panfranco18@outlook.com`. Variables de entorno cargadas (Supabase + Anthropic). Deploy manual vía `netlify deploy --prod --build` (no hay integración automática con GitHub todavía — cada cambio nuevo requiere correr ese comando de nuevo).
- **Puerto local**: 5900 (`npm run dev`).

### Nota sobre el deploy (2026-07-17)

Se intentó deployar en **Vercel** primero, pero la cuenta que el usuario intentó crear (`panfranco18@outlook.com`) quedó bloqueada por la verificación de identidad de Vercel ("Your account requires further verification... complete the account recovery form"). Es un problema de la cuenta en Vercel, no del código — el usuario mandó el reclamo a `registration@vercel.com`. Mientras se resuelve, se desplegó en **Netlify** con la misma cuenta de email, que no tuvo ningún problema. Si en el futuro Vercel se destraba y se prefiere volver, el proyecto no tiene nada específico de Netlify que lo ate (es Next.js estándar) — se podría importar directo a Vercel desde el repo de GitHub.

## Estructura de carpetas

```
C:\panaderiap
├── src/
│   ├── app/
│   │   ├── page.tsx          → home sitio cliente
│   │   ├── login/            → login (dueño / encargados de sucursal)
│   │   └── admin/
│   │       ├── sucursales/
│   │       ├── ventas/
│   │       ├── facturacion/
│   │       └── productos/
│   └── lib/
│       └── supabase/
│           ├── client.ts     → cliente browser
│           └── server.ts     → cliente server (SSR/cookies)
├── supabase/                 → SQL de esquema (a crear)
├── .env.local.example
└── PROGRESS.md               ← este archivo
```

## Estado actual (2026-07-14)

- [x] Carpeta del proyecto creada en `C:\panaderiap`.
- [x] Next.js 16 + TypeScript + Tailwind + ESLint scaffolded.
- [x] `@supabase/supabase-js` y `@supabase/ssr` instalados.
- [x] Clientes de Supabase (browser + server) creados en `src/lib/supabase`.
- [x] Puerto fijo 5900 configurado en `npm run dev`.
- [x] Estructura de carpetas para admin (sucursales, ventas, facturación, productos) creada.
- [x] Proyecto Supabase creado y credenciales cargadas en `.env.local` (URL + anon key + service role key), verificado con curl (auth health 200, REST schema OK).
- [x] Repo GitHub creado por el usuario y conectado como `origin`; primer push hecho a `main` (autenticado con cuenta `panfranco18` vía `gh auth login`, ver `CLAUDE.md`).
- [x] Home del sitio cliente armada (`src/app/page.tsx`) usando el hero provisto por el usuario (`public/heropana.png`, 1717×916): imagen a pantalla completa con enlaces reales superpuestos (botón "Conocé nuestros productos" y las 4 categorías del pie del hero, todos apuntando a `#productos`), fuente Playfair Display para títulos, y dos secciones nuevas reutilizando el formato ícono+texto del hero: "Por qué elegirnos" (ingredientes naturales, horneado diario, recetas tradicionales) y "Nuestros productos" (panes, facturas y dulces, tortas, pedí y retirá) con íconos SVG propios en `src/components/icons.tsx`.
- [x] Esquema SQL completo (`supabase/001_schema.sql`): sucursales, perfiles (empleados+roles), productos, productos_precios_sucursal, proveedores, facturas_proveedor, stock, movimientos_stock, ventas, items_venta, facturas_venta, caja_movimientos, registro_ingreso_personal, pedidos, pedidos_items — con RLS y función helper `rol_actual()`. Verificado aplicado y en funcionamiento en Supabase vía REST.
- [x] Bucket de Storage público `productos` creado para imágenes subidas desde la PC.
- [x] Layout del panel admin rediseñado: sidebar con íconos (Inicio, Productos, Sucursales, Personal, Proveedores, Stock, Pedidos, Caja, Facturación). Módulos sin construir muestran "Próximamente".
- [x] Módulo **Sucursales** funcional: alta (nombre/teléfono/dirección), edición inline, baja, y desplegable que muestra los empleados asignados a cada sucursal (`src/app/admin/sucursales/`).
- [x] Módulo **Personal** funcional: alta de empleados que crea un usuario real en Supabase Auth (email + contraseña temporal generada y mostrada una sola vez) + su perfil (cargo, rol, sucursal, nivel de acceso por módulo vía checkboxes), edición y baja (`src/app/admin/personal/`). Probado de punta a punta.
- [x] Módulo **Productos** funcional: alta con nombre, categoría (Panes/Facturas/Tortas/Sandwiches/Dulces/Otros), descripción, precio base e imagen subida desde la PC al bucket `productos` de Supabase Storage; edición, baja, y panel desplegable "Precios por sucursal" para poner un precio distinto por sucursal (si se deja vacío, usa el precio base) (`src/app/admin/productos/`). Probado de punta a punta, incluida subida de imagen y override de precio.
- [x] `next.config.ts`: dominio de Supabase Storage habilitado en `images.remotePatterns` para que `next/image` muestre las fotos de productos.
- [x] Login real con Supabase Auth (`src/app/login/page.tsx`, `signInWithPassword`) + `src/middleware.ts` que exige sesión válida en cualquier `/admin/*` y redirige a `/login` si no la hay. Botón de cerrar sesión en el sidebar (`src/components/logout-button.tsx`). El menú lateral ahora se arma según el `rol`/`nivel_acceso` real del perfil logueado (superadmin ve todo, el resto solo los módulos habilitados). Probado de punta a punta: bloqueo sin sesión, login, logout.
- [x] **Cuenta superadmin (dueño) creada** para pruebas: email `dueno@panaderiap.local`, contraseña temporal `Panaderiaud4725ta!A1` (cambiarla o reemplazar por la cuenta real del cliente cuando se concrete la venta).
- [x] Módulo **Proveedores** funcional: alta/edición/baja de proveedores (nombre, teléfono, contacto, notas) + carga de facturas de compra (proveedor, sucursal, número, monto, fecha, foto del comprobante) en bucket privado `facturas-proveedores` con URLs firmadas de 1 hora para verlas (`src/app/admin/proveedores/`). Probado de punta a punta.
- [x] Módulo **Stock** funcional: selector de sucursal, listado de productos con cantidad actual, y formulario por producto para registrar movimientos (ingreso suma, egreso resta sin bajar de 0, ajuste fija la cantidad); cada movimiento queda en `movimientos_stock` con el usuario que lo hizo (`src/app/admin/stock/`). Probado de punta a punta (ingreso y egreso).
- [x] Módulo **Pedidos** funcional: alta manual de pedidos (cliente, tipo online/evento, sucursal, fecha de evento, notas), cambio de estado (pendiente → confirmado → preparando → listo → entregado/cancelado) con auto-guardado al cambiar el select, y carga de items (producto + cantidad) que calculan el total automáticamente usando el precio por sucursal si existe, si no el precio base (`src/app/admin/pedidos/`). Probado de punta a punta.
- [x] Módulo **Caja** funcional: selector de sucursal + fecha, registro de movimientos (apertura/ingreso/egreso/cierre) con resumen de totales y saldo calculado (apertura + ingresos − egresos), historial del día con quién lo cargó (`src/app/admin/caja/`). Probado de punta a punta.
- [x] **Sitio cliente: catálogo real + carrito + checkout**. La home (`src/app/page.tsx`) ahora trae productos/precios/sucursales reales de Supabase y los renderiza con `src/components/catalogo.tsx` (agrupados por categoría, con selector de sucursal de retiro que ajusta el precio si hay override). Carrito persistente en `localStorage` vía `src/lib/cart-context.tsx` (Context API), con un widget flotante (`src/components/cart-widget.tsx`, oculto en `/admin` y `/login`). El checkout (`/checkout`) crea el pedido real en `pedidos`/`pedidos_items` usando las políticas RLS públicas ya definidas en el esquema (`pedidos_insert_publico`) — **sin necesidad de service role key**, o sea que ya respeta RLS de verdad a diferencia del panel admin. Probado de punta a punta: agregar al carrito, checkout, y el pedido aparece correctamente en el panel admin de Pedidos.
  - **Bug encontrado y arreglado**: condición de carrera en `cart-context.tsx` — el efecto que hidrata el carrito desde `localStorage` corría *después* del efecto que fija la sucursal por defecto y la pisaba con `null` en la primera visita (localStorage vacío), haciendo que el pedido se guardara sin sucursal. Se corrigió para que la hidratación solo sobreescriba `sucursalId`/`items` si realmente hay algo guardado.
- [x] **Autorización real por rol en el panel admin**. Nuevo helper `src/lib/auth/current-perfil.ts` (`getPerfilActual`, `requireRol`, `requireRolEnSucursal`) que lee la sesión real + el perfil de `perfiles` y bloquea la acción si el rol no alcanza. Aplicado a **todas** las Server Actions de sucursales (superadmin), personal (superadmin), productos (superadmin/encargado), proveedores (superadmin), stock y caja (superadmin/encargado/empleado, acotado a su propia sucursal salvo superadmin) y pedidos (todo el staff). Antes, cualquier usuario logueado —sin importar su rol— podía ejecutar cualquier acción con tal de tener sesión; ahora el servidor la rechaza con "No tenés permiso para hacer esta acción." Probado de punta a punta creando un empleado sin ningún nivel de acceso: el menú le queda vacío y, si igual entra directo a una URL restringida (ej. `/admin/proveedores`) e intenta crear algo, el servidor lo bloquea.
- [x] **Errores visibles en los botones "Eliminar"**. Nuevo componente `src/components/delete-button.tsx` (usa `useActionState`) reemplaza los formularios "fire and forget" en sucursales, personal, productos, proveedores, facturas de proveedor, pedidos, items de pedido y movimientos de caja. Probado forzando un error real (borrar una sucursal con un movimiento de caja asociado): ahora se ve el mensaje de Postgres en pantalla en vez de fallar en silencio.
- [x] Módulo **Facturación diaria** funcional (`src/app/admin/facturacion/`): selector de sucursal+fecha, alta de factura (número, CUIT, método de pago, monto) que además crea automáticamente la venta asociada en la tabla `ventas` (para alimentar el dashboard), total facturado del día, y baja que borra factura + venta juntas. Probado de punta a punta.
- [x] **Dashboard de control en vivo** en la home del panel (`src/app/admin/page.tsx`): tarjeta por sucursal con ventas de hoy, saldo de caja calculado y pedidos pendientes, más el total general de todas las sucursales. Si el que mira no es superadmin, solo ve su propia sucursal. Probado con datos en dos sucursales distintas, los totales agregaron correctamente.
- [x] **Punto de venta (POS) en Caja** — pedido del usuario 2026-07-14: "una caja donde cobrar, con ticket, comanda, escaneo desde el celular". Botón "Vender" en `/admin/caja` lleva a `/admin/caja/vender` (`src/app/admin/caja/vender/`):
  - Buscador de productos + carrito editable (cantidad por ítem, precio según sucursal), método de pago, botón "Cobrar".
  - Server Action `crearVenta` crea en una sola operación: `ventas`, `items_venta` y un movimiento de caja tipo `ingreso` (así el dashboard y el saldo de caja quedan al día automáticamente). Con la misma autorización por rol/sucursal que el resto del panel.
  - **Ticket y comanda imprimibles** (`ticket-view.tsx`): tras cobrar, se puede imprimir un ticket (con precios) o una comanda (solo cantidades y productos, sin precios) usando `window.print()` del navegador — no hay integración con impresoras térmicas ESC/POS directamente, imprime a cualquier impresora que tengas configurada en Windows. El sidebar del panel se oculta al imprimir (clase `.no-print`).
  - **Escaneo de código de barras desde el celular** (`barcode-scanner.tsx`, librería `html5-qrcode`): botón "Escanear código" abre la cámara del dispositivo (funciona igual si abrís el panel desde el celular) y agrega automáticamente el producto al carrito según su código de barras. Requiere que el producto tenga cargado un código de barras.
  - **Código de barras en Productos**: nuevo campo opcional en el alta/edición de productos. Requiere la columna `codigo_barras` en la tabla `productos`, que **todavía no se aplicó** (ver `supabase/002_codigo_barras.sql` — el usuario prefirió seguir pasando el SQL manualmente en vez de darme la contraseña de la base). Mientras tanto, todo el código tiene un *fallback* automático que detecta si la columna no existe y sigue funcionando sin ella (sin el campo de código de barras, sin poder escanear).
  - Probado de punta a punta: alta de venta con 2 productos, ticket generado con los datos correctos, venta + items + movimiento de caja confirmados en la base, y reflejados en el dashboard de control en vivo.
- [x] Migración `supabase/002_codigo_barras.sql` corrida por el usuario en Supabase — columna `codigo_barras` confirmada. Código de barras y escaneo del POS ya operan sin fallback.
- [x] **Carga de ventas por escaneo de planilla en papel** (`/admin/caja/planilla`) — construida y probada de punta a punta, pero **desactivada por decisión del usuario** (2026-07-14: "no voy a cargar crédito"). El código sigue completo:
  - Formato de planilla propuesto (ver sección arriba), foto → `src/app/admin/caja/planilla/actions.ts` la sube al bucket privado `planillas-ventas` y se la manda a Claude (visión, `@anthropic-ai/sdk`) pidiendo JSON `[{producto, cantidad, precioUnitario}]` → `planilla-uploader.tsx` hace auto-match contra `productos` y muestra una tabla editable para revisar antes de confirmar → `confirmarPlanilla` crea `ventas` (`origen = 'escaneo'`) + `items_venta` + ingreso en `caja_movimientos`, igual que el POS.
  - Probado con una key real de Anthropic: la subida de imagen y el manejo de errores funcionan perfecto; el único bloqueo fue que la cuenta de Anthropic no tenía crédito cargado (`"Your credit balance is too low"`). El usuario decidió no cargar crédito, así que **se sacó el botón "Cargar planilla" de la vista** (`src/app/admin/caja/page.tsx`) para no dejar una función rota a la vista. La key quedó en `.env.local` sin usarse — no genera ningún cargo mientras no haya crédito ni se use.
  - Para reactivarlo en el futuro: cargar crédito en console.anthropic.com y volver a agregar el `<Link>` a `/admin/caja/planilla` en `caja/page.tsx` (una línea).
  - Sin esto, la carga de ventas en sucursal se sigue haciendo por el POS ("Vender") a mano, que no tiene costo de API.
- [x] **"Sistema de caja" ampliado** — pedido del usuario 2026-07-16 (estadísticas, quién está trabajando, precio en todas las sucursales, venta por peso, comanda para pedidos). Todo probado de punta a punta:
  - **Fichaje de personal** (`src/app/admin/fichaje/actions.ts`, `src/components/fichaje-widget.tsx`): cualquier empleado/encargado con sucursal asignada ve un botón "Marcar entrada"/"Marcar salida" en el sidebar, que escribe en `registro_ingreso_personal`. El **dashboard** (`/admin`) ahora muestra una tarjeta "Personal presente" por sucursal con quién está fichado en este momento.
  - **Reportes** (`/admin/reportes`, nuevo ítem de menú y en `MODULOS_ACCESO`): selector de sucursal + período (hoy / últimos 7 días / últimos 30 días) con total vendido, cantidad de ventas, ticket promedio, y ranking de productos más vendidos (cantidad y monto), calculado sobre `ventas`/`items_venta`.
  - **Precio en todas las sucursales**: cada tarjeta de producto en `/admin/productos` tiene ahora un campo de precio rápido + botón "Aplicar a todas" (`actualizarPrecioGlobal`) que actualiza `precio_base` **y borra los overrides** de `productos_precios_sucursal`, para que ninguna sucursal quede con un precio viejo por accidente.
  - **Venta por peso** (columna `unidad_medida` en `productos`, migración `supabase/003_unidad_medida.sql` ya corrida por el usuario): cada producto ahora se configura como "unidad", "kg", "gramo" o "docena". El precio se muestra como "$X/kg" y el carrito (POS "Vender", catálogo del sitio cliente, ticket) acepta cantidades fraccionarias (ej. 0.5 kg) y muestra la unidad correspondiente.
  - **Comanda para pedidos**: en `/admin/pedidos`, cada pedido con items tiene un botón "Imprimir comanda" (mismo mecanismo `window.print()` + `.no-print` que el ticket del POS) que imprime cliente, tipo (online/evento), items y notas — útil para encargos como tortas, sea que el pedido haya entrado por la web o se haya cargado a mano en el local.
- [x] **Deploy en producción**: https://panaderiap-772.netlify.app (Netlify, no Vercel — ver nota en Stack técnico). Probado en producción: home con datos reales de Supabase, `/admin` redirige a login sin sesión, login funciona, dashboard y Productos cargan bien. Listo para mostrarle al cliente.
- [x] **Entrega, horario y forma de pago en el carrito** — pedido del usuario 2026-07-17. Migración `supabase/004_entrega_pago.sql` (ya corrida por el usuario): agrega `horario_atencion` y `costo_envio` a `sucursales`; agrega `tipo_entrega`, `direccion_entrega`, `hora_retiro`, `metodo_pago`, `costo_envio` a `pedidos`; crea la tabla `configuracion_negocio` (fila única con alias/titular/CBU de MercadoPago, editable solo por superadmin, lectura pública).
  - **Sucursales** (`/admin/sucursales`): formulario de alta/edición ahora incluye horario de atención (texto libre) y costo de envío a domicilio.
  - **Configuración** (`/admin/configuracion`, nuevo módulo solo visible para superadmin — no tiene checkbox en Personal, así que nunca se le puede dar el permiso a un empleado): carga los datos de MercadoPago que se muestran al cliente cuando elige pagar por esa vía (transferencia manual, sin integración con la API real).
  - **Checkout del sitio cliente** (`/checkout`): elegí retiro en sucursal (ve el horario y puede poner hora aproximada) o envío a domicilio (dirección obligatoria + costo de envío sumado al total en vivo); selector de método de pago (efectivo/transferencia/MercadoPago), con caja de datos de MercadoPago si corresponde; pantalla de confirmación muestra tipo de entrega, dirección u hora, método de pago y total.
  - **Pedidos del admin** (`/admin/pedidos`): tanto los pedidos que llegan del sitio como los cargados a mano por el staff (formulario "Nuevo pedido" ampliado con los mismos campos) muestran el detalle de entrega/pago en la tarjeta. Se corrigió `recalcularTotal` para que, al agregar o quitar items de un pedido con envío, el costo de envío no se pierda del total (antes el total se recalculaba solo a partir de los items).
  - Probado de punta a punta: sucursal con horario/costo de envío guardado, checkout del cliente con envío + MercadoPago (total y confirmación correctos), pedido manual desde el admin con envío + item agregado (total = envío + item, sin perder el envío), datos de prueba borrados al terminar.
- [x] **Home rediseñado: banners de categoría + popup + canasta animada** — pedido del usuario 2026-07-17 ("hacé un banner para separar cada tipo de producto..."). En vez de listar todos los productos en la home, cada categoría (Panes, Facturas, Tortas, etc.) es un banner grande con degradé de color e ícono propio (`src/lib/categoria-visual.ts`: mapea categoría → ícono y degradé). Al hacer click se abre un popup (`src/components/catalogo.tsx`) con los productos de esa categoría.
  - Nuevos íconos en `src/components/icons.tsx`: `IconTongs` (pinza), `IconBasket` (canasta), `IconSandwich`, `IconCandy` (para las categorías Sandwiches y Dulces).
  - En el popup, el botón de agregar es una **pinza de panadería** en vez de "Agregar" — más acorde al rubro.
  - El carrito pasó a llamarse "canasta" en la UI, con ícono de canasta de panadería (`IconBasket`) en vez de bolsa de compras. Al agregar un producto, un ícono de la categoría "vuela" desde la pinza hasta la canasta (animación con `CustomEvent` vía `src/lib/fly-to-cart.ts`, escuchado en `src/components/cart-widget.tsx`). La canasta muestra chips con los íconos de las categorías que contiene (hasta 3) y el badge con la cantidad total, y rebota levemente cuando llega un producto nuevo.
  - `CartItem` (`src/lib/cart-context.tsx`) ahora guarda también la `categoria` del producto para poder mostrar los chips y el ícono correcto en la animación.
  - Probado en el navegador: banners con conteo de productos por categoría, apertura/cierre del popup con click y Escape, agregar productos de dos categorías distintas (chips y total correctos en localStorage), carrito renombrado a "Tu canasta".

## ⚠️ Pendiente de seguridad antes de producción

El middleware exige sesión para entrar a `/admin/*`, el menú se filtra por rol/nivel de acceso, y ahora **las Server Actions también verifican el rol real contra `perfiles` antes de escribir nada** (ver arriba). Sigue pendiente, ya con menor urgencia:
1. Las Server Actions siguen usando la **service role key** para las escrituras en sí (una vez pasado el chequeo de rol) en vez de un cliente con RLS por sesión — funciona porque la autorización ahora se hace a mano en cada acción, pero sería más robusto en el tiempo migrar a RLS real (`src/lib/supabase/server.ts`) para no depender de que cada acción nueva recuerde llamar a `requireRol`.
2. Falta migrar los uploads de Storage (imágenes de productos y facturas de proveedor) a políticas de Storage RLS — hoy también pasan por la service role key.

**Ya está deployado en producción** (https://panaderiap-772.netlify.app) para que el usuario le muestre el sistema al cliente — por ahora solo con la cuenta superadmin de prueba, sin empleados reales ni datos de clientes reales. Antes de que el cliente lo use de verdad con su personal, conviene resolver esto.

## Próximos pasos (siguiente sesión)

1. Migrar las Server Actions del panel admin de la service role key a RLS real, y los uploads de Storage a políticas RLS (ver sección de seguridad) — más urgente ahora que hay una URL pública en producción.
2. Conectar Netlify al repo de GitHub para deploy automático en cada push (hoy es manual con `netlify deploy --prod --build`), o retomar Vercel si el usuario destraba la cuenta.
3. Sitio cliente: agregar página/confirmación con seguimiento del pedido para el cliente (hoy solo ve "pedido recibido", sin poder consultarlo después).
4. (Opcional, solo si el usuario cambia de opinión) Cargar crédito en Anthropic y reactivar "Cargar planilla" en `/admin/caja` — el código ya está listo, ver arriba.
5. ~~Subir estos cambios (entrega/pago/MercadoPago) a GitHub y redeployar a Netlify~~ — hecho 2026-07-17. De paso se corrigió un fallo de build en Netlify: faltaba `@opentelemetry/api` como dependencia (el bundler de Edge Functions no podía resolver ese import opcional de Next.js) y el deploy quedaba a medias por locks de archivos del servidor de desarrollo local corriendo sobre `.next` — ahora hay que acordarse de parar el dev server antes de correr `netlify deploy --prod`.
