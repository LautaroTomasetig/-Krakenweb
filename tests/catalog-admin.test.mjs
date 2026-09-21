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
  assert.equal(saved.priceBase, 200);
  assert.equal(saved.markupPercent, 10);
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

function configuredCalculator() {
  const config = api.defaultRackCalculator();
  const groups = {
    heights: [[2000,0],[2400,35000],[3000,80000]],
    widths: [[2000,0],[2400,45000]],
    depths: [[600,0],[800,25000],[1000,50000]],
    levels: [[2,-60000],[3,0],[4,60000],[5,120000]],
    loads: [[200,-40000],[400,0],[600,90000]],
  };
  for (const [key, values] of Object.entries(groups)) {
    config.defaults.options[key] = values.map(([value,priceAdjustment]) => ({ id:String(value), value, priceAdjustment, active:true }));
  }
  config.defaults.defaultOptionIds = { heights:'2000', widths:'2000', depths:'600', levels:'3', loads:'400' };
  return config;
}
const selection = { heights:'2400', widths:'2400', depths:'800', levels:'4', loads:'600' };
test('rack prices apply product gain only to cost and add sale adjustments without calculator markup or floors', () => {
  const config = configuredCalculator();
  config.markupPercent = 40;
  Object.assign(config.defaults, { minimumFactor:.65, minimumLoadFactor:.7, reference:{ width:1 } });
  const product = { priceBase:500000, markupPercent:30, rackConfig:{ width:99999 } };
  const settings = api.settingsForRack(config, product);
  assert.equal(api.calculateRackPrice(product, settings, selection).price, 905000);
  assert.equal(api.calculateRackPrice({priceBase:500000}, settings, {...settings.defaultOptionIds,levels:'2',loads:'200'}).price, 400000);
  settings.defaultOptionIds = {...selection};
  assert.equal(api.calculateRackPrice({priceBase:500000}, settings).price, 755000);
  for (const [key,id,increase] of [['heights','3000',45000],['widths','2000',-45000],['depths','1000',25000],['levels','5',60000],['loads','400',-90000]]) {
    assert.equal(api.calculateRackPrice({priceBase:500000},settings,{...selection,[key]:id}).price,755000+increase);
  }
});
test('legacy loading preserves dimensions without guessing adjustments or defaults and never writes', async () => {
  const legacy = configuredCalculator();
  delete legacy.schemaVersion;
  for(const {key} of api.rackOptionGroups) for(const option of legacy.defaults.options[key]) delete option.priceAdjustment;
  delete legacy.defaults.defaultOptionIds;
  legacy.defaults.reference = {height:2000}; legacy.markupPercent=40;
  state.docs.set('site/rackCalculator',structuredClone(legacy));
  const config = await api.loadRackCalculator();
  assert.equal(config.defaults.options.heights[1].value,2400);
  assert.equal(config.defaults.options.heights[1].priceAdjustment,null);
  assert.equal(config.defaults.defaultOptionIds.heights,'');
  assert.equal(api.calculateRackPrice({priceBase:500000},config.defaults).ready,false);
  assert.deepEqual(state.docs.get('site/rackCalculator'),legacy);
  assert.equal(state.versions.size,0);
});
test('missing adjustments anywhere active, missing base, invalid/default/inactive choices never become free options', () => {
  for(const bad of [null,undefined,NaN,Infinity,'0']) {
    const config=configuredCalculator();config.defaults.options.heights[2].priceAdjustment=bad;
    assert.equal(api.calculateRackPrice({priceBase:500000},config.defaults).ready,false);
  }
  const config=configuredCalculator();
  assert.equal(api.calculateRackPrice(undefined,config.defaults).ready,false);
  assert.equal(api.calculateRackPrice({priceBase:500000},config.defaults,{...selection,heights:'unknown'}).ready,false);
  config.defaults.options.heights[0].active=false;
  assert.equal(api.calculateRackPrice({priceBase:500000},config.defaults).ready,false);
  config.defaults.defaultOptionIds.heights='2400';
  assert.equal(api.calculateRackPrice({priceBase:500000},config.defaults).price,535000);
  assert.equal(api.calculateRackPrice({priceBase:500000},config.defaults,{...selection,heights:'2000'}).ready,false);
});
test('price validation checks all active combinations; zero is valid and negatives are not clamped', () => {
  const config=configuredCalculator();
  assert.equal(api.calculateRackPrice({priceBase:0},config.defaults).price,0);
  assert.match(api.rackPriceIssue({priceBase:50000},config.defaults),/negativo/);
  assert.equal(api.rackPriceIssue({priceBase:100000},config.defaults),null);
  const negative=api.calculateRackPrice({priceBase:50000},config.defaults,{...config.defaults.defaultOptionIds,levels:'2',loads:'200'});
  assert.equal(negative.ready,false);assert.equal('price' in negative,false);
});
test('validation permits drafts and signed adjustments but rejects malformed values, duplicate options and stale defaults', () => {
  assert.doesNotThrow(()=>api.validateRackCalculator(api.defaultRackCalculator()));
  assert.doesNotThrow(()=>api.validateRackCalculator(configuredCalculator()));
  for(const change of [
    s=>s.options.heights=[], s=>s.options.heights.forEach(o=>o.active=false),
    s=>s.options.heights[1].value=s.options.heights[0].value,
    s=>s.options.heights[1].id=s.options.heights[0].id,
    s=>s.options.heights[0]=null,
    s=>s.options.heights[0].priceAdjustment=Infinity,
    s=>s.options.heights[0].priceAdjustment='0',
    s=>s.defaultOptionIds.heights='missing',
    s=>s.options.heights[0].active=false,
  ]) {const config=configuredCalculator();change(config.defaults);assert.throws(()=>api.validateRackCalculator(config),{statusCode:400});}
});
test('saving preserves obsolete Firestore fields, unrelated documents and personal settings when using defaults', async () => {
  const legacy={ markupPercent:40,custom:'keep',defaults:{reference:{height:2000},minimumFactor:.65,minimumLoadFactor:.7},overrides:{rack:{reference:{height:3000},minimumFactor:.8,minimumLoadFactor:.9}} };
  state.docs.set('site/rackCalculator',legacy);
  state.docs.set('site/gallery',{items:['keep']});
  state.docs.set('products/rack',{name:'Rack',category:'Racks metalicos',priceBase:500000,markupPercent:30,rackConfig:{height:3000}});
  const config=configuredCalculator();config.overrides.rack=structuredClone(config.defaults);config.overrides.rack.useDefaults=true;
  const saved=await api.saveRackCalculator(config);
  const stored=state.docs.get('site/rackCalculator');
  assert.equal(stored.markupPercent,40);assert.equal(stored.custom,'keep');
  assert.equal(stored.defaults.minimumFactor,.65);assert.equal(stored.defaults.minimumLoadFactor,.7);
  assert.deepEqual(stored.defaults.reference,{height:2000});
  assert.equal(stored.overrides.rack.minimumFactor,.8);
  assert.deepEqual(stored.overrides.rack.reference,{height:3000});
  assert.equal(api.settingsForRack(saved,{id:'rack'}),saved.defaults);
  assert.equal(state.docs.get('products/rack').markupPercent,30);
  assert.deepEqual(state.docs.get('site/gallery'),{items:['keep']});
  const copy=structuredClone(saved);delete copy.overrides.rack;
  await api.saveRackCalculator(copy);
  assert.ok(state.docs.get('site/rackCalculator').overrides.rack);
});
test('individual setup can be saved while general settings are still pending', async () => {
  const config=api.defaultRackCalculator();config.overrides.rack=configuredCalculator().defaults;
  state.docs.set('products/rack',{name:'Rack',category:'Racks metalicos',priceBase:500000});
  const saved=await api.saveRackCalculator(config);
  assert.equal(api.calculateRackPrice({priceBase:500000},api.settingsForRack(saved,{id:'rack'})).ready,true);
  assert.equal(api.calculateRackPrice({priceBase:500000},api.settingsForRack(saved,{id:'other'})).ready,false);
});
test('server rejects a configuration with a negative combination even when its initial price is positive', async () => {
  state.docs.set('products/rack',{name:'Rack',category:'Racks metalicos',priceBase:50000});
  await assert.rejects(api.saveRackCalculator(configuredCalculator()),{statusCode:400});
  assert.equal(state.docs.has('site/rackCalculator'),false);
});
test('lowering a rack cost cannot bypass negative-price validation; product gain is editable', async () => {
  state.docs.set('site/rackCalculator',configuredCalculator());
  state.docs.set('products/rack',{name:'Rack',slug:'rack',category:'Racks metalicos',priceBase:500000,markupPercent:30});
  const [product]=await api.loadProducts();
  await assert.rejects(api.updateProduct('rack',api.productInput({priceBase:50000},product)),{statusCode:400});
  assert.equal(state.docs.get('products/rack').priceBase,500000);
  await api.updateProduct('rack',api.productInput({priceBase:600000,markupPercent:50},product));
  assert.equal(state.docs.get('products/rack').markupPercent,50);
  assert.equal(state.docs.get('products/rack').priceBase,600000);
});
test('rack input saves and validates product gain and requires an explicit cost', () => {
  const payload=api.productInput({...validProduct('rack'),markupPercent:30},undefined,true);
  assert.equal(payload.markupPercent,30);
  for(const markupPercent of [-1,NaN,Infinity,'30']) assert.throws(()=>api.productInput({...validProduct('rack'),markupPercent},undefined,true),{statusCode:400});
  assert.throws(()=>api.productInput({...validProduct('rack'),priceBase:undefined},undefined,true),{statusCode:400});
  assert.throws(()=>api.productInput({...validProduct('other'),markupPercent:-999},undefined,false),{statusCode:400});
});
test('a concurrent base-price change causes configuration validation to retry', async () => {
  state.docs.set('products/rack',{name:'Rack',slug:'rack',category:'Racks metalicos',priceBase:500000});
  const [product]=await api.loadProducts();
  state.beforeCommit=()=>api.updateProduct('rack',api.productInput({priceBase:50000},product));
  await assert.rejects(api.saveRackCalculator(configuredCalculator()),{statusCode:400});
  assert.equal(state.docs.has('site/rackCalculator'),false);
});

