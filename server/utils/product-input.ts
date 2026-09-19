import { createError } from "h3";
import type { CatalogProduct } from "../../data/products";
import { productBasePrice } from "../../data/product-pricing";

export function productInput(body: Partial<CatalogProduct> | null, previous?: CatalogProduct) {
  if (!body || typeof body !== "object") throw createError({ statusCode: 400, statusMessage: "Producto inválido" });
  const name = body.name ?? previous?.name;
  const slug = body.slug ?? previous?.slug;
  const categoryId = body.categoryId ?? previous?.categoryId;
  if (typeof name !== "string" || !name.trim() || typeof slug !== "string" || !slug.trim() || slug.includes("/") || typeof categoryId !== "string" || !categoryId) {
    throw createError({ statusCode: 400, statusMessage: "Nombre, slug y categoría son obligatorios" });
  }
  const priceBase = body.priceBase ?? productBasePrice(previous || {});
  const markupPercent = body.markupPercent ?? previous?.markupPercent ?? 0;
  if (typeof priceBase !== "number" || typeof markupPercent !== "number" || !Number.isFinite(priceBase) || !Number.isFinite(markupPercent) || priceBase < 0 || markupPercent < 0 || !Number.isFinite(priceBase * (1 + markupPercent / 100))) {
    throw createError({ statusCode: 400, statusMessage: "El precio base y el porcentaje deben ser números válidos mayores o iguales a cero" });
  }
  const selectedImages = Array.isArray(body.images) ? body.images.filter(image => typeof image === "string" && image).slice(0,4) : previous?.images;
  const images = selectedImages?.length ? selectedImages : [body.image || previous?.image || "/img/moldes.JPG"];
  // Explicit fields: never persist a submitted final price or overwrite legacy prices.
  return { name: name.trim(), slug: slug.trim(), categoryId, priceBase, markupPercent,
    code: body.code ?? previous?.code ?? "", description: body.description ?? previous?.description ?? "",
    technicalDescription: body.technicalDescription ?? previous?.technicalDescription ?? "", images, image: images[0] };
}
