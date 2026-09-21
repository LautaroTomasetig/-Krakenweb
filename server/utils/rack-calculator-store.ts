import { createError } from "h3";
import { doc, getDocFromServer, runTransaction } from "firebase/firestore";
import { normalizeRackCalculator, rackOptionGroups, rackSettingsIssue, rackPriceIssue, settingsForRack, type RackCalculatorConfig, type RackSettings } from "../../data/rack-calculator";
import { categoryForProduct, initialCategories } from "../../data/categories";
import { categoriesRef, rawCategoryProducts } from "./category-store";
import { db } from "./firebase.js";
import type { CatalogProduct } from "../../data/products";

export const rackCalculatorRef = () => doc(db, "site", "rackCalculator");
export async function loadRackCalculator(): Promise<RackCalculatorConfig> {
  const snapshot = await getDocFromServer(rackCalculatorRef());
  return normalizeRackCalculator(snapshot.exists() ? snapshot.data() : null);
}
const invalid = (message = "Revisá las opciones: medidas positivas, IDs y valores sin duplicados, y al menos una opción activa por grupo.") => createError({ statusCode: 400, statusMessage: message });
const record = (value: unknown): value is Record<string, any> => !!value && typeof value === "object" && !Array.isArray(value);
export function validateRackSettings(input: RackSettings): RackSettings {
  if (!record(input) || !record(input.options) || !record(input.defaultOptionIds) || (input.useDefaults !== undefined && typeof input.useDefaults !== "boolean")) throw invalid();
  const options = {} as RackSettings["options"];
  const defaultOptionIds = {} as RackSettings["defaultOptionIds"];
  for (const { key, label } of rackOptionGroups) {
    const items = input.options[key];
    if (!Array.isArray(items) || !items.length || items.length > 100 || !items.some(item => item?.active)) throw invalid();
    if (items.some(item => !item || typeof item.id !== "string" || !item.id || item.id.length > 80 || !Number.isSafeInteger(item.value) || item.value <= 0 || typeof item.active !== "boolean")) throw invalid();
    if (new Set(items.map(item => item.value)).size !== items.length || new Set(items.map(item => item.id)).size !== items.length) throw invalid();
    if (items.some(item => item.priceAdjustment !== null && (typeof item.priceAdjustment !== "number" || !Number.isFinite(item.priceAdjustment)))) throw invalid(label + ": ingresá un ajuste numérico o dejalo pendiente.");
    const initial = input.defaultOptionIds[key];
    if (typeof initial !== "string" || (initial && !items.some(item => item.id === initial && item.active))) throw invalid(label + ": la opción inicial debe existir y estar activa.");
    options[key] = items.map(({ id, value, active, priceAdjustment }) => ({ id, value, active, priceAdjustment }));
    defaultOptionIds[key] = initial;
  }
  return { options, defaultOptionIds, useDefaults: input.useDefaults === true };
}
export function validateRackCalculator(input: RackCalculatorConfig): RackCalculatorConfig {
  if (!input || input.schemaVersion !== 2 || !record(input.overrides)) throw invalid();
  const defaults = validateRackSettings(input.defaults);
  defaults.useDefaults = false;
  const overrides: Record<string, RackSettings> = {};
  for (const [id, settings] of Object.entries(input.overrides)) {
    if (!id || id.includes("/") || ["__proto__", "prototype", "constructor"].includes(id)) throw invalid();
    overrides[id] = validateRackSettings(settings);
  }
  return { schemaVersion: 2, defaults, overrides };
}
export function assertRackPriceValid(product: Partial<CatalogProduct>, settings: RackSettings, name: string) {
  // Drafts remain unavailable publicly. Validate all combinations once prices/defaults are complete.
  if (rackSettingsIssue(settings)) return;
  const issue = rackPriceIssue(product, settings);
  if (issue) throw invalid(name + ": " + issue);
}
function preserveSettings(previous: any, next: RackSettings) {
  return { ...previous, ...next, options: { ...previous?.options, ...Object.fromEntries(rackOptionGroups.map(({ key }) => [key,
    next.options[key].map(option => ({ ...previous?.options?.[key]?.find((old: any) => old.id === option.id), ...option })),
  ])) } };
}
export async function saveRackCalculator(input: RackCalculatorConfig) {
  const config = validateRackCalculator(input);
  return runTransaction(db, async transaction => {
    const ref = rackCalculatorRef();
    const previous = (await transaction.get(ref)).data() || {};
    const categorySnapshot = await transaction.get(categoriesRef());
    const products = await rawCategoryProducts();
    const categories = categorySnapshot.exists() ? categorySnapshot.data().items : initialCategories(products);
    // Preserve legacy fields and omitted overrides; returning to defaults uses a flag.
    const stored = { ...previous, ...config,
      defaults: preserveSettings(previous.defaults, config.defaults),
      overrides: { ...previous.overrides, ...Object.fromEntries(Object.entries(config.overrides).map(([id, settings]) => [id, preserveSettings(previous.overrides?.[id], settings)])) },
    };
    const effective = normalizeRackCalculator(stored);
    for (const product of products) {
      if (categoryForProduct(product, categories)?.isRack) assertRackPriceValid(product, settingsForRack(effective, product), product.name);
    }
    transaction.set(ref, stored);
    return effective;
  });
}
