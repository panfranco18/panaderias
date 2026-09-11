import { TIMEZONE_AR } from "@/lib/fecha-ar";

export type ConfigTurnoCaja = {
  turno_manana_inicio: string;
  turno_manana_fin: string;
  turno_tarde_inicio: string;
  turno_tarde_fin: string;
  habilita_cierre_x: boolean;
};

export const CONFIG_TURNO_CAJA_DEFAULT: ConfigTurnoCaja = {
  turno_manana_inicio: "06:00:00",
  turno_manana_fin: "14:00:00",
  turno_tarde_inicio: "14:00:00",
  turno_tarde_fin: "22:00:00",
  // Sin configurar todavía: por las dudas, arranca sin el botón Cierre X
  // (el superadmin lo habilita a propósito por sucursal en Horarios).
  habilita_cierre_x: false,
};

// Minutos antes del fin del turno mañana en que aparece el aviso de
// "hacé el cierre antes de que termine tu turno".
export const MINUTOS_AVISO_CIERRE_PROXIMO = 15;

export function horaActualAR(): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: TIMEZONE_AR,
    hour12: false,
  });
}

// Qué botón de cierre le corresponde al personal ahora mismo. El Cierre X
// se mantiene aunque ya haya pasado el horario de fin del turno mañana —
// no pasa a Z hasta que la empleada efectivamente haga el cierre X hoy.
export function botonCierreParaAhora(
  config: ConfigTurnoCaja,
  cierreXHechoHoy: boolean
): "x" | "z" {
  if (!config.habilita_cierre_x || cierreXHechoHoy) return "z";

  const hora = horaActualAR();
  if (hora < config.turno_manana_inicio) return "z";
  return "x";
}

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// Si hay que mostrarle a la empleada el aviso de "hacé el cierre antes de
// que termine tu turno" — desde MINUTOS_AVISO_CIERRE_PROXIMO antes del fin
// del turno mañana, y mientras no haya hecho el cierre X todavía.
export function debeAvisarCierreProximo(
  config: ConfigTurnoCaja,
  cierreXHechoHoy: boolean
): boolean {
  if (!config.habilita_cierre_x || cierreXHechoHoy) return false;

  const minutosAhora = horaAMinutos(horaActualAR());
  const minutosInicio = horaAMinutos(config.turno_manana_inicio);
  const minutosFin = horaAMinutos(config.turno_manana_fin);
  const minutosAviso = minutosFin - MINUTOS_AVISO_CIERRE_PROXIMO;

  return minutosAhora >= minutosAviso && minutosAhora >= minutosInicio;
}
