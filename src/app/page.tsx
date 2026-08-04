import Image from "next/image";
import Link from "next/link";
import {
  IconWheat,
  IconOven,
  IconHeart,
  IconBread,
  IconCupcake,
  IconCake,
  IconTruck,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { Catalogo } from "@/components/catalogo";

const porQueElegirnos = [
  {
    icon: IconWheat,
    title: "Ingredientes naturales",
    text: "Seleccionamos harinas, levaduras y rellenos de calidad, sin atajos.",
  },
  {
    icon: IconOven,
    title: "Horneado todos los días",
    text: "Todo sale del horno el mismo día — nada de stock de días anteriores.",
  },
  {
    icon: IconHeart,
    title: "Recetas tradicionales",
    text: "Las mismas recetas de siempre, hechas a mano en cada sucursal.",
  },
];

const categorias = [
  {
    icon: IconBread,
    title: "Panes artesanales",
    text: "Baguettes, campo, integral y de semillas, recién horneados.",
  },
  {
    icon: IconCupcake,
    title: "Facturas y dulces",
    text: "Medialunas, vigilantes y facturas rellenas para cualquier hora.",
  },
  {
    icon: IconCake,
    title: "Tortas y especiales",
    text: "Tortas por encargo para cumpleaños y ocasiones especiales.",
  },
  {
    icon: IconTruck,
    title: "Pedí y retirá",
    text: "Hacé tu pedido online y retiralo en la sucursal que elijas.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  const [{ data: productos }, { data: precios }, { data: sucursales }, { data: categoriasConfig }] =
    await Promise.all([
      supabase
        .from("productos")
        .select("id, nombre, categoria, descripcion, imagen_url, precio_base, unidad_medida")
        .eq("activo", true)
        .order("nombre"),
      supabase.from("productos_precios_sucursal").select("*"),
      supabase
        .from("sucursales")
        .select("id, nombre")
        .eq("activa", true)
        .order("nombre"),
      supabase.from("categorias_config").select("categoria, visible_web, imagen_url"),
    ]);

  const categoriasOcultas = new Set(
    (categoriasConfig ?? []).filter((c) => !c.visible_web).map((c) => c.categoria)
  );
  const productosVisibles = (productos ?? []).filter(
    (p) => !categoriasOcultas.has(p.categoria)
  );
  const imagenPorCategoria: Record<string, string | null> = {};
  for (const c of categoriasConfig ?? []) {
    imagenPorCategoria[c.categoria] = c.imagen_url;
  }

  return (
    <div className="flex-1">
      <section className="relative w-full" style={{ aspectRatio: "1717 / 916" }}>
        <Image
          src="/heropana.png"
          alt="Panadería artesanal — panes, facturas y dulces recién horneados"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <h1 className="sr-only">El aroma que te abraza</h1>
        <p className="sr-only">
          Cada pan, cada factura, cada detalle hecho con amor para endulzar
          tus días.
        </p>

        <Link
          href="#productos"
          aria-label="Conocé nuestros productos"
          className="absolute rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          style={{ left: "4.4%", top: "72.5%", width: "22%", height: "6.5%" }}
        />

        <div
          className="absolute flex"
          style={{ left: "0%", top: "89%", width: "100%", height: "11%" }}
        >
          {categorias.map((c) => (
            <Link
              key={c.title}
              href="#productos"
              aria-label={c.title}
              className="flex-1 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          ))}
        </div>
      </section>

      <section className="bg-[#f5ead9] px-6 py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-[family-name:var(--font-playfair)] text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Por qué elegirnos
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {porQueElegirnos.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto h-10 w-10 text-amber-600" />
                <h3 className="mt-4 text-sm font-bold tracking-wide text-zinc-800 uppercase dark:text-zinc-100">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="productos" className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-[family-name:var(--font-playfair)] text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Nuestros productos
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-zinc-600 dark:text-zinc-400">
            Elegí tu sucursal y armá tu pedido.
          </p>
          <div className="mt-10">
            <Catalogo
              productos={productosVisibles}
              precios={precios ?? []}
              sucursales={sucursales ?? []}
              imagenPorCategoria={imagenPorCategoria}
            />
          </div>
        </div>
      </section>

      <footer className="bg-[#1b140f] px-6 py-10 text-center text-sm text-amber-100/70">
        Panadería — sitio en construcción.
      </footer>
    </div>
  );
}
