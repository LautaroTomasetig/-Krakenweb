import { createError, readBody } from "h3";
import { requireAdmin } from "../../utils/require-admin";
import { createProduct, loadProducts } from "../../utils/product-store";
import { productInput } from "../../utils/product-input";
import { loadCategories } from "../../utils/category-store";

export default defineEventHandler(async event => {
  requireAdmin(event);
  const body = await readBody(event);
  const categories = await loadCategories();
  const product = productInput(body, undefined, categories.find(category => category.id === body?.categoryId)?.isRack === true);
  const products = await loadProducts();
  if (products.some(item => item.slug === product.slug)) throw createError({ statusCode: 409, statusMessage: "El slug ya existe" });
  return createProduct(product);
});
