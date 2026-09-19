import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";

// Native Node TypeScript loading; no tooling installation and no live database writes.
const firestoreMock = `
      const store = () => globalThis.__catalogTestStore;
      const clone = value => value == null ? value : structuredClone(value);
      const snapshot = path => ({ id: path.split('/').at(-1), exists: () => store().docs.has(path), data: () => clone(store().docs.get(path)) });
      export const doc = (_, ...parts) => parts.join('/');
      export const collection = (_, path) => path;
      export const getDocFromServer = async path => snapshot(path);
      export const getDocsFromServer = async path => ({ docs: [...store().docs.keys()].filter(key => key.startsWith(path + '/')).map(snapshot) });
      export async function setDoc(path, value, options) {
        store().docs.set(path, options?.merge ? { ...store().docs.get(path), ...clone(value) } : clone(value));
        store().versions.set(path, (store().versions.get(path) || 0) + 1);
      }
      export async function deleteDoc(path) { store().docs.delete(path); }
      export async function runTransaction(_, callback) {
        for (let attempt = 0; attempt < 5; attempt++) {
          const reads = new Map(), writes = [];
          const value = await callback({
            get: async path => { reads.set(path, store().versions.get(path) || 0); return snapshot(path); },
            set: (...args) => writes.push(args),
          });
          const hook = store().beforeCommit;
          if (hook) { store().beforeCommit = null; await hook(); }
          if ([...reads].some(([path, version]) => version !== (store().versions.get(path) || 0))) continue;
          for (const args of writes) await setDoc(...args);
          return value;
        }
        throw new Error('Transaction retry limit');
      }
`;
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "firebase/firestore") return { url: "data:text/javascript," + encodeURIComponent(firestoreMock), shortCircuit: true };
  if (specifier.endsWith("/firebase.js")) return { url: "data:text/javascript,export const db = {};", shortCircuit: true };
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const candidate = new URL(specifier + ".ts", context.parentURL);
    if (existsSync(candidate)) return nextResolve(candidate.href, context);
  }
  return nextResolve(specifier, context);
} });
const api = Object.assign({}, ...await Promise.all([
  import("../data/product-pricing.ts"),
  import("../data/categories.ts"),
  import("../data/rack-calculator.ts"),
  import("../server/utils/product-input.ts"),
  import("../server/utils/category-store.ts"),
  import("../server/utils/product-store.ts"),
  import("../server/utils/rack-calculator-store.ts"),
]));
let state;
beforeEach(() => {
  state = { docs: new Map(), versions: new Map(), beforeCommit: null };
  globalThis.__catalogTestStore = state;
});
const validProduct = categoryId => ({ name: "Rack de prueba", slug: "rack-prueba", code: "RK", categoryId, priceBase: 100, markupPercent: 25 });

