import { loadProducts } from "../../utils/product-store";
import { requireAdmin } from "../../utils/require-admin";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  return await loadProducts();
});
