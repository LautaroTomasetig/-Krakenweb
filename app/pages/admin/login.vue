<template>
  <main class="admin-page admin-login"><section class="admin-panel"><img src="/img/logo-kraken.png" alt="Kraken Group" /><p class="eyebrow">Acceso restringido</p><h1>Panel<br /><em>Kraken.</em></h1><form @submit.prevent="login"><label>Email<input v-model="email" type="email" autocomplete="username" required /></label><label>Contraseña<input v-model="password" type="password" autocomplete="current-password" required /></label><p v-if="error" class="form-error">{{ error }}</p><button class="button button-primary full-button" :disabled="loading">{{ loading ? "Validando..." : "Ingresar" }} <ArrowRight :size="16" /></button></form><NuxtLink to="/" class="home-link"><ArrowLeft :size="15" /> Volver al inicio</NuxtLink></section></main>
</template>
<script setup lang="ts">
import { ArrowLeft, ArrowRight } from "lucide-vue-next";
const email = ref(""); const password = ref(""); const error = ref(""); const loading = ref(false);
async function login() { loading.value = true; error.value = ""; try { await $fetch("/api/admin/login", { method: "POST", body: { email: email.value, password: password.value } }); await navigateTo("/admin/productos"); } catch { error.value = "No se pudo validar el acceso."; } finally { loading.value = false; } }
useHead({ title: "Acceso admin | Kraken" });
</script>
<style scoped>
.admin-page{min-height:100vh;background:var(--bg);color:var(--text);display:grid;place-items:center;padding:24px}.admin-panel{width:min(450px,100%);padding:42px;border:1px solid var(--line);background:var(--surface)}.admin-panel>img{width:auto;height:36px;margin-bottom:65px}.admin-panel h1{font-size:55px;margin:15px 0 35px}.admin-panel form{display:grid;gap:16px}.admin-panel label{display:grid;gap:8px;color:var(--muted);font:11px "DM Mono";text-transform:uppercase}.admin-panel input{margin:0}.form-error{margin:0;color:var(--red-bright);font-size:12px}.home-link{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:22px;color:var(--muted);font:11px "DM Mono";text-transform:uppercase}.home-link:hover{color:var(--red-bright)}
</style>
