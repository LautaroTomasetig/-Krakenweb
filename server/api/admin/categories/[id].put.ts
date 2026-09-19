import { readBody } from "h3";
import { mutateCategory } from "../../../utils/category-store";
import { requireAdmin } from "../../../utils/require-admin";
export default defineEventHandler(async event => { requireAdmin(event); return mutateCategory("update", event.context.params?.id, await readBody(event)); });
