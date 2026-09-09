import { createError, readBody } from "h3";
import type { CatalogProduct } from "../../../../data/products";
import { requireAdmin } from "../../../utils/require-admin";
import { loadProducts, updateProduct } from "../../../utils/product-store";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const products = await loadProducts();
  const index = products.findIndex((product) => product.id === event.context.params?.slug);
  if (index < 0) throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  const body = await readBody<Partial<CatalogProduct>>(event);
  if (body.slug && body.slug !== products[index].slug && products.some((product) => product.slug === body.slug)) throw createError({ statusCode: 409, statusMessage: "El slug ya existe" });
  const priceFrom = body.priceFrom ?? products[index].priceFrom;
  const priceTo = body.priceTo ?? products[index].priceTo;
  if (priceFrom < 0 || priceTo < priceFrom) throw createError({ statusCode: 400, statusMessage: "Precios inválidos" });
  const id = event.context.params?.slug!;
  const selectedImages = body.images?.filter(Boolean).slice(0, 4);
  const images = selectedImages?.length ? selectedImages : products[index].images;
  const category = body.category ? normalizeCategory(String(body.category)) : products[index].category;
  products[index] = { ...products[index], ...body, category, price: body.priceFrom ?? products[index].price, image: body.image || images[0] || products[index].image, images, rackConfig: isRackCategory(category) ? body.rackConfig || products[index].rackConfig || DEFAULT_RACK_CONFIG : undefined, icon: products[index].icon };
  if (!isRackCategory(category)) delete products[index].rackConfig;
  return await updateProduct(id, products[index]);
});

function normalizeCategory(category: string) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return normalized === "racks metalicos" ? "Racks metálicos" : normalized === "estanterias metalicas" ? "Estanterías metálicas" : normalized === "gondolas" ? "Góndolas" : "Soluciones especiales";
}

const DEFAULT_RACK_CONFIG = { width: 2000, height: 2000, depth: 1000, levels: 3 };
function isRackCategory(category: string) {
  return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() === "racks metalicos";
}
