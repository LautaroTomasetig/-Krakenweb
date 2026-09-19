import { loadCategories } from "../../utils/category-store";
import { requireAdmin } from "../../utils/require-admin";
export default defineEventHandler(event => { requireAdmin(event); return loadCategories(); });
