import type { CatalogProduct } from "./products";
import { productFinalPrice } from "./product-pricing";

export const rackOptionGroups = [
  { key: "heights", label: "Alto", unit: "mm" },
  { key: "widths", label: "Largo", unit: "mm" },
  { key: "depths", label: "Profundidad", unit: "mm" },
  { key: "levels", label: "Niveles", unit: "niveles" },
  { key: "loads", label: "Resistencia por nivel", unit: "kg" },
] as const;
export type RackOptionKey = typeof rackOptionGroups[number]["key"];
export type RackOption = { id: string; value: number; active: boolean; priceAdjustment: number | null };
export type RackSelection = Record<RackOptionKey, string>;
export type RackSettings = {
  options: Record<RackOptionKey, RackOption[]>;
  defaultOptionIds: RackSelection;
  useDefaults?: boolean;
};
export type RackCalculatorConfig = { schemaVersion: 2; defaults: RackSettings; overrides: Record<string, RackSettings> };
export type RackQuote = { ready: false; reason: string } | {
  ready: true; price: number; selectedOptions: Record<RackOptionKey, RackOption>;
};
export const emptyRackSelection = (): RackSelection => ({ heights: "", widths: "", depths: "", levels: "", loads: "" });
const options = (values: number[]): RackOption[] => values.map(value => ({ id: String(value), value, active: true, priceAdjustment: null }));
export function defaultRackCalculator(): RackCalculatorConfig {
  return { schemaVersion: 2, defaults: {
    options: { widths: options([1200,1500,1800,2000,2400,2700,3000]), heights: options([1200,1500,1800,2000,2400,3000,3600,4500]), depths: options([600,800,1000,1100,1200]), levels: options([2,3,4,5,6,8]), loads: options([200,400,600,800,1000,1200]) },
    defaultOptionIds: emptyRackSelection(),
  }, overrides: {} };
}

// Read-only adaptation: legacy options remain editable, with unknown prices.
// References and percentages never supply an adjustment or an initial selection.
export function normalizeRackCalculator(input: any): RackCalculatorConfig {
  if (!input) return defaultRackCalculator();
  const normalize = (settings: any): RackSettings => ({
    options: Object.fromEntries(rackOptionGroups.map(({ key }) => [key,
      (Array.isArray(settings?.options?.[key]) ? settings.options[key] : []).map((option: any) => ({
        id: option?.id, value: option?.value, active: option?.active,
        priceAdjustment: typeof option?.priceAdjustment === "number" && Number.isFinite(option.priceAdjustment) ? option.priceAdjustment : null,
      })),
    ])) as RackSettings["options"],
    defaultOptionIds: Object.fromEntries(rackOptionGroups.map(({ key }) => [key, settings?.defaultOptionIds?.[key] || ""])) as RackSelection,
    ...(settings?.useDefaults === true ? { useDefaults: true } : {}),
  });
  return { schemaVersion: 2, defaults: normalize(input.defaults), overrides: Object.fromEntries(
    Object.entries(input.overrides || {}).map(([id, settings]) => [id, normalize(settings)]),
  ) };
}
export function settingsForRack(config: RackCalculatorConfig, product?: Partial<CatalogProduct>): RackSettings {
  const override = product?.id ? config.overrides[product.id] : undefined;
  return override && !override.useDefaults ? override : config.defaults;
}
export function activeRackOptions(settings: RackSettings, key: RackOptionKey): RackOption[] {
  return settings.options[key].filter(option => option.active).sort((a,b) => a.value-b.value);
}
export function rackSettingsIssue(settings: RackSettings): string | null {
  for (const { key, label } of rackOptionGroups) {
    const active = activeRackOptions(settings, key);
    if (!active.length) return `${label}: dejá al menos una opción activa.`;
    if (active.some(option => typeof option.priceAdjustment !== "number" || !Number.isFinite(option.priceAdjustment))) return `${label}: faltan ajustes de precio.`;
    if (!active.some(option => option.id === settings.defaultOptionIds[key])) return `${label}: elegí una opción inicial activa.`;
  }
  return null;
}

// The single commercial calculation used by catalog, detail, admin preview and cart quotes.
export function calculateRackPrice(product: Partial<CatalogProduct> | undefined, settings: RackSettings, selection: RackSelection = settings.defaultOptionIds): RackQuote {
  const issue = rackSettingsIssue(settings);
  if (issue) return { ready: false, reason: issue };
  const priceBase = product?.priceBase;
  const markupPercent = product?.markupPercent ?? 0;
  if (typeof priceBase !== "number" || !Number.isFinite(priceBase) || priceBase < 0) return { ready: false, reason: "Definí un costo válido para este rack." };
  if (typeof markupPercent !== "number" || !Number.isFinite(markupPercent) || markupPercent < 0) return { ready: false, reason: "Definí un porcentaje de ganancia válido para este rack." };
  const selectedOptions = {} as Record<RackOptionKey, RackOption>;
  // Apply the product markup only to its cost; adjustments are already sale amounts.
  let price = productFinalPrice({ priceBase, markupPercent });
  for (const { key, label } of rackOptionGroups) {
    const option = activeRackOptions(settings, key).find(option => option.id === selection[key]);
    if (!option) return { ready: false, reason: `${label}: seleccioná una opción activa.` };
    selectedOptions[key] = { ...option };
    price += option.priceAdjustment!;
  }
  if (!Number.isFinite(price) || price < 0) return { ready: false, reason: "La configuración da un precio negativo o inválido. Revisá los ajustes en Admin." };
  return { ready: true, price, selectedOptions };
}

// Validate the extreme combinations using the same calculation, without clamping prices.
export function rackPriceIssue(product: Partial<CatalogProduct> | undefined, settings: RackSettings): string | null {
  const incomplete = rackSettingsIssue(settings);
  if (incomplete) return incomplete;
  for (const direction of [1, -1]) {
    const selection = Object.fromEntries(rackOptionGroups.map(({ key }) => [key,
      [...activeRackOptions(settings, key)].sort((a,b) => direction * (a.priceAdjustment! - b.priceAdjustment!))[0]!.id,
    ])) as RackSelection;
    const quote = calculateRackPrice(product, settings, selection);
    if (!quote.ready) return quote.reason;
  }
  return null;
}
export function rackQuoteItem(product: Partial<CatalogProduct> & { name: string }, quote: Extract<RackQuote, { ready: true }>) {
  const selected = quote.selectedOptions;
  return {
    name: product.name, productId: product.id, price: quote.price, pricingVersion: 2 as const,
    quoteKey: JSON.stringify(["rack-v2", product.id, ...rackOptionGroups.map(({ key }) => [key, selected[key].id, selected[key].value])]),
    rackSelection: selected,
    details: rackOptionGroups.map(({ key, label, unit }) => `${label}: ${selected[key].value} ${unit}`).join(", "),
  };
}
