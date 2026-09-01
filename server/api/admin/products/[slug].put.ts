import { createError, readBody } from "h3";
import { products, type CatalogProduct } from "../../../../data/products";
import { requireAdmin } from "../../../utils/require-admin";
import { loadProducts, persistProducts } from "../../../utils/product-store";
import { DEFAULT_PRODUCT_IMAGE } from "../../../utils/product-store";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  await loadProducts();
  const index = products.findIndex((product) => product.slug === event.context.params?.slug);
  if (index < 0) throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  const body = await readBody<Partial<CatalogProduct>>(event);
  if (body.slug && body.slug !== event.context.params?.slug && products.some((product) => product.slug === body.slug)) throw createError({ statusCode: 409, statusMessage: "El slug ya existe" });
  const priceFrom = body.priceFrom ?? products[index].priceFrom;
  const priceTo = body.priceTo ?? products[index].priceTo;
  if (priceFrom < 0 || priceTo < priceFrom) throw createError({ statusCode: 400, statusMessage: "Precios inválidos" });
  products[index] = { ...products[index], ...body, category: body.category ? normalizeCategory(String(body.category)) : products[index].category, price: body.priceFrom ?? products[index].price, image: DEFAULT_PRODUCT_IMAGE, images: [DEFAULT_PRODUCT_IMAGE], icon: products[index].icon };
  await persistProducts();
  return products[index];
});

function normalizeCategory(category: string) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalized === "racks metalicos" ? "Racks metálicos" : normalized === "estanterias metalicas" ? "Estanterías metálicas" : normalized === "gondolas" ? "Góndolas" : "Soluciones especiales";
}
