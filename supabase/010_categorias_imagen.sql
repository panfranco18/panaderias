-- Permite subir una imagen por categoría, para mostrarla en el banner
-- de la home en vez del ícono genérico.

alter table public.categorias_config
  add column if not exists imagen_url text;
