import { createError } from "h3";
import { doc, getDocFromServer, setDoc } from "firebase/firestore";
import { defaultRackCalculator, rackOptionGroups, type RackCalculatorConfig, type RackSettings } from "../../data/rack-calculator";
import { db } from "./firebase.js";

const ref = () => doc(db, "site", "rackCalculator");
export async function loadRackCalculator(): Promise<RackCalculatorConfig> {
  const snapshot = await getDocFromServer(ref());
  return snapshot.exists() ? snapshot.data() as RackCalculatorConfig : defaultRackCalculator();
}
const positive = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;
const invalid = () => createError({ statusCode: 400, statusMessage: "Revisá la configuración: usá valores positivos, sin duplicados, y dejá al menos una opción activa por grupo." });
export function validateRackSettings(input: RackSettings): RackSettings {
  if (!input || !input.options || !input.reference || !positive(input.minimumFactor) || input.minimumFactor > 1 || !positive(input.minimumLoadFactor) || input.minimumLoadFactor > 1) throw invalid();
  const options = {} as RackSettings["options"];
  for (const { key, reference } of rackOptionGroups) {
    const items = input.options[key];
    if (!Array.isArray(items) || !items.length || items.length > 100 || !items.some(item => item?.active)) throw invalid();
    if (items.some(item => !item || typeof item.id !== "string" || !item.id || item.id.length > 80 || !positive(item.value) || !Number.isSafeInteger(item.value) || typeof item.active !== "boolean")) throw invalid();
    if (new Set(items.map(item => item.value)).size !== items.length || new Set(items.map(item => item.id)).size !== items.length) throw invalid();
    if (!positive(input.reference[reference]) || !Number.isSafeInteger(input.reference[reference])) throw invalid();
    options[key] = items.map(({ id, value, active }) => ({ id, value, active }));
  }
  const { width, height, depth, levels, load } = input.reference;
  return { options, reference: { width, height, depth, levels, load }, minimumFactor: input.minimumFactor, minimumLoadFactor: input.minimumLoadFactor };
}
export function validateRackCalculator(input: RackCalculatorConfig): RackCalculatorConfig {
  if (!input || typeof input.markupPercent !== "number" || !Number.isFinite(input.markupPercent) || input.markupPercent < 0 || !input.overrides || typeof input.overrides !== "object" || Array.isArray(input.overrides)) throw invalid();
  const defaults = validateRackSettings(input.defaults);
  const overrides: Record<string, RackSettings> = {};
  for (const [id, settings] of Object.entries(input.overrides)) {
    if (!id || id.includes("/") || ["__proto__", "prototype", "constructor"].includes(id)) throw invalid();
    overrides[id] = validateRackSettings(settings);
  }
  return { defaults, overrides, markupPercent: input.markupPercent };
}
export async function saveRackCalculator(input: RackCalculatorConfig) {
  const config = validateRackCalculator(input);
  // Replace only this configuration document, never product data or site/gallery.
  await setDoc(ref(), config);
  return config;
}
