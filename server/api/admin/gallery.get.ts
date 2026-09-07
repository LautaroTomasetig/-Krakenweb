import { loadGallery } from "../../utils/gallery-store";
import { requireAdmin } from "../../utils/require-admin";
export default defineEventHandler(event => { requireAdmin(event); return loadGallery(); });
