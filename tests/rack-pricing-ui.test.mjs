import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { parse, compileScript } from '@vue/compiler-sfc';
import { createSSRApp, computed, ref, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';

// Compile the real page templates and exercise their bindings with in-memory API data.
// No database access or generated files are needed.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const candidate = new URL(specifier + '.ts', context.parentURL);
      if (existsSync(candidate)) return nextResolve(candidate.href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.endsWith('.vue')) return nextLoad(url, context);
    const { descriptor } = parse(readFileSync(new URL(url), 'utf8'));
    const compiled = compileScript(descriptor, { id: 'rack-ui-test', inlineTemplate: true }).content;
    const helpers = `import {ref,computed,watch,reactive} from 'vue';
      import {useQuoteCart} from ${JSON.stringify(new URL('../app/composables/useQuoteCart.ts', import.meta.url).href)};
      const useFetch=(...args)=>globalThis.__rackUi.useFetch(...args);
      const useRoute=()=>globalThis.__rackUi.route;
      const useHead=()=>{};
      const definePageMeta=()=>{};
      const useRequestFetch=()=>globalThis.__rackUi.requestFetch;
      const refreshNuxtData=async()=>{};
      const $fetch=(...args)=>globalThis.__rackUi.fetch(...args);
    `;
    return { format: 'module', source: helpers + stripTypeScriptTypes(compiled), shortCircuit: true };
  },
});
const { useQuoteCart } = await import('../app/composables/useQuoteCart.ts');
const { defaultRackCalculator, rackQuoteItem, calculateRackPrice } = await import('../data/rack-calculator.ts');
let config, products, error, cookies, states;
beforeEach(() => {
  const value = defaultRackCalculator();
  const groups = { heights:[[2000,0],[2400,35000],[3000,80000]], widths:[[2000,0],[2400,45000]], depths:[[600,0],[800,25000]], levels:[[2,-60000],[3,0],[4,60000]], loads:[[200,-40000],[400,0],[600,90000]] };
  for (const [key,options] of Object.entries(groups)) value.defaults.options[key] = options.map(([value,priceAdjustment]) => ({ id:String(value),value,priceAdjustment,active:true }));
  value.defaults.defaultOptionIds = { heights:'2400',widths:'2400',depths:'800',levels:'4',loads:'600' };
  config = ref(value); error = ref(null);
  products = ref([{id:'rack',slug:'rack',name:'Rack test',code:'RK',images:[],categoryId:'racks',isRack:true,priceBase:500000,markupPercent:30,description:'Rack'}]);
  cookies = new Map(); states = new Map();
  globalThis.computed = computed;
  globalThis.useState = (key,initial) => { if(!states.has(key)) states.set(key,ref(initial())); return states.get(key); };
  globalThis.useCookie = (key,options) => { if(!cookies.has(key)) cookies.set(key,ref(options.default())); return cookies.get(key); };
  globalThis.__rackUi = {
    route:{params:{slug:'rack'},query:{}},
    useFetch: url => ({data:url.includes('rack-calculator')?config:url==='/api/products'?products:ref([{id:'racks',name:'Racks',isRack:true}]),error,refresh:async()=>{}}),
    requestFetch:async url=>url==='/api/admin/products'?products.value:[{id:'racks',name:'Racks',isRack:true}],
    fetch:async url=>{if(url==='/api/admin/gallery')return [];throw new Error('Unexpected API write');},
  };
});
const nodes = (node,type) => !node || typeof node !== 'object' ? [] : [
  ...(node.type===type?[node]:[]),
  ...(Array.isArray(node.children)?node.children.flatMap(child=>nodes(child,type)):[]),
  ...(typeof node.children?.default==='function'?node.children.default().flatMap(child=>nodes(child,type)):[]),
];
async function mountPage(path, props={}) {
  const { default: Page } = await import(new URL(path,import.meta.url).href);
  let render, tree, html;
  const appFor = component => {
    const app=createSSRApp(component);
    app.component('SiteHeader',{render:()=>null});
    app.component('NuxtLink',{template:'<a><slot /></a>'});
    app.component('AdminCategories',{render:()=>null});
    app.component('AdminRackCalculator',{render:()=>null});
    return app;
  };
  html=await renderToString(appFor({async setup(){render=await Page.setup(props,{expose(){}});return ()=>tree=render({},[]);}}));
  return {
    get html(){return html;},
    nodes:type=>nodes(tree,type),
    async update(){await nextTick();html=await renderToString(appFor({render:()=>tree=render({},[])}));},
  };
}
const click = button => button.props.onClick({stopPropagation(){}});
const money = value => '$ '+value.toLocaleString('es-AR');
function assertDetail(page, price) {
  assert.ok(page.html.includes('>'+money(price)+' + IVA</p>'),page.html);
  assert.ok(page.html.includes('<strong>'+money(price)+'</strong>'));
}
test('catalog, detail initial price and cart agree with nonzero initial adjustments',async()=>{
  const catalog=await mountPage('../app/pages/catalogo.vue');
  assert.ok(catalog.html.includes('<strong>$ 905.000 + IVA</strong>'));
  click(catalog.nodes('button').find(b=>b.props.class==='add-button'));
  const cart=useQuoteCart();
  assert.equal(cart.quoteItems.value[0].price,905000);
  assert.equal(cart.quoteItems.value[0].rackSelection.heights.value,2400);
  const detail=await mountPage('../app/pages/productos/[slug].vue');
  assertDetail(detail,905000);
  click(detail.nodes('button').find(b=>b.props.class==='button button-primary'));
  assert.equal(cart.quoteItems.value.length,1);
  assert.equal(cart.quoteItems.value[0].quantity,2);
});
test('each selector immediately updates both prices and the exact configuration added to the cart',async()=>{
  const page=await mountPage('../app/pages/productos/[slug].vue');
  for(const [index,id,price] of [[0,'3000',950000],[1,'2000',905000],[2,'600',880000],[3,'2',760000],[4,'200',630000]]){
    page.nodes('select')[index].props['onUpdate:modelValue'](id);
    await page.update();assertDetail(page,price);
  }
  click(page.nodes('button').find(b=>b.props.class==='button button-primary'));
  const item=useQuoteCart().quoteItems.value[0];
  assert.equal(item.price,630000);
  assert.deepEqual(Object.fromEntries(Object.entries(item.rackSelection).map(([k,o])=>[k,o.id])),{heights:'3000',widths:'2000',depths:'600',levels:'2',loads:'200'});
});
test('missing active adjustment blocks catalog and detail purchase without a fallback price',async()=>{
  config.value.defaults.options.heights[2].priceAdjustment=null;
  for(const path of ['../app/pages/catalogo.vue','../app/pages/productos/[slug].vue']){
    const page=await mountPage(path);
    assert.ok(page.html.includes('Configuración pendiente'));
    const button=page.nodes('button').find(b=>['add-button','button button-primary'].includes(b.props?.class));
    assert.equal(button.props.disabled,true);click(button);
    assert.equal(useQuoteCart().quoteItems.value.length,0);
  }
});
test('configuration fetch failures cannot fall back to base prices for racks',async()=>{
  error.value=new Error('Offline');config.value=null;
  const page=await mountPage('../app/pages/productos/[slug].vue');
  assert.ok(page.html.includes('Configuración pendiente'));
  assert.equal(page.nodes('button').find(b=>b.props.class==='button button-primary').props.disabled,true);
});
test('zero rack prices are displayed and non-rack prices retain their existing markup',async()=>{
  for(const options of Object.values(config.value.defaults.options))for(const option of options)option.priceAdjustment=0;
  products.value[0].priceBase=0;
  assertDetail(await mountPage('../app/pages/productos/[slug].vue'),0);
  const catalog=await mountPage('../app/pages/catalogo.vue');assert.ok(catalog.html.includes('<strong>$ 0 + IVA</strong>'));
  products.value[0].isRack=false;products.value[0].priceBase=1000;products.value[0].markupPercent=30;
  const page=await mountPage('../app/pages/productos/[slug].vue');assert.ok(page.html.includes('$ 1.300 + IVA'));
  click(page.nodes('button').find(b=>b.props.class==='button button-primary'));
  assert.equal(useQuoteCart().quoteItems.value[0].price,1300);
});
test('readding a rack refreshes its price without merging legacy cart entries or another selection',()=>{
  const cart=useQuoteCart();
  const item=rackQuoteItem(products.value[0],calculateRackPrice(products.value[0],config.value.defaults));
  cart.addToQuote({name:item.name,details:item.details,price:1});
  cart.addToQuote(item);
  cart.addToQuote({...item,price:800000},2);
  assert.equal(cart.quoteItems.value.length,2);assert.equal(cart.quoteItems.value[0].price,1);
  assert.equal(cart.quoteItems.value[1].price,800000);assert.equal(cart.quoteItems.value[1].quantity,3);
  cart.updateQuoteQuantity(item.name,1,item.details,item.quoteKey);
  assert.equal(cart.quoteItems.value[0].quantity,1);assert.equal(cart.quoteItems.value[1].quantity,4);
});
test('admin supports signed adjustments, explicit defaults, pending drafts and negative-price warnings',async()=>{
  const page=await mountPage('../app/components/AdminRackCalculator.vue',{products:products.value});
  assert.ok(page.html.includes('Ajuste de precio ($)'));
  assert.ok(page.html.includes('Opción inicial'));
  const adjustment=page.nodes('input').find(n=>n.props['aria-label']?.startsWith('Ajuste de Alto'));
  assert.equal(adjustment.props.min,undefined);
  adjustment.props.onInput({target:{value:'-700000',valueAsNumber:-700000}});
  await page.update();
  assert.ok(page.html.includes('precio negativo'));
  assert.equal(page.nodes('button').find(b=>b.props.type==='submit').props.disabled,true);
  adjustment.props.onInput({target:{value:'',valueAsNumber:NaN}});
  await page.update();assert.ok(page.html.includes('Configuración pendiente'));
});

