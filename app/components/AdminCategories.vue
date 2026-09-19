<template>
  <section class="category-manager">
    <div class="category-heading"><p>Categorías</p><span>{{ categories.length }}</span></div>
    <p class="category-help">Administrá las categorías disponibles para tus productos.</p>
    <form class="category-editor" @submit.prevent="save">
      <label>{{ editingId ? 'Editar categoría' : 'Nueva categoría' }}<input v-model="name" required maxlength="80" placeholder="Nombre de la categoría" /></label>
      <button type="submit" :disabled="busy">{{ editingId ? 'Guardar' : 'Agregar' }}</button>
      <button v-if="editingId" type="button" :disabled="busy" @click="reset">Cancelar</button>
    </form>
    <p v-if="message" role="status" class="category-message">{{ message }}</p>
    <div v-for="category in categories" :key="category.id" class="category-row">
      <div><strong>{{ category.name }}</strong><small>{{ count(category.id) }} productos</small></div>
      <button type="button" :disabled="busy" :aria-label="`Editar ${category.name}`" @click="editingId=category.id; name=category.name; message=''">Editar</button>
      <button type="button" :disabled="busy" :aria-label="`Eliminar ${category.name}`" @click="remove(category)">Eliminar</button>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { ProductCategory } from "../../data/categories";
import { categoryForProduct } from "../../data/categories";
import type { CatalogProduct } from "../../data/products";
const props = defineProps<{ categories: ProductCategory[]; products: CatalogProduct[] }>();
const emit = defineEmits<{ changed: [] }>();
const name = ref(""), editingId = ref(""), busy = ref(false), message = ref("");
const count = (id: string) => props.products.filter(product => categoryForProduct(product, props.categories)?.id === id).length;
const reset = () => { name.value = ""; editingId.value = ""; };
function errorText(error: any) { return error?.data?.statusMessage || "No pudimos guardar el cambio. Intentá nuevamente."; }
async function save() {
  busy.value = true; message.value = "";
  try {
    if (editingId.value) await $fetch(`/api/admin/categories/${encodeURIComponent(editingId.value)}`, { method: "PUT", body: { name: name.value } });
    else await $fetch("/api/admin/categories", { method: "POST", body: { name: name.value } });
    reset(); emit("changed"); message.value = "Categoría guardada.";
  } catch (error) { message.value = errorText(error); }
  finally { busy.value = false; }
}
async function remove(category: ProductCategory) {
  if (count(category.id)) { message.value = "Esta categoría tiene productos asociados. Reasignalos antes de eliminarla."; return; }
  if (!confirm(`¿Eliminar la categoría «${category.name}»?`)) return;
  busy.value = true; message.value = "";
  try {
    await $fetch(`/api/admin/categories/${encodeURIComponent(category.id)}`, { method: "DELETE" });
    if (editingId.value === category.id) reset();
    emit("changed"); message.value = "Categoría eliminada.";
  } catch (error) { message.value = errorText(error); }
  finally { busy.value = false; }
}
</script>
<style scoped>
.category-manager{margin-top:24px;padding:20px;border:1px solid var(--line);background:var(--surface)}.category-heading{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.category-heading p{color:var(--red-bright);font:13px "DM Mono";text-transform:uppercase}.category-heading span{color:var(--muted)}.category-help,.category-message{font-size:15px;line-height:1.5;color:var(--muted)}.category-message{color:var(--red-bright)}.category-editor{display:flex;align-items:end;gap:8px;margin:18px 0}.category-editor label{display:grid;flex:1;min-width:0;gap:7px;color:var(--muted);font:13px "DM Mono";text-transform:uppercase}.category-editor input{width:100%;min-width:0;box-sizing:border-box;margin:0}.category-manager button{min-height:40px;padding:8px 10px;border:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer;font:13px "DM Mono"}.category-manager button:hover{border-color:var(--red);color:var(--red-bright)}.category-manager button:disabled{opacity:.5;cursor:wait}.category-row{display:flex;align-items:center;gap:8px;padding:12px 0;border-top:1px solid var(--line)}.category-row>div{flex:1;min-width:0;overflow-wrap:anywhere}.category-row strong{display:block;font-size:16px}.category-row small{display:block;margin-top:5px;color:var(--muted);font:13px "DM Mono"}@media(max-width:520px){.category-editor{flex-wrap:wrap}.category-editor label{flex-basis:100%}.category-row{flex-wrap:wrap}.category-row>div{flex-basis:100%}}
</style>
