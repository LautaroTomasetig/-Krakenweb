import type { CatalogProduct } from "./products";

export const rackOptionGroups = [
  { key: "heights", label: "Alturas", unit: "mm", reference: "height" },
  { key: "widths", label: "Largos", unit: "mm", reference: "width" },
  { key: "depths", label: "Profundidades", unit: "mm", reference: "depth" },
  { key: "levels", label: "Niveles", unit: "niveles", reference: "levels" },
  { key: "loads", label: "Resistencia por nivel", unit: "kg", reference: "load" },
] as const;
export type RackOptionKey = typeof rackOptionGroups[number]["key"];
export type RackOption = { id: string; value: number; active: boolean };
export type RackSettings = {
  options: Record<RackOptionKey, RackOption[]>;
  reference: { width: number; height: number; depth: number; levels: number; load: number };
  minimumFactor: number;
  minimumLoadFactor: number;
};
export type RackCalculatorConfig = { defaults: RackSettings; overrides: Record<string, RackSettings>; markupPercent: number };
export const DEFAULT_RACK_CONFIG = { width: 2000, height: 2000, depth: 1000, levels: 3 };
const options = (values: number[]) => values.map(value => ({ id: String(value), value, active: true }));
export function defaultRackCalculator(): RackCalculatorConfig {
  return {
    defaults: {
      options: { widths: options([1200,1500,1800,2000,2400,2700,3000]), heights: options([1200,1500,1800,2000,2400,3000,3600,4500]), depths: options([600,800,1000,1100,1200]), levels: options([2,3,4,5,6,8]), loads: options([200,400,600,800,1000,1200]) },
      reference: { ...DEFAULT_RACK_CONFIG, load: 600 }, minimumFactor: .65, minimumLoadFactor: .7,
    },
    overrides: {}, markupPercent: 0,
  };
}
export function settingsForRack(config: RackCalculatorConfig, product?: Partial<CatalogProduct>): RackSettings {
  const override = product?.id ? config.overrides[product.id] : undefined;
  return override || { ...config.defaults, reference: { ...config.defaults.reference, ...product?.rackConfig } };
}
export function activeRackOptions(settings: RackSettings, key: RackOptionKey) {
  return settings.options[key].filter(option => option.active).map(option => option.value).sort((a,b) => a-b);
}

// Same formula as the original calculator; only its numeric inputs are configurable.
export function rackCalculationFactor(settings: RackSettings, selection: RackSettings["reference"]) {
  const base = settings.reference;
  return Math.max(settings.minimumFactor, (selection.width / base.width) * (selection.height / base.height) * (selection.depth / base.depth) * (selection.levels / base.levels) * Math.max(settings.minimumLoadFactor, selection.load / base.load));
}
