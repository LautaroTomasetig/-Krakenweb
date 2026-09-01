import { loadProducts } from "../utils/product-store";

export default defineEventHandler(async () => {
  const catalog = await loadProducts();
  return catalog.map(({ icon, ...product }) => product);
});