test('the requested example produces 1680000 without marking up sale adjustments', () => {
  const config = configuredCalculator();
  const adjustments = { heights:50000, widths:100000, depths:30000, levels:80000, loads:120000 };
  for (const {key} of api.rackOptionGroups) {
    config.defaults.options[key].find(option => option.id === config.defaults.defaultOptionIds[key]).priceAdjustment = adjustments[key];
  }
  config.markupPercent = 999;
  assert.equal(api.calculateRackPrice({priceBase:1000000,markupPercent:30},config.defaults).price,1680000);
});
test('zero or missing product gain adds adjustments only once; invalid product gain is unavailable', () => {
  const settings=configuredCalculator().defaults;
  for(const markupPercent of [0,undefined]) {
    assert.equal(api.calculateRackPrice({priceBase:500000,markupPercent},settings,selection).price,755000);
  }
  for(const markupPercent of [-1,NaN,Infinity,'30']) {
    assert.equal(api.calculateRackPrice({priceBase:500000,markupPercent},settings).ready,false);
  }
});
test('rack creation and editing persist cost and gain without deleting legacy fields', async () => {
  const category=await api.mutateCategory('create',undefined,{name:'Accesorios'});
  // Existing rack category has isRack=true; the product API resolves that category server-side.
  const rackCategory=(await api.loadCategories()).find(category=>category.isRack);
  await api.createProduct(api.productInput({...validProduct(rackCategory.id),priceBase:1000000,markupPercent:30},undefined,true));
  assert.equal(state.docs.get('products/rack-prueba').markupPercent,30);
  assert.equal(state.docs.get('products/rack-prueba').priceBase,1000000);
  state.docs.get('products/rack-prueba').rackConfig={height:2000};
  state.docs.get('products/rack-prueba').priceFrom=123;
  const product=(await api.loadProducts()).find(product=>product.id==='rack-prueba');
  await api.updateProduct(product.id,api.productInput({markupPercent:45},product));
  assert.equal(state.docs.get('products/rack-prueba').markupPercent,45);
  assert.equal(state.docs.get('products/rack-prueba').priceBase,1000000);
  assert.equal(state.docs.get('products/rack-prueba').priceFrom,123);
  assert.deepEqual(state.docs.get('products/rack-prueba').rackConfig,{height:2000});
});
test('negative-combination validation includes product gain when saving config or changing only gain',async()=>{
  state.docs.set('products/rack',{name:'Rack',slug:'rack',category:'Racks metalicos',priceBase:50000,markupPercent:100});
  const saved=await api.saveRackCalculator(configuredCalculator());
  assert.equal(api.rackPriceIssue({priceBase:50000,markupPercent:100},saved.defaults),null);
  const [product]=await api.loadProducts();
  await assert.rejects(api.updateProduct('rack',api.productInput({markupPercent:0},product)),{statusCode:400});
  assert.equal(state.docs.get('products/rack').markupPercent,100);
});

