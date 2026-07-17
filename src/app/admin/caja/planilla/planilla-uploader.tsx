"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  analizarPlanilla,
  confirmarPlanilla,
  type FilaPlanilla,
} from "./actions";

type Producto = { id: string; nombre: string; precio_base: number };

type FilaEditable = FilaPlanilla & { productoId: string };

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function mejorMatch(nombreOcr: string, productos: Producto[]): string {
  const objetivo = normalizar(nombreOcr);
  const exacto = productos.find((p) => normalizar(p.nombre) === objetivo);
  if (exacto) return exacto.id;
  const parcial = productos.find(
    (p) =>
      normalizar(p.nombre).includes(objetivo) ||
      objetivo.includes(normalizar(p.nombre))
  );
  return parcial?.id ?? "";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PlanillaUploader({
  sucursales,
  sucursalIdInicial,
  productos,
}: {
  sucursales: { id: string; nombre: string }[];
  sucursalIdInicial: string;
  productos: Producto[];
}) {
  const router = useRouter();
  const [sucursalId, setSucursalId] = useState(sucursalIdInicial);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenPath, setImagenPath] = useState<string | null>(null);
  const [filas, setFilas] = useState<FilaEditable[] | null>(null);
  const [guardado, setGuardado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function analizar(file: File) {
    setAnalizando(true);
    setError(null);
    setFilas(null);

    const base64 = await fileToBase64(file);
    const result = await analizarPlanilla({
      sucursalId,
      imagenBase64: base64,
      mimeType: file.type,
    });

    setAnalizando(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setImagenPath(result.imagenPath);
    setFilas(
      result.filas.map((f) => ({
        ...f,
        productoId: mejorMatch(f.producto, productos),
      }))
    );
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    analizar(file);
  }

  function actualizarFila(index: number, cambios: Partial<FilaEditable>) {
    setFilas((prev) =>
      prev ? prev.map((f, i) => (i === index ? { ...f, ...cambios } : f)) : prev
    );
  }

  function quitarFila(index: number) {
    setFilas((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  async function guardar() {
    if (!filas) return;
    const validas = filas.filter((f) => f.productoId && f.cantidad > 0);
    if (validas.length === 0) {
      setError("Asigná un producto y una cantidad válida a al menos una fila");
      return;
    }

    setGuardando(true);
    setError(null);

    const result = await confirmarPlanilla({
      sucursalId,
      imagenPath,
      items: validas.map((f) => ({
        productoId: f.productoId,
        cantidad: f.cantidad,
        precioUnitario: f.precioUnitario,
      })),
    });

    setGuardando(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setGuardado(true);
  }

  function nuevaCarga() {
    setPreviewUrl(null);
    setFilas(null);
    setImagenPath(null);
    setGuardado(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (guardado) {
    return (
      <div className="mt-6 max-w-md rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <p className="font-medium text-green-800 dark:text-green-200">
          Venta cargada correctamente a partir de la planilla.
        </p>
        <button
          onClick={nuevaCarga}
          className="mt-3 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Cargar otra planilla
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-2xl">
      <select
        value={sucursalId}
        onChange={(e) => {
          setSucursalId(e.target.value);
          router.push(`/admin/caja/planilla?sucursal=${e.target.value}`);
        }}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>

      <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="mx-auto text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-amber-800 dark:text-zinc-400 dark:file:bg-amber-900/40 dark:file:text-amber-200"
        />
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Planilla"
            className="mx-auto mt-4 max-h-64 rounded-md object-contain"
          />
        )}
        {analizando && (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Leyendo la planilla...
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {filas && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Revisá antes de confirmar
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {filas.map((f, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800"
              >
                <span className="w-32 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {f.producto || "(sin leer)"}
                </span>
                <select
                  value={f.productoId}
                  onChange={(e) =>
                    actualizarFila(i, { productoId: e.target.value })
                  }
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Elegir producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={f.cantidad}
                  onChange={(e) =>
                    actualizarFila(i, { cantidad: Number(e.target.value) })
                  }
                  className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder="Cant."
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={f.precioUnitario}
                  onChange={(e) =>
                    actualizarFila(i, {
                      precioUnitario: Number(e.target.value),
                    })
                  }
                  className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder="Precio"
                />
                <button
                  onClick={() => quitarFila(i)}
                  className="ml-auto text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={guardar}
            disabled={guardando}
            className="mt-4 w-full rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Confirmar y guardar venta"}
          </button>
        </div>
      )}
    </div>
  );
}