test("prices: legacy fallback, 0% default, single new price and explicit zero", () => {
  assert.equal(api.productFinalPrice({ priceFrom: 100 }), 100);
  assert.equal(api.productBasePrice({ price: 85 }), 85);
  assert.deepEqual(api.productPriceRange({ priceFrom: 100, priceTo: 200 }), [100,200]);
  assert.deepEqual(api.productPriceRange({ priceBase: 100, markupPercent: 25, priceFrom: 5, priceTo: 999 }), [125,125]);
  assert.equal(api.productFinalPrice({ priceBase: 0, priceFrom: 100, markupPercent: 25 }), 0);
});
test("product payload cannot persist final or overwrite legacy prices", () => {
  const payload = api.productInput({ ...validProduct("category"), priceFinal: 999, price: 9, priceFrom: 9, priceTo: 9 });
  for (const field of ["priceFinal", "price", "priceFrom", "priceTo"]) assert.equal(field in payload, false);
  assert.equal(api.productFinalPrice(payload), 125);
  for (const priceBase of [-1, Infinity, NaN, "100"]) assert.throws(() => api.productInput({ ...validProduct("category"), priceBase }), { statusCode: 400 });
  for (const markupPercent of [-1, Infinity, NaN, "25"]) assert.throws(() => api.productInput({ ...validProduct("category"), markupPercent }), { statusCode: 400 });
});
test("category bootstrap retains custom and accent-insensitive legacy associations", async () => {
  state.docs.set("products/legacy", { category: "Racks metalicos" });
  state.docs.set("products/custom", { category: "Accesorios" });
  const categories = await api.loadCategories();
  assert.equal(categories.length, 5);
  assert.equal(api.categoryForProduct({ category: "RACKS METÁLICOS" }, categories).isRack, true);
  assert.ok(categories.some(category => category.name === "Accesorios"));
  assert.equal(state.docs.has("site/categories"), false);
});
test("renaming preserves legacy associations and rack classification", async () => {
  state.docs.set("products/legacy", { category: "Racks metalicos", priceFrom: 100, priceTo: 200 });
  const rack = (await api.loadCategories()).find(category => category.isRack);
  await api.mutateCategory("update", rack.id, { name: "Almacenamiento industrial" });
  const [product] = await api.loadProducts();
  assert.equal(product.category, "Almacenamiento industrial");
  assert.equal(product.categoryId, rack.id);
  assert.equal(product.isRack, true);
  assert.equal(state.docs.get("products/legacy").category, "Racks metalicos");
  await assert.rejects(api.mutateCategory("delete", rack.id), { statusCode: 409 });
});
test("category CRUD persists in site and rejects duplicate names", async () => {
  const category = await api.mutateCategory("create", undefined, { name: "Accesorios" });
  assert.ok((await api.loadCategories()).some(item => item.id === category.id));
  await assert.rejects(api.mutateCategory("create", undefined, { name: " accesorios " }), { statusCode: 409 });
  await api.mutateCategory("delete", category.id);
  assert.equal((await api.loadCategories()).some(item => item.id === category.id), false);
});
test("editing an old product preserves old fields; new products only store new pricing", async () => {
  const original = { name: "Rack", slug: "legacy", category: "Racks metálicos", price: 100, priceFrom: 100, priceTo: 300, customField: "keep", rackConfig: { width: 2700, height: 3000, depth: 1100, levels: 3 } };
  state.docs.set("products/legacy", original);
  const [product] = await api.loadProducts();
  await api.updateProduct("legacy", api.productInput({ priceBase: 200, markupPercent: 10 }, product));
  const saved = state.docs.get("products/legacy");
  for (const key of ["price", "priceFrom", "priceTo", "customField", "rackConfig", "category"]) assert.deepEqual(saved[key], original[key]);
  assert.equal("priceFinal" in saved, false);
  assert.ok(Math.abs(api.productFinalPrice(saved) - 220) < 1e-10);
  await api.createProduct(api.productInput(validProduct(product.categoryId)));
  const created = state.docs.get("products/rack-prueba");
  for (const field of ["priceFinal", "price", "priceFrom", "priceTo"]) assert.equal(field in created, false);
  await assert.rejects(api.mutateCategory("delete", product.categoryId), { statusCode: 409 });
});
test("a product cannot be assigned to a deleted category", async () => {
  const category = await api.mutateCategory("create", undefined, { name: "Temporal" });
  await api.mutateCategory("delete", category.id);
  await assert.rejects(api.createProduct(api.productInput(validProduct(category.id))), { statusCode: 400 });
  assert.equal(state.docs.has("products/rack-prueba"), false);
});
test("concurrent product assignment prevents category deletion on retry", async () => {
  const category = await api.mutateCategory("create", undefined, { name: "Temporal" });
  state.beforeCommit = () => api.createProduct(api.productInput(validProduct(category.id)));
  await assert.rejects(api.mutateCategory("delete", category.id), { statusCode: 409 });
  assert.ok((await api.loadCategories()).some(item => item.id === category.id));
});
test("rack defaults reproduce the original formula for all original combinations", () => {
  const config = api.defaultRackCalculator();
  const settings = api.settingsForRack(config);
  for (const width of api.activeRackOptions(settings, "widths"))
    for (const height of api.activeRackOptions(settings, "heights"))
      for (const depth of api.activeRackOptions(settings, "depths"))
        for (const levels of api.activeRackOptions(settings, "levels"))
          for (const load of api.activeRackOptions(settings, "loads")) {
            const expected = Math.max(.65, (width/2000)*(height/2000)*(depth/1000)*(levels/3)*Math.max(.7,load/600));
            assert.equal(api.rackCalculationFactor(settings, { width,height,depth,levels,load }), expected);
          }
  assert.equal(config.markupPercent, 0);
});
test("rack-specific options preserve existing reference dimensions and inactive options stay hidden", () => {
  const config = api.defaultRackCalculator();
  const product = { id: "pallets", rackConfig: { width:2700,height:3000,depth:1100,levels:3 } };
  const settings = structuredClone(api.settingsForRack(config, product));
  assert.equal(settings.reference.width, 2700);
  assert.equal(api.rackCalculationFactor(settings, { ...settings.reference }), 1);
  settings.options.heights[0].active = false;
  config.overrides.pallets = settings;
  assert.equal(api.activeRackOptions(api.settingsForRack(config, product), "heights").includes(1200), false);
  assert.equal(api.activeRackOptions(config.defaults, "heights").includes(1200), true);
});
test("rack validation rejects empty, inactive, duplicate, invalid and zero-reference options", () => {
  const invalidChanges = [
    settings => { settings.options.heights = []; },
    settings => { settings.options.heights.forEach(option => { option.active = false; }); },
    settings => { settings.options.heights[1].value = settings.options.heights[0].value; },
    settings => { settings.options.heights[0] = null; },
    settings => { settings.reference.width = 0; },
    settings => { settings.minimumFactor = Infinity; },
  ];
  for (const change of invalidChanges) { const config = api.defaultRackCalculator(); change(config.defaults); assert.throws(() => api.validateRackCalculator(config), { statusCode: 400 }); }
});
test("rack configuration persists in site without changing products or gallery", async () => {
  const config = api.defaultRackCalculator();
  state.docs.set("site/gallery", { items: ["original"] });
  state.docs.set("products/legacy", { priceFrom: 123 });
  config.markupPercent = 15;
  config.defaults.options.widths.push({ id:"extra",value:3500,active:true });
  await api.saveRackCalculator(config);
  assert.deepEqual(await api.loadRackCalculator(), config);
  assert.deepEqual(state.docs.get("site/gallery"), { items:["original"] });
  assert.deepEqual(state.docs.get("products/legacy"), { priceFrom:123 });
});
