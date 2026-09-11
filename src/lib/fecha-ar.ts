// El servidor (Netlify) corre en UTC, pero el negocio es en Argentina.
// Todo cálculo de "hoy" y todo formateo de hora/fecha visible para el
// personal tiene que anclarse a este timezone explícitamente — si no,
// toLocaleTimeString/toLocaleDateString usan el reloj del runtime (UTC)
// aunque se les pase el locale "es-AR", y la hora que muestran queda mal.

export const TIMEZONE_AR = "America/Argentina/Buenos_Aires";

// Fecha de "hoy" en Argentina, como YYYY-MM-DD (la Argentina no tiene
// horario de verano desde 2009: siempre UTC-3, así que este truco con el
// locale en-CA — que formatea como YYYY-MM-DD — es seguro).
export function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE_AR });
}

// Rango [inicio, fin) de un día calendario argentino, como instantes UTC
// reales — sirve para comparar contra columnas timestamptz con .gte/.lt.
export function rangoDiaAR(fechaYMD: string) {
  const inicio = new Date(`${fechaYMD}T00:00:00-03:00`);
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}

export function formatHoraAR(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE_AR,
  });
}

export function formatFechaAR(
  iso: string,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Date(iso).toLocaleDateString("es-AR", {
    timeZone: TIMEZONE_AR,
    ...opts,
  });
}

export function formatFechaHoraAR(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { timeZone: TIMEZONE_AR });
}
