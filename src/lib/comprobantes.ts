export type TipoComprobante = "factura_a" | "factura_b" | "remito" | "presupuesto";

export const TIPO_COMPROBANTE_LABEL: Record<TipoComprobante, string> = {
  factura_a: "Factura A",
  factura_b: "Factura B",
  remito: "Remito",
  presupuesto: "Presupuesto",
};

export const TIPO_COMPROBANTE_DESCRIPCION: Record<TipoComprobante, string> = {
  factura_a: "Discrimina IVA. Para clientes Responsables Inscriptos, con CUIT.",
  factura_b: "Precio final, sin discriminar IVA. Para consumidor final o monotributista.",
  remito: "Detalle de la mercadería entregada, sin valor fiscal.",
  presupuesto: "Cotización para el cliente, no es una venta todavía.",
};

export const CONDICION_IVA_LABEL: Record<string, string> = {
  responsable_inscripto: "Responsable Inscripto",
  monotributo: "Monotributista",
  exento: "Exento",
};

export function esTipoComprobante(valor: string): valor is TipoComprobante {
  return valor === "factura_a" || valor === "factura_b" || valor === "remito" || valor === "presupuesto";
}

// Formato estándar argentino: "0001-00000123"
export function formatNumeroComprobante(puntoVenta: string, numero: number) {
  return `${puntoVenta.padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

// Factura A: se asume que los precios cargados son finales (IVA incluido),
// como se venden en el mostrador, y se discrimina "para atrás". No se
// clasifica el IVA por producto (habría que categorizar cada uno de los
// más de 2.600 productos con su alícuota real) — se aplica un único
// porcentaje sobre el total, editable en el comprobante.
export function calcularIva(total: number, porcentajeIva: number) {
  const neto = total / (1 + porcentajeIva / 100);
  const iva = total - neto;
  return { subtotal: Math.round(neto * 100) / 100, iva: Math.round(iva * 100) / 100 };
}