test('product descriptions and specifications survive creation, loading, partial edits and explicit clearing',async()=>{
  const category=await api.mutateCategory('create',undefined,{name:'Accesorios'});
  const technicalDescription='Primer párrafo\n\nSegundo párrafo\n  Texto con espacios';
  const specifications='1 Bastidor #18/#16\r\n• Altura: 200cm\r\n\r\n✓ Tuercas y tornillos\n<b>Texto literal</b>';
  await api.createProduct(api.productInput({...validProduct(category.id),technicalDescription,specifications}));
  const [loaded]=await api.loadProducts();
  assert.equal(loaded.technicalDescription,technicalDescription);
  assert.equal(loaded.specifications,specifications);
  assert.equal(state.docs.get('products/rack-prueba').specifications,specifications);
  await api.updateProduct(loaded.id,api.productInput({name:'Nombre actualizado'},loaded));
  const [edited]=await api.loadProducts();
  assert.equal(edited.specifications,specifications);
  assert.equal(edited.technicalDescription,technicalDescription);
  await api.updateProduct(edited.id,api.productInput({specifications:'',technicalDescription:''},edited));
  const [cleared]=await api.loadProducts();
  assert.equal(cleared.specifications,'');
  assert.equal(cleared.technicalDescription,'');
});

test('product text fields accept strings only and support legacy products without specifications',()=>{
  const base=validProduct('accessories');
  assert.equal(api.productInput(base).specifications,'');
  assert.equal(api.productInput({}, {...base,technicalDescription:'Descripción existente'}).technicalDescription,'Descripción existente');
  assert.equal(api.productInput({}, {...base,technicalDescription:'Descripción existente'}).specifications,'');
  for(const field of ['technicalDescription','specifications']) {
    for(const value of [42,null,[],{},true]) assert.throws(()=>api.productInput({...base,[field]:value}),{statusCode:400});
    assert.equal(api.productInput({...base,[field]:'\n  Texto\n\n'} )[field],'\n  Texto\n\n');
  }
});
