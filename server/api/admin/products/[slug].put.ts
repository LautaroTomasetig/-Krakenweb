import { createError, readBody } from "h3";
import { requireAdmin } from "../../../utils/require-admin";
import { loadProducts, updateProduct } from "../../../utils/product-store";
import { productInput } from "../../../utils/product-input";

export default defineEventHandler(async event => {
  requireAdmin(event);
  const id = event.context.params?.slug;
  const products = await loadProducts();
  const previous = products.find(item => item.id === id);
  if (!previous || !id) throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  const product = productInput(await readBody(event), previous);
  if (products.some(item => item.id !== id && item.slug === product.slug)) throw createError({ statusCode: 409, statusMessage: "El slug ya existe" });
  return updateProduct(id, product);
});
