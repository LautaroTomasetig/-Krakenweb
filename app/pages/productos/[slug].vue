<template>
  <div v-if="product" class="product-detail-page">
    <SiteHeader />
    <main class="detail-main">
      <div class="detail-layout">
        <section class="product-gallery">
          <div class="gallery-thumbs"><button v-for="image in product.images" :key="image" :class="{ active: activeImage === image }" @click="activeImage = image"><img :src="image" :alt="product.name" /></button></div>
          <div class="gallery-preview"><img :src="activeImage || product.image" :alt="product.name" /></div>
        </section>
        <section class="product-summary">
          <div class="breadcrumbs"><NuxtLink to="/">Inicio</NuxtLink><ChevronRight :size="14" /><NuxtLink to="/catalogo">Catálogo</NuxtLink><ChevronRight :size="14" /><span>{{ product.category }}</span></div>
          <p class="eyebrow">{{ product.code }} / {{ product.description }}</p>
          <h1>{{ product.name }}</h1>
          <p class="price-range">{{ formatRange(product) }}</p>
          <div v-if="isRack" class="rack-config"><p class="eyebrow">Cotización de rack</p><p class="config-copy">Elegí una medida para actualizar el precio estimado en tiempo real.</p><p v-if="rackError" class="config-copy" role="alert">No pudimos cargar las opciones del rack. Recargá la página para volver a intentarlo.</p><div v-else class="calculator"><div class="calculator-head"><span>Configuración</span><span>REF. 2026</span></div><div class="select-row"><label>Alto<select v-model.number="height"><option v-for="value in heights" :key="value" :value="value">{{ value }} mm</option></select></label><label>Largo<select v-model.number="width"><option v-for="value in widths" :key="value" :value="value">{{ value }} mm</option></select></label><label>Profundidad<select v-model.number="depth"><option v-for="value in depths" :key="value" :value="value">{{ value }} mm</option></select></label><label>Niveles<select v-model.number="levels"><option v-for="value in levelOptions" :key="value" :value="value">{{ value }}</option></select></label><label>Resistencia por nivel<select v-model.number="load"><option v-for="value in loads" :key="value" :value="value">{{ value }} kg</option></select></label></div><div class="estimate-result"><span>Estimado + IVA</span><strong>{{ calculatedRange }}</strong></div></div></div>
          <div class="purchase-actions"><div class="quantity"><button aria-label="Reducir cantidad" @click="quantity = Math.max(1, quantity - 1)"><Minus :size="15" /></button><span>{{ quantity }}</span><button aria-label="Aumentar cantidad" @click="quantity++"><Plus :size="15" /></button></div><button class="button button-primary" :disabled="isRack && !!rackError" @click="addProduct">Agregar al carrito <ShoppingCart :size="17" /></button><button class="button button-dark" :disabled="isRack && !!rackError" @click="requestQuote">Comprar ahora <ArrowUpRight :size="17" /></button></div>
        </section>
      </div>
      <section class="description-section"><h2>Descripción:</h2><p>{{ product.technicalDescription }}</p></section>
    </main>
  </div>
  <main v-else class="not-found"><h1>Producto no encontrado</h1><NuxtLink to="/catalogo" class="button button-primary">Ver catálogo</NuxtLink></main>
