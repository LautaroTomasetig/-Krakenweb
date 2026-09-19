<template>
  <section class="rack-admin">
    <p v-if="error" class="rack-message" role="alert">No pudimos cargar la configuración. <button type="button" @click="reload">Reintentar</button></p>
    <p v-else-if="!config" class="rack-help" role="status">Cargando configuración...</p>
    <form v-if="config" @submit.prevent="save">
      <div class="rack-top">
        <label>De que producto?<select :value="selectedId" @change="selectRack(($event.target as HTMLSelectElement).value)"><option value="">Opciones generales</option><option v-for="product in racks" :key="product.id" :value="product.id">{{ product.name }}</option></select></label>
        <label>PORCENTAJE AGREGADO AL PRECIO (%)<input v-model.number="config.markupPercent" type="number" min="0" step="any" required /><small>Se agrega al importe estimado de todos los racks.</small></label>
      </div>
      <p class="rack-help">Las opciones generales se aplican a los racks sin configuración propia. Podés configurar cada rack desde el selector.</p>
      <button v-if="selectedId" type="button" class="rack-secondary" @click="useGeneral">Volver a las opciones generales para este rack</button>
      <div class="rack-groups">
        <section v-for="group in rackOptionGroups" :key="group.key" class="rack-card">
          <div class="rack-heading"><h2>{{ group.label }}</h2><span>{{ group.unit }}</span></div>
          <div v-for="(option,index) in current.options[group.key]" :key="option.id" class="rack-option" :class="{'is-inactive':!option.active}">
            <input v-model.number="option.value" type="number" min="1" step="1" required :aria-label="`${group.label}, opción ${index+1}, ${group.unit}`" />
            <label class="rack-toggle"><input v-model="option.active" type="checkbox" /> Activa</label>
            <button type="button" class="rack-icon" :aria-label="`Eliminar opción ${option.value} de ${group.label}`" @click="current.options[group.key].splice(index,1)"><Trash2 :size="15" /></button>
          </div>
          <button type="button" class="rack-secondary" @click="addOption(group.key)"><Plus :size="14" /> Agregar opción</button>
        </section>
      </div>
      <details class="rack-card rack-parameters">
        <summary>Valores de referencia del cálculo</summary>
        <p class="rack-help">Estas medidas representan la configuración base del precio. Cambiarlas modifica las estimaciones. La fórmula se mantiene fija.</p>
        <div class="rack-reference">
          <label v-for="group in rackOptionGroups" :key="group.key">{{ group.label }} de referencia ({{ group.unit }})<input v-model.number="current.reference[group.reference]" type="number" min="1" step="1" required /></label>
          <label>Factor mínimo total<input v-model.number="current.minimumFactor" type="number" min="0.01" max="1" step="any" required /><small>Actual por defecto: 0,65.</small></label>
          <label>Factor mínimo de carga<input v-model.number="current.minimumLoadFactor" type="number" min="0.01" max="1" step="any" required /><small>Actual por defecto: 0,70.</small></label>
        </div>
        <p v-if="!selectedId" class="rack-help">Los racks existentes conservan sus medidas base propias. Para cambiarlas, seleccioná el rack.</p>
      </details>
      <div class="rack-save"><p role="status">{{ message || (dirty ? 'Tenés cambios sin guardar.' : 'Configuración actualizada.') }}</p><button type="submit" class="button button-primary" :disabled="saving || !dirty">{{ saving ? 'Guardando...' : 'Guardar configuración' }} <Save :size="16" /></button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { Plus, Save, Trash2 } from "lucide-vue-next";
import type { CatalogProduct } from "../../data/products";
import { rackOptionGroups, settingsForRack, type RackCalculatorConfig, type RackOptionKey } from "../../data/rack-calculator";
const props = defineProps<{ products: CatalogProduct[] }>();
const { data, error, refresh } = useFetch<RackCalculatorConfig>("/api/admin/rack-calculator");
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const config = ref<RackCalculatorConfig | null>(null), selectedId = ref(""), saved = ref(""), saving = ref(false), message = ref("");
watch(data, value => { if (value) { config.value = copy(value); saved.value = JSON.stringify(value); selectedId.value = ""; } }, { immediate: true });
const racks = computed(() => props.products.filter(product => product.isRack && product.id));
const current = computed(() => config.value!.overrides[selectedId.value] || config.value!.defaults);
const dirty = computed(() => !!config.value && JSON.stringify(config.value) !== saved.value);
function selectRack(id: string) {
  if (!config.value) return;
  if (id && !config.value.overrides[id]) config.value.overrides[id] = copy(settingsForRack(config.value, racks.value.find(product => product.id === id)));
  selectedId.value = id; message.value = "";
}
function useGeneral() { if (config.value) delete config.value.overrides[selectedId.value]; selectedId.value = ""; message.value = "Guardá para aplicar las opciones generales."; }
function addOption(key: RackOptionKey) {
  const values = current.value.options[key].map(option => option.value);
  current.value.options[key].push({ id: crypto.randomUUID(), value: values.length ? Math.max(...values) + 1 : 1, active: true });
  message.value = "";
}
async function reload() { await refresh(); }
async function save() {
  saving.value = true; message.value = "";
  try {
    const result = await $fetch<RackCalculatorConfig>("/api/admin/rack-calculator", { method: "PUT", body: config.value });
    config.value = copy(result); saved.value = JSON.stringify(result); message.value = "Configuración guardada.";
  } catch (error: any) { message.value = error?.data?.statusMessage || "No pudimos guardar la configuración. Intentá nuevamente."; }
  finally { saving.value = false; }
}
</script>
<style scoped>
.rack-admin{max-width:1280px;margin:34px auto 60px}.rack-top,.rack-reference{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.rack-admin label{display:grid;gap:8px;color:var(--muted);font:13px "DM Mono";text-transform:uppercase}.rack-admin input,.rack-admin select{width:100%;min-width:0;box-sizing:border-box;margin:0}.rack-admin small,.rack-help{color:var(--muted);font:13px/1.6 sans-serif;text-transform:none}.rack-help{margin:16px 0}.rack-groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:24px 0}.rack-card{padding:20px;border:1px solid var(--line);background:var(--surface)}.rack-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line)}.rack-heading h2{margin:0;font-size:16px}.rack-heading span{color:var(--muted);font:13px "DM Mono"}.rack-option{display:grid;grid-template-columns:minmax(0,1fr) auto 36px;align-items:center;gap:10px;margin-bottom:10px}.rack-option.is-inactive>input{opacity:.5}.rack-admin .rack-toggle{display:flex;align-items:center;gap:6px;white-space:nowrap}.rack-toggle input{width:16px;height:16px;accent-color:var(--red)}.rack-icon,.rack-secondary{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:8px 10px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;font:13px "DM Mono"}.rack-icon:hover,.rack-secondary:hover{border-color:var(--red);color:var(--red-bright)}.rack-parameters summary{cursor:pointer;font-size:16px}.rack-save{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:22px}.rack-save p,.rack-message{font-size:15px;color:var(--red-bright)}.rack-save button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:1000px){.rack-groups{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.rack-top,.rack-reference,.rack-groups{grid-template-columns:1fr}.rack-save{align-items:stretch;flex-direction:column;gap:8px}.rack-save button{justify-content:center}.rack-card{padding:16px}}
.rack-top>label{align-content:start}
.rack-top>label>input,.rack-top>label>select{height:42px}
</style>
