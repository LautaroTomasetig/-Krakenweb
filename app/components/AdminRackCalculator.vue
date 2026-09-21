<template>
  <section class="rack-admin">
    <p v-if="error" class="rack-message" role="alert">No pudimos cargar la configuración. <button type="button" @click="refresh">Reintentar</button></p>
    <p v-else-if="!config" class="rack-help" role="status">Cargando configuración...</p>
    <form v-if="config" @submit.prevent="save">
      <div class="rack-top">
        <label>¿De qué producto?<select :value="selectedId" @change="selectRack(($event.target as HTMLSelectElement).value)"><option value="">Opciones generales</option><option v-for="product in racks" :key="product.id" :value="product.id">{{ product.name }}</option></select></label>
        <p class="rack-help">Precio = costo con la ganancia del producto + los cinco ajustes seleccionados. Los ajustes son importes de venta y se suman sin aplicarles otra ganancia.</p>
      </div>
      <p class="rack-help">Las opciones generales se aplican a los racks sin configuración propia. Definí el ajuste y la opción inicial de cada grupo. Las opciones iniciales pueden tener ajustes distintos de cero.</p>
      <button v-if="selectedId" type="button" class="rack-secondary" @click="useGeneral">Volver a las opciones generales para este rack</button>
      <div class="rack-groups">
        <section v-for="group in rackOptionGroups" :key="group.key" class="rack-card">
          <div class="rack-heading"><h2>{{ group.label }}</h2><span>{{ group.unit }}</span></div>
          <div v-for="(option,index) in current.options[group.key]" :key="option.id" class="rack-option" :class="{'is-inactive':!option.active}">
            <label>{{ group.unit }}<input v-model.number="option.value" type="number" min="1" step="1" required :aria-label="group.label + ', opción ' + (index+1)" /></label>
            <label>Ajuste de precio ($)<input :value="option.priceAdjustment" type="number" step="any" placeholder="Pendiente" :aria-label="'Ajuste de ' + group.label + ', opción ' + (index+1)" @input="setAdjustment(option,$event)" /></label>
            <label class="rack-toggle"><input v-model="option.active" type="checkbox" @change="clearInvalidDefault(group.key)" /> Activa</label>
            <button type="button" class="rack-icon" :aria-label="'Eliminar opción ' + option.value + ' de ' + group.label" @click="removeOption(group.key,index)"><Trash2 :size="15" /></button>
          </div>
          <button type="button" class="rack-secondary" @click="addOption(group.key)"><Plus :size="14" /> Agregar opción</button>
          <label class="rack-initial">Opción inicial<select v-model="current.defaultOptionIds[group.key]"><option value="">Elegir opción inicial</option><option v-for="option in activeRackOptions(current,group.key)" :key="option.id" :value="option.id">{{ option.value }} {{ group.unit }}</option></select></label>
        </section>
      </div>
      <p v-if="currentIssue" class="rack-message" role="status">Configuración pendiente: {{ currentIssue }} Podés guardar el avance; no se publicará un precio hasta completar los ajustes de las opciones activas y las opciones iniciales.</p>
      <p v-if="selectedProduct && preview.ready" class="rack-help">Precio inicial de {{ selectedProduct.name }}: <strong>{{ formatPrice(preview.price) }} + IVA</strong></p>
      <p v-for="issue in priceIssues" :key="issue" class="rack-message" role="alert">{{ issue }}</p>
      <div class="rack-save"><p role="status">{{ message || (dirty ? 'Tenés cambios sin guardar.' : 'Sin cambios pendientes.') }}</p><button type="submit" class="button button-primary" :disabled="saving || !dirty || !!priceIssues.length">{{ saving ? 'Guardando...' : 'Guardar configuración' }} <Save :size="16" /></button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { Plus, Save, Trash2 } from "lucide-vue-next";
