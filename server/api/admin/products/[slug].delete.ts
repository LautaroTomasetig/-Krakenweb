import { requireAdmin } from "../../../utils/require-admin";
import { removeProduct } from "../../../utils/product-store";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  await removeProduct(event.context.params?.slug!);
  return { deleted: true };
});