</template>
<script setup lang="ts">
import { ArrowUpRight, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-vue-next";
import type { CatalogProduct } from "../../../data/products";

import { productFinalPrice, productPriceRange } from "../../../data/product-pricing";
import { defaultRackCalculator, settingsForRack, activeRackOptions, rackCalculationFactor, type RackCalculatorConfig } from "../../../data/rack-calculator";
const { data: rackData, error: rackError } = await useFetch<RackCalculatorConfig>("/api/rack-calculator");
const route = useRoute();
const { data: productData } = await useFetch<CatalogProduct[]>("/api/products");
const product = computed(() => productData.value?.find((item) => item.slug === route.params.slug));
const isRack = computed(() => product.value?.isRack || false);
const activeImage = ref("");
const quantity = ref(1);
const { addToQuote } = useQuoteCart();
const rackConfig = computed(() => rackData.value || defaultRackCalculator());
const settings = computed(() => settingsForRack(rackConfig.value, product.value));
const widths = computed(() => activeRackOptions(settings.value, "widths"));
const heights = computed(() => activeRackOptions(settings.value, "heights"));
const depths = computed(() => activeRackOptions(settings.value, "depths"));
const levelOptions = computed(() => activeRackOptions(settings.value, "levels"));
const loads = computed(() => activeRackOptions(settings.value, "loads"));
const width = ref(2000), height = ref(2000), depth = ref(1000), levels = ref(3), load = ref(600);
const availableValue = (values: number[], preferred: number) => values.includes(preferred) ? preferred : values[0]!;
watch(settings, value => {
  width.value = availableValue(widths.value, value.reference.width);
  height.value = availableValue(heights.value, value.reference.height);
  depth.value = availableValue(depths.value, value.reference.depth);
  levels.value = availableValue(levelOptions.value, value.reference.levels);
  load.value = availableValue(loads.value, value.reference.load);
}, { immediate: true });
const formatPrice = (value: number) => `$ ${value.toLocaleString("es-AR")}`;
const formatRange = (item: CatalogProduct) => { const [from,to] = productPriceRange(item); return from ? `${formatPrice(from)}${from !== to ? ` - ${formatPrice(to)}` : ""} + IVA` : "A cotizar + IVA"; };
const calculationFactor = computed(() => rackCalculationFactor(settings.value, { width: width.value, height: height.value, depth: depth.value, levels: levels.value, load: load.value }));
const commercialFactor = computed(() => 1 + rackConfig.value.markupPercent / 100);
const calculatedPriceFrom = computed(() => product.value ? Math.round(productPriceRange(product.value)[0] * calculationFactor.value * commercialFactor.value) : 0);
const calculatedPriceTo = computed(() => product.value ? Math.round(productPriceRange(product.value)[1] * calculationFactor.value * commercialFactor.value) : 0);
const calculatedRange = computed(() => isRack.value && product.value ? `${formatPrice(calculatedPriceFrom.value)}${calculatedPriceFrom.value !== calculatedPriceTo.value ? ` - ${formatPrice(calculatedPriceTo.value)}` : ""}` : "A cotizar");
const configurationDetails = computed(() => `Configuración: ${width.value} x ${height.value} x ${depth.value} mm, ${levels.value} niveles, ${load.value} kg por nivel`);
function addProduct() { if (product.value && !(isRack.value && rackError.value)) addToQuote({ name: product.value.name, price: isRack.value ? calculatedPriceFrom.value : productFinalPrice(product.value), details: isRack.value ? configurationDetails.value : product.value.description }, quantity.value); }
function requestQuote() { if (!product.value || (isRack.value && rackError.value)) return; const detail = isRack.value ? `${configurationDetails.value}, cantidad ${quantity.value}` : `Cantidad: ${quantity.value}`; window.open(`https://wa.me/5491131250453?text=${encodeURIComponent(`Hola! Quisiera cotizar ${product.value.name}. ${detail}`)}`, "_blank"); }
useHead(() => ({ title: product.value ? `${product.value.name} | Kraken` : "Producto | Kraken" }));
</script>
<style scoped>
.product-detail-page{min-height:100vh;background:var(--bg);color:var(--text)}.detail-main{width:min(1210px,90vw);margin:auto}.detail-layout{display:grid;grid-template-columns:1.1fr .9fr;gap:6vw;padding:64px 0 80px}.product-gallery{display:grid;grid-template-columns:98px 1fr;gap:15px}.gallery-thumbs{display:grid;align-content:start;gap:9px}.gallery-thumbs button{padding:0;aspect-ratio:1;border:1px solid var(--line);background:var(--surface);cursor:pointer}.gallery-thumbs button.active{border:2px solid var(--red-bright)}.gallery-thumbs img,.gallery-preview img{width:100%;height:100%;object-fit:cover}.gallery-preview{height:540px;border:1px solid var(--line);background:var(--surface)}.product-summary{padding-top:2px}.breadcrumbs{display:flex;align-items:center;gap:7px;margin-bottom:28px;color:var(--muted);font-size:14px}.breadcrumbs a:hover{color:var(--red-bright)}.eyebrow{color:var(--muted);font:13px "DM Mono";letter-spacing:.04em;text-transform:uppercase}.product-summary h1{max-width:610px;margin:15px 0 20px;font-size:clamp(32px,3.4vw,48px);line-height:1.08;letter-spacing:-.04em}.price-range{color:var(--red-bright);font-size:27px;font-weight:700}.rack-config{margin-top:32px;padding-top:22px;border-top:1px solid var(--line)}.config-copy{margin:12px 0 18px;color:var(--muted);font-size:15px;line-height:1.55}.calculator{padding:20px;border:1px solid var(--line);background:var(--surface)}.calculator-head{display:flex;justify-content:space-between;padding-bottom:15px;border-bottom:1px solid var(--line);color:var(--muted);font:13px "DM Mono"}.select-row{display:grid;gap:10px}.calculator label{display:grid;grid-template-columns:1fr 150px;align-items:center;gap:12px;margin-top:12px;color:var(--muted);font:13px "DM Mono";text-transform:uppercase}.calculator select{height:38px;margin:0;padding:0 10px;color:var(--text);border:1px solid var(--line);background:#121317}.estimate-result{display:flex;justify-content:space-between;align-items:end;margin:18px 0 0;padding-top:15px;border-top:1px solid var(--line)}.estimate-result span{color:var(--muted);font:13px "DM Mono"}.estimate-result strong{color:var(--red-bright);font-size:16px}.purchase-actions{display:grid;grid-template-columns:100px 1fr 1fr;gap:10px;margin-top:22px;padding-top:20px;border-top:1px solid var(--line)}.quantity{display:flex;align-items:center;justify-content:space-around;height:48px;border:1px solid var(--line);background:var(--surface)}.quantity button{display:grid;width:30px;height:100%;place-items:center;color:var(--text);border:0;background:transparent;cursor:pointer}.button{min-height:48px;border:0;cursor:pointer;font-weight:700}.button-primary{background:var(--red);color:#fff}.button-dark{background:#303238;color:#fff}.description-section{padding:65px 0 95px;border-top:1px solid var(--line)}.description-section h2{margin:14px 0 22px;font-size:32px}.description-section h2 em{color:var(--red-bright);font-style:normal}.description-section p:last-child{max-width:1000px;color:var(--muted);font-size:16px;line-height:1.75}.not-found{min-height:100vh;display:grid;place-content:center;justify-items:center;gap:20px;background:var(--bg);color:var(--text)}@media(max-width:800px){.detail-layout{display:block;padding-top:42px}.product-gallery{grid-template-columns:68px 1fr}.gallery-preview{height:70vw;min-height:280px}.product-summary{padding-top:35px}.purchase-actions{grid-template-columns:86px 1fr}.purchase-actions .button-dark{grid-column:2}}@media(max-width:520px){.detail-main{width:92vw}.product-summary h1{font-size:34px}.price-range{font-size:22px}.calculator label{grid-template-columns:1fr;gap:6px}.purchase-actions{grid-template-columns:80px 1fr}.gallery-thumbs{gap:7px}}
</style>