import type { CatalogProduct } from "../../data/products";
import { rackOptionGroups, settingsForRack, activeRackOptions, calculateRackPrice, rackSettingsIssue, rackPriceIssue, type RackCalculatorConfig, type RackOptionKey, type RackOption } from "../../data/rack-calculator";
const props = defineProps<{ products: CatalogProduct[] }>();
const { data, error, refresh } = useFetch<RackCalculatorConfig>("/api/admin/rack-calculator", { key: "admin-rack-calculator" });
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const config = ref<RackCalculatorConfig | null>(null), selectedId = ref(""), saved = ref(""), saving = ref(false), message = ref("");
watch(data, value => { if (value) { config.value = copy(value); saved.value = JSON.stringify(value); } }, { immediate: true });
const racks = computed(() => props.products.filter(product => product.isRack && product.id));
const selectedProduct = computed(() => racks.value.find(product => product.id === selectedId.value));
const current = computed(() => settingsForRack(config.value!, { id: selectedId.value }));
const currentIssue = computed(() => config.value ? rackSettingsIssue(current.value) : null);
const preview = computed(() => calculateRackPrice(selectedProduct.value, current.value));
const priceIssues = computed(() => !config.value ? [] : racks.value.flatMap(product => {
  const settings = settingsForRack(config.value!, product);
  if (rackSettingsIssue(settings)) return [];
  const issue = rackPriceIssue(product, settings);
  return issue ? [product.name + ': ' + issue] : [];
}));
const dirty = computed(() => !!config.value && JSON.stringify(config.value) !== saved.value);
const formatPrice = (value: number) => '$ ' + value.toLocaleString('es-AR');
function selectRack(id: string) {
  if (!config.value) return;
  if (id && !config.value.overrides[id]) config.value.overrides[id] = copy(settingsForRack(config.value, { id }));
  if (id) config.value.overrides[id]!.useDefaults = false;
  selectedId.value = id; message.value = "";
}
function useGeneral() { if (!config.value) return; config.value.overrides[selectedId.value]!.useDefaults = true; selectedId.value = ""; message.value = "Guardá para aplicar las opciones generales. La configuración propia se conserva."; }
function clearInvalidDefault(key: RackOptionKey) { if (!activeRackOptions(current.value,key).some(option => option.id === current.value.defaultOptionIds[key])) current.value.defaultOptionIds[key] = ""; message.value = ""; }
function removeOption(key: RackOptionKey,index: number) { current.value.options[key].splice(index,1); clearInvalidDefault(key); }
function setAdjustment(option: RackOption,event: Event) { const input = event.target as HTMLInputElement; option.priceAdjustment = input.value === "" ? null : input.valueAsNumber; message.value = ""; }
function addOption(key: RackOptionKey) {
  const values = current.value.options[key].map(option => option.value);
  current.value.options[key].push({ id: crypto.randomUUID(), value: values.length ? Math.max(...values) + 1 : 1, active: true, priceAdjustment: null });
  message.value = "";
}
async function save() {
  if (priceIssues.value.length) return;
  saving.value = true; message.value = "";
  try {
    const result = await $fetch<RackCalculatorConfig>("/api/admin/rack-calculator", { method: "PUT", body: config.value });
    data.value = result; config.value = copy(result); saved.value = JSON.stringify(result);
    message.value = rackSettingsIssue(current.value) ? "Avance guardado. Esta configuración sigue pendiente." : "Configuración guardada.";
    await refreshNuxtData(["rack-calculator", "catalog-products"]);
  } catch (error: any) { message.value = error?.data?.statusMessage || "No pudimos guardar la configuración. Intentá nuevamente."; }
  finally { saving.value = false; }
}
</script>
<style scoped>
.rack-admin{max-width:1280px;margin:34px auto 60px}.rack-top,.rack-reference{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.rack-admin label{display:grid;gap:8px;color:var(--muted);font:13px "DM Mono";text-transform:uppercase}.rack-admin input,.rack-admin select{width:100%;min-width:0;box-sizing:border-box;margin:0}.rack-admin small,.rack-help{color:var(--muted);font:13px/1.6 sans-serif;text-transform:none}.rack-help{margin:16px 0}.rack-groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:24px 0}.rack-card{padding:20px;border:1px solid var(--line);background:var(--surface)}.rack-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line)}.rack-heading h2{margin:0;font-size:16px}.rack-heading span{color:var(--muted);font:13px "DM Mono"}.rack-option{display:grid;grid-template-columns:minmax(0,1fr) auto 36px;align-items:center;gap:10px;margin-bottom:10px}.rack-option.is-inactive>input{opacity:.5}.rack-admin .rack-toggle{display:flex;align-items:center;gap:6px;white-space:nowrap}.rack-toggle input{width:16px;height:16px;accent-color:var(--red)}.rack-icon,.rack-secondary{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:8px 10px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;font:13px "DM Mono"}.rack-icon:hover,.rack-secondary:hover{border-color:var(--red);color:var(--red-bright)}.rack-parameters summary{cursor:pointer;font-size:16px}.rack-save{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:22px}.rack-save p,.rack-message{font-size:15px;color:var(--red-bright)}.rack-save button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:1000px){.rack-groups{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.rack-top,.rack-reference,.rack-groups{grid-template-columns:1fr}.rack-save{align-items:stretch;flex-direction:column;gap:8px}.rack-save button{justify-content:center}.rack-card{padding:16px}}
.rack-top>label{align-content:start}
.rack-top>label>input,.rack-top>label>select{height:42px}
</style>

<style scoped>
.rack-option{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:end}.rack-option .rack-toggle{justify-self:start}.rack-option .rack-icon{justify-self:end}.rack-initial{margin-top:18px}.rack-top>.rack-help{margin-top:0}
</style>
