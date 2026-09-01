<template>
  <main class="admin-page">
    <header class="admin-toolbar">
      <div><p class="eyebrow">Administracion / Productos</p><h1>Catalogo <em>editable.</em></h1></div>
      <div class="toolbar-actions"><NuxtLink class="button button-ghost" to="/">Ver sitio</NuxtLink><button class="button button-primary" @click="startNew">Nuevo producto <Plus :size="16" /></button><button class="icon-button" aria-label="Cerrar sesion" @click="logout"><LogOut :size="17" /></button></div>
    </header>
    <section class="admin-content">
      <div class="admin-list"><div class="list-heading"><p class="eyebrow">Productos cargados</p><strong>{{ productList.length }}</strong></div><p v-if="loadError" class="list-message error">No se pudo cargar la lista. Volvé a iniciar sesión.</p><p v-else-if="!productList.length" class="list-message">No hay productos cargados.</p><div v-for="product in productList" :key="product.slug" class="admin-product"><img :src="product.image" :alt="product.name" /><div><small>{{ product.code }} · {{ product.category }}</small><h2>{{ product.name }}</h2><p>{{ product.priceFrom ? `${format(product.priceFrom)} - ${format(product.priceTo)}` : "A cotizar" }} + IVA</p></div><div class="row-actions"><button class="icon-button" aria-label="Editar producto" @click="edit(product)"><Pencil :size="16" /></button><button class="icon-button danger" aria-label="Eliminar producto" @click="remove(product.slug)"><Trash2 :size="16" /></button></div></div></div>
      <form class="admin-form" @submit.prevent="save"><p class="eyebrow">{{ editing ? "Editar producto" : "Nuevo producto" }}</p><label>Nombre<input v-model="form.name" required /></label><div class="form-grid"><label>Slug<input v-model="form.slug" required /></label><label>Codigo<input v-model="form.code" required /></label></div><label>Categoria<select v-model="form.category"><option>Racks metalicos</option><option>Estanterias metalicas</option><option>Gondolas</option><option>Soluciones especiales</option></select></label><div class="form-grid"><label>Precio desde<input v-model.number="form.priceFrom" type="number" min="0" /></label><label>Precio hasta<input v-model.number="form.priceTo" type="number" min="0" /></label></div><p class="default-image-note">La imagen predeterminada se asigna automaticamente.</p><label>Descripcion tecnica<textarea v-model="form.technicalDescription" rows="5" /></label><button class="button button-primary full-button" :disabled="saving">{{ saving ? "Guardando..." : "Guardar producto" }} <Save :size="16" /></button></form>
    </section>
  </main>
</template>
<script setup lang="ts">
import { LogOut, Pencil, Plus, Save, Trash2 } from "lucide-vue-next";
import type { CatalogProduct } from "../../../data/products";
definePageMeta({ middleware: "admin" });
const productList = ref<CatalogProduct[]>([]); const editing = ref(false); const saving = ref(false); const loadError = ref(false); const form = reactive<Partial<CatalogProduct>>({ name: "", slug: "", code: "", category: "Racks metalicos", priceFrom: 0, priceTo: 0, technicalDescription: "" });
const format = (value = 0) => `$ ${value.toLocaleString("es-AR")}`;
async function load() { try { productList.value = await $fetch<CatalogProduct[]>("/api/admin/products"); loadError.value = false; } catch { productList.value = []; loadError.value = true; } }
function edit(product: CatalogProduct) { Object.assign(form, product); editing.value = true; }
function startNew() { Object.assign(form, { name: "", slug: "", code: "", category: "Racks metalicos", priceFrom: 0, priceTo: 0, technicalDescription: "" }); editing.value = false; }
async function save() { saving.value = true; try { const payload = { ...form, price: form.priceFrom || 0 }; if (editing.value) await $fetch(`/api/admin/products/${form.slug}`, { method: "PUT", body: payload }); else await $fetch("/api/admin/products", { method: "POST", body: payload }); await load(); startNew(); } finally { saving.value = false; } }
async function remove(slug: string) { if (!confirm("Eliminar este producto?")) return; await $fetch(`/api/admin/products/${slug}`, { method: "DELETE" }); await load(); }
async function logout() { await $fetch("/api/admin/logout", { method: "POST" }); await navigateTo("/admin/login"); }
await load();
</script>
<style scoped>
.admin-page{min-height:100vh;padding:42px 5vw;background:var(--bg);
color:var(--text)}
.admin-list{min-height:300px}
.list-heading{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--line)}
.list-heading .eyebrow{margin:0}
.list-heading strong{color:var(--red-bright);font-size:22px}
.list-message{padding:30px 0;color:var(--muted)}
.list-message.error{color:var(--red-bright)}
.admin-toolbar{display:flex;align-items:end;justify-content:space-between;gap:24px;max-width:1280px;margin:auto;padding-bottom:45px;border-bottom:1px solid var(--line)}.admin-toolbar h1{margin:15px 0 0;font-size:clamp(38px,5vw,68px)}.toolbar-actions{display:flex;align-items:center;gap:10px}.icon-button{display:grid;width:40px;height:40px;place-items:center;color:var(--text);border:1px solid var(--line);background:transparent;cursor:pointer}.icon-button:hover{color:var(--red-bright);border-color:var(--red)}.admin-content{display:grid;grid-template-columns:1fr 380px;gap:50px;max-width:1280px;margin:50px auto}.admin-list{display:grid;align-content:start;gap:10px}.admin-product{display:grid;grid-template-columns:76px 1fr auto;align-items:center;gap:18px;padding:13px;border:1px solid var(--line);background:var(--surface)}.admin-product img{width:76px;height:76px;object-fit:cover;background:#e5e5e5}.admin-product small{color:var(--muted);font:10px "DM Mono"}.admin-product h2{margin:7px 0;font-size:16px;letter-spacing:0}.admin-product p{margin:0;color:var(--red-bright);font-size:12px}.row-actions{display:flex;gap:7px}.danger:hover{color:#f87171;border-color:#f87171}.admin-form{display:grid;align-content:start;gap:14px;padding:24px;border:1px solid var(--line);background:var(--surface)}.admin-form label{display:grid;gap:7px;color:var(--muted);font:10px "DM Mono";text-transform:uppercase}.admin-form input,.admin-form select,.admin-form textarea{margin:0}.default-image-note{margin:0;color:var(--muted);font:11px "DM Mono"}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:800px){.admin-toolbar,.admin-content{display:block}.toolbar-actions{margin-top:25px;flex-wrap:wrap}.admin-form{margin-top:35px}.admin-page{padding:28px 5vw}}
</style>
