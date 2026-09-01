import { loadProducts } from "../utils/product-store";

export default defineNitroPlugin(async () => {
  await loadProducts();
});
