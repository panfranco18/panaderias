import Image from "next/image";
import { iconoDeCategoria, gradienteDeCategoria } from "@/lib/categoria-visual";

export function CategoriaBanner({
  categoria,
  cantidad,
  imagenUrl,
  onClick,
}: {
  categoria: string;
  cantidad: number;
  imagenUrl?: string | null;
  onClick: () => void;
}) {
  const Icon = iconoDeCategoria(categoria);
  const gradiente = gradienteDeCategoria(categoria);

  return (
    <button
      onClick={onClick}
      className="group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl text-center text-white shadow-md transition-transform hover:scale-[1.03] hover:shadow-xl"
    >
      {imagenUrl ? (
        <>
          <Image
            src={imagenUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 45vw, 220px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradiente}`} />
      )}
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      {!imagenUrl && <Icon className="relative h-10 w-10 drop-shadow-sm" />}
      <span className="relative text-sm font-bold drop-shadow">{categoria}</span>
      <span className="relative text-xs text-white/90 drop-shadow">
        {cantidad} producto{cantidad === 1 ? "" : "s"}
      </span>
    </button>
  );
}
