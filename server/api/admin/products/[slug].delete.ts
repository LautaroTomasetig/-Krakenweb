import { createError } from "h3";
import { products } from "../../../../data/products";
import { requireAdmin } from "../../../utils/require-admin";
import { loadProducts, persistProducts } from "../../../utils/product-store";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  await loadProducts();
  const index = products.findIndex((product) => product.slug === event.context.params?.slug);
  if (index < 0) throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  products.splice(index, 1);
  await persistProducts();
  return { deleted: true };
});
