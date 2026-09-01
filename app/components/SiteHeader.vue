<template>
  <header class="site-header" :class="{ 'site-header-scrolled': hasScrolled }">
    <NuxtLink class="brand" to="/" aria-label="Kraken Group inicio">
      <img src="/img/logo-kraken.png" alt="Kraken Group Logo" class="brand-logo" />
    </NuxtLink>
    <nav class="desktop-nav" aria-label="Navegación principal">
      <NuxtLink class="nav-featured" to="/catalogo?categoria=racks">RACKS</NuxtLink>
      <NuxtLink to="/#servicios">Servicios</NuxtLink>
      <NuxtLink to="/#galeria">Galería</NuxtLink>
      <NuxtLink to="/catalogo">Catálogo</NuxtLink>
      <NuxtLink to="/#nosotros">Nosotros</NuxtLink>
      <NuxtLink to="/#contacto">Contacto</NuxtLink>
      <NuxtLink class="admin-link" to="/admin/login">Admin</NuxtLink>
    </nav>
    <button class="quote-cart" aria-label="Abrir carrito de cotización" @click="openQuoteCart">
      <ShoppingCart :size="19" /><strong>{{ formatPrice(quoteTotal) }}</strong>
      <span class="quote-cart-count">{{ quoteItemCount }}</span>
    </button>
    <button class="menu-toggle" aria-label="Abrir menú" @click="mobileMenuOpen = !mobileMenuOpen">
      <Menu :size="22" />
    </button>
    <nav v-if="mobileMenuOpen" class="mobile-nav">
      <NuxtLink class="nav-featured" to="/catalogo?categoria=racks" @click="mobileMenuOpen = false">RACKS</NuxtLink>
      <NuxtLink to="/#servicios" @click="mobileMenuOpen = false">Servicios</NuxtLink>
      <NuxtLink to="/#galeria" @click="mobileMenuOpen = false">Galería</NuxtLink>
      <NuxtLink to="/catalogo" @click="mobileMenuOpen = false">Catálogo</NuxtLink>
      <NuxtLink to="/#nosotros" @click="mobileMenuOpen = false">Nosotros</NuxtLink>
      <NuxtLink to="/#contacto" @click="mobileMenuOpen = false">Contacto</NuxtLink>
      <NuxtLink class="admin-link" to="/admin/login" @click="mobileMenuOpen = false">Admin</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { Menu, ShoppingCart } from "lucide-vue-next";

const { quoteTotal, quoteItemCount, openQuoteCart } = useQuoteCart();
const mobileMenuOpen = ref(false);
const hasScrolled = ref(false);
const formatPrice = (value: number) => value ? `$ ${value.toLocaleString("es-AR")}` : "$0";
function updateHeaderOnScroll() { hasScrolled.value = window.scrollY > 80; }
onMounted(() => window.addEventListener("scroll", updateHeaderOnScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", updateHeaderOnScroll));
</script>

