import { createError, readBody } from "h3";
import { requireAdmin } from "../../utils/require-admin";
import { createProduct, loadProducts } from "../../utils/product-store";
import { productInput } from "../../utils/product-input";

export default defineEventHandler(async event => {
  requireAdmin(event);
  const product = productInput(await readBody(event));
  const products = await loadProducts();
  if (products.some(item => item.slug === product.slug)) throw createError({ statusCode: 409, statusMessage: "El slug ya existe" });
  return createProduct(product);
});