test('admin creation exposes cost and product gain and submits both for a new rack',async()=>{
  const requests=[];
  globalThis.__rackUi.fetch=async(url,options)=>{if(url==='/api/admin/gallery')return [];requests.push({url,...options});return {};};
  const page=await mountPage('../app/pages/admin/productos.vue');
  assert.ok(page.html.includes('Costo del producto'));
  assert.ok(page.html.includes('Ganancia del producto (%)'));
  const textInputs=page.nodes('input').filter(n=>!n.props.type);
  textInputs[0].props['onUpdate:modelValue']('Rack nuevo');
  textInputs[1].props['onUpdate:modelValue']('rack-nuevo');
  const numbers=page.nodes('input').filter(n=>n.props.type==='number');
  numbers[0].props['onUpdate:modelValue'](1000000);
  numbers[1].props['onUpdate:modelValue'](30);
  await page.update();
  assert.ok(page.html.includes('$ 1.300.000</output>'));
  assert.ok(page.html.includes('$ 1.555.000 + IVA</output>'));
  await page.nodes('form')[0].props.onSubmit({preventDefault(){}});
  assert.equal(requests.length,1);
  assert.equal(requests[0].method,'POST');
  assert.equal(requests[0].body.priceBase,1000000);
  assert.equal(requests[0].body.markupPercent,30);
});

test('admin editing a rack keeps product gain visible and updates its sale preview and payload',async()=>{
  const requests=[];
  globalThis.__rackUi.fetch=async(url,options)=>{if(url==='/api/admin/gallery')return [];requests.push({url,...options});return {};};
  const page=await mountPage('../app/pages/admin/productos.vue');
  click(page.nodes('button').find(n=>n.props.class==='icon-button'));
  await page.update();
  const numbers=page.nodes('input').filter(n=>n.props.type==='number');
  assert.equal(numbers[0].props['onUpdate:modelValue'] instanceof Function,true);
  assert.ok(page.html.includes('Ganancia del producto (%)'));
  numbers[0].props['onUpdate:modelValue'](750000);
  numbers[1].props['onUpdate:modelValue'](40);
  await page.update();
  assert.ok(page.html.includes('$ 1.050.000</output>'));
  assert.ok(page.html.includes('$ 1.305.000 + IVA</output>'));
  await page.nodes('form')[0].props.onSubmit({preventDefault(){}});
  assert.equal(requests.length,1);
  assert.equal(requests[0].method,'PUT');
  assert.equal(requests[0].body.priceBase,750000);
  assert.equal(requests[0].body.markupPercent,40);
});
