import { loadRackCalculator } from "../../utils/rack-calculator-store";
import { requireAdmin } from "../../utils/require-admin";
export default defineEventHandler(event => { requireAdmin(event); return loadRackCalculator(); });
