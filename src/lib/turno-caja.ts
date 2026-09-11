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

function horaActualAR(): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: TIMEZONE_AR,
    hour12: false,
  });
}

// Qué botón de cierre le corresponde al personal ahora mismo, según la
// hora actual (Argentina) y la configuración de turnos de esa sucursal.
export function botonCierreParaAhora(config: ConfigTurnoCaja): "x" | "z" {
  const hora = horaActualAR();
  const enTurnoManana =
    hora >= config.turno_manana_inicio && hora < config.turno_manana_fin;

  if (enTurnoManana && config.habilita_cierre_x) return "x";
  return "z";
}
