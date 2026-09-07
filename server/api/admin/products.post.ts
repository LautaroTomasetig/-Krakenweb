import { createError, readBody } from "h3";
import { Box } from "lucide-vue-next";
import { products, type CatalogProduct } from "../../../data/products";
import { requireAdmin } from "../../utils/require-admin";
import { createProduct, DEFAULT_PRODUCT_IMAGE, loadProducts } from "../../utils/product-store";

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
  const selectedImages = body.images?.filter(Boolean).slice(0, 4);
  const images = selectedImages?.length ? selectedImages : (body.image ? [body.image] : [DEFAULT_PRODUCT_IMAGE]);
  const product = { ...body, category, price: priceFrom, priceFrom, priceTo, image: body.image || images[0], images, rackConfig: isRackCategory(category) ? body.rackConfig || DEFAULT_RACK_CONFIG : undefined, icon: products[0]?.icon || Box } as CatalogProduct;
  if (!isRackCategory(category)) delete product.rackConfig;
  products.push(product);
  await createProduct(product);
  return product;
});

function normalizeCategory(category: string) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return normalized === "racks metalicos" ? "Racks metálicos" : normalized === "estanterias metalicas" ? "Estanterías metálicas" : normalized === "gondolas" ? "Góndolas" : "Soluciones especiales";
}

const DEFAULT_RACK_CONFIG = { width: 2000, height: 2000, depth: 1000, levels: 3 };
function isRackCategory(category: string) {
  return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() === "racks metalicos";
}
