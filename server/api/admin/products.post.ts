import { createError, readBody } from "h3";
import { Box } from "lucide-vue-next";
import { products, type CatalogProduct } from "../../../data/products";
import { requireAdmin } from "../../utils/require-admin";
import { loadProducts, persistProducts } from "../../utils/product-store";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/product-store";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  await loadProducts();
  const body = await readBody<Partial<CatalogProduct>>(event);
  if (!body?.name || !body.slug || !body.category) throw createError({ statusCode: 400, statusMessage: "Nombre, slug y categoría son obligatorios" });
  if (products.some((product) => product.slug === body.slug)) throw createError({ statusCode: 409, statusMessage: "El slug ya existe" });
  const priceFrom = Number(body.priceFrom || 0);
  const priceTo = Number(body.priceTo ?? priceFrom);
  const category = normalizeCategory(String(body.category));
  if (priceFrom < 0 || priceTo < priceFrom) throw createError({ statusCode: 400, statusMessage: "Precios inválidos" });
  const product = { ...body, category, price: priceFrom, priceFrom, priceTo, image: DEFAULT_PRODUCT_IMAGE, images: [DEFAULT_PRODUCT_IMAGE], icon: products[0]?.icon || Box } as CatalogProduct;
  products.push(product);
  await persistProducts();
  return product;
});

function normalizeCategory(category: string) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalized === "racks metalicos" ? "Racks metálicos" : normalized === "estanterias metalicas" ? "Estanterías metálicas" : normalized === "gondolas" ? "Góndolas" : "Soluciones especiales";
}
