"use client";

import { useEffect, useRef, useState } from "react";

const ELEMENT_ID = "barcode-scanner-region";

export function BarcodeScannerButton({
  onDetected,
}: {
  onDetected: (codigo: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!abierto) return;

    let cancelado = false;

    import("html5-qrcode").then(({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
      if (cancelado) return;

      const scanner = new Html5Qrcode(ELEMENT_ID, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            onDetected(decodedText);
            setAbierto(false);
          },
          () => {}
        )
        .catch(() => {
          setError(
            "No se pudo acceder a la cámara. Revisá los permisos del navegador."
          );
        });
    });

    return () => {
      cancelado = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [abierto, onDetected]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setAbierto(true);
        }}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Escanear código
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Escanear código de barras
              </p>
              <button
                onClick={() => setAbierto(false)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div id={ELEMENT_ID} className="mt-3 overflow-hidden rounded-md" />
            {error ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Apuntá la cámara del celular al código de barras del producto.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
