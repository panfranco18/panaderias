export const METODO_PAGO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  posnet: "Posnet",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
};

export function labelMetodoPago(metodo: string | null) {
  if (!metodo) return "Sin especificar";
  return METODO_PAGO_LABEL[metodo] ?? metodo;
}
