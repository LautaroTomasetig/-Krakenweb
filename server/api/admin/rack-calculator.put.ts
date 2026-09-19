import { readBody } from "h3";
import { saveRackCalculator } from "../../utils/rack-calculator-store";
import { requireAdmin } from "../../utils/require-admin";
export default defineEventHandler(async event => { requireAdmin(event); return saveRackCalculator(await readBody(event)); });
