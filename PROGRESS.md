# Panadería (sin nombre todavía) — Progreso del proyecto

> Este archivo se actualiza en cada sesión con lo que se hizo y lo que falta. Es la fuente de verdad del proyecto.

## Visión general

Sistema para una panadería con múltiples sucursales, propiedad de un solo dueño. Tiene dos frentes:

1. **Sitio web cliente**: catálogo de productos, compra online.
2. **Panel admin**: control del dueño sobre todas las sucursales.

Si sale la venta del sistema, se le pone el nombre real de la panadería (por ahora el repo/carpeta se llama `panaderiap`).

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

## Stack técnico

- **Frontend/Backend**: Next.js 16 (App Router, TypeScript, Tailwind v4, ESLint), `src/` dir.
- **Base de datos / auth / storage**: Supabase.
- **Repo**: GitHub (pendiente de crear).
- **Deploy**: Vercel (pendiente, se prueba primero en localhost).
- **Puerto local**: 5900 (`npm run dev`).

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
- [ ] Proyecto Supabase creado (falta URL + anon key + service role key en `.env.local`).
- [ ] Esquema SQL: sucursales, productos, ventas, facturas, usuarios/roles.
- [ ] Definir formato de planilla en papel para el escaneo de ventas.
- [ ] Auth (roles: dueño vs encargado de sucursal).
- [ ] Sitio cliente: catálogo + carrito + checkout.
- [ ] Panel admin: CRUD sucursales/productos.
- [ ] Panel admin: carga de ventas (manual + escaneo/OCR).
- [ ] Panel admin: facturación.
- [ ] Panel admin: dashboard "control en vivo" por sucursal.
- [ ] Repo en GitHub.
- [ ] Deploy en Vercel (cuando esté listo para salir de localhost).

## Próximos pasos (siguiente sesión)

1. Crear proyecto en Supabase y cargar credenciales en `.env.local`.
2. Diseñar el esquema de base de datos (sucursales, productos, ventas, items_venta, facturas, usuarios).
3. Definir con el usuario el formato de la planilla de ventas en papel antes de encarar el OCR.
4. Armar auth básico con roles (dueño / encargado de sucursal).
