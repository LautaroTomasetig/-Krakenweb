<template>
  <div class="catalog-page">
    <header v-if="!embedded" class="catalog-header">
      <NuxtLink class="brand" to="/"
        ><img src="/img/logo-kraken.png" alt="Kraken Group"
      /></NuxtLink>
      <nav>
        <NuxtLink to="/">Inicio</NuxtLink><a href="#productos">Productos</a
        ><a href="#contacto">Contacto</a>
      </nav>
      <button
        class="cart-trigger"
        aria-label="Abrir carrito"
        @click="cartOpen = true"
      >
        <ShoppingCart :size="20" /><span>{{ formatPrice(quoteTotal) }}</span
        ><b>{{ quoteItemCount }}</b>
      </button>
    </header>

    <main>
      <section v-if="!embedded" class="catalog-hero">
        <div>
          <p class="eyebrow">Catálogo Kraken / 2026</p>
          <h1>Productos que<br /><em>trabajan duro.</em></h1>
          <p class="hero-intro">
            Soluciones de almacenamiento y piezas industriales listas para
            integrarse a tu operación.
          </p>
        </div>
        <div class="hero-stamp">
          FABRICADO<br />BAJO PLANO<br /><strong>01—06</strong>
        </div>
      </section>
      <section id="catalogo" class="catalog-content">
        <aside class="filters">
          <div class="filter-heading">
            <h2>Categorías</h2>
            <span>{{ filteredProducts.length }} productos</span>
          </div>
          <button
            v-for="category in categories"
            :key="category"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }} <span>{{ categoryCount(category) }}</span>
          </button>
          <div class="filter-divider" />
          <h2>Filtrar por precio</h2>
          <label class="price-label"
            >Hasta {{ formatPrice(maxPrice)
            }}<input
              v-model.number="maxPrice"
              type="range"
              min="0"
              max="250000"
              step="5000" /></label
          ><button class="reset-filter" @click="resetFilters">
            Restablecer filtros
          </button>
        </aside>
        <div class="products-area">
          <div class="products-toolbar">
            <label
              ><Search :size="17" /><input
                v-model="searchQuery"
                type="search"
                placeholder="Buscar producto..."
            /></label>
            <div>
              <span>Ordenar por</span
              ><select v-model="sortOrder">
                <option value="featured">Destacados</option>
                <option value="low">Precio menor</option>
                <option value="high">Precio mayor</option>
              </select>
            </div>
          </div>
          <div class="product-grid">
            <article
              v-for="product in filteredProducts"
              :key="product.code"
              class="product-card"
            >
              <div class="product-image">
                <img
                  :src="product.image"
                  :alt="product.name"
                  loading="lazy"
                /><span>{{ product.code }}</span
                ><button
                  aria-label="Agregar producto"
                  @click="addProduct(product)"
                >
                  <Plus :size="20" />
                </button>
              </div>
              <div class="product-details">
                <small>{{ product.description }}</small>
                <h3>{{ product.name }}</h3>
                <div class="product-bottom">
                  <strong>{{ formatPrice(product.price) }}</strong
                  ><button class="add-button" @click="addProduct(product)">
                    Agregar <ArrowUpRight :size="15" />
                  </button>
                </div>
              </div>
            </article>
            <p v-if="!filteredProducts.length" class="no-products">
              No encontramos productos con esos filtros.
            </p>
          </div>
        </div>
      </section>
    </main>

    <div
      v-if="cartOpen && !embedded"
      class="backdrop"
      @click.self="cartOpen = false"
    >
      <aside class="cart-drawer">
        <button
          class="close-button"
          aria-label="Cerrar carrito"
          @click="cartOpen = false"
        >
          <X :size="18" />
        </button>
        <p class="eyebrow">Tu cotización</p>
        <h2>
          Carrito <span>{{ quoteItemCount }}</span>
        </h2>
        <div v-if="quoteItems.length" class="cart-list">
          <div v-for="item in quoteItems" :key="item.name" class="cart-item">
            <div>
              <strong>{{ item.name }}</strong
              ><small>{{ formatPrice(item.price) }} c/u</small>
            </div>
            <div class="quantity">
              <button @click="updateQuoteQuantity(item.name, -1)">
                <Minus :size="13" /></button
              ><span>{{ item.quantity }}</span
              ><button @click="updateQuoteQuantity(item.name, 1)">
                <Plus :size="13" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="cart-empty">
          <ShoppingCart :size="28" />
          <p>Tu carrito está vacío.<br />Agregá productos para comenzar.</p>
        </div>
        <div class="cart-total">
          <span>Total estimado</span
          ><strong>{{ formatPrice(quoteTotal) }}</strong>
        </div>
        <button
          class="send-button"
          :disabled="!quoteItems.length"
          @click="sendQuote"
        >
          Solicitar cotización <Send :size="16" /></button
        ><button
          v-if="quoteItems.length"
          class="clear-button"
          @click="clearQuote"
        >
          Vaciar carrito
        </button>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowUpRight,
  Minus,
  Plus,
  Search,
  Send,
  ShoppingCart,
  X,
} from "lucide-vue-next";
import { products, type CatalogProduct } from "../../data/products";

const props = defineProps<{ embedded?: boolean }>();
const embedded = computed(() => props.embedded === true);
const {
  quoteItems,
  quoteTotal,
  quoteItemCount,
  addToQuote,
  updateQuoteQuantity,
  clearQuote,
} = useQuoteCart();
const cartOpen = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("Todos");
const maxPrice = ref(250000);
const sortOrder = ref("featured");
const categories = [
  "Todos",
  "Racks metálicos",
  "Estanterías metálicas",
  "Góndolas",
  "Soluciones especiales",
];
const formatPrice = (value: number) =>
  value ? `$ ${value.toLocaleString("es-AR")}` : "A cotizar";
const filteredProducts = computed(() =>
  products
    .filter(
      (product) =>
        (selectedCategory.value === "Todos" ||
          product.category === selectedCategory.value) &&
        product.price <= maxPrice.value &&
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .sort((a, b) =>
      sortOrder.value === "low"
        ? a.price - b.price
        : sortOrder.value === "high"
          ? b.price - a.price
          : 0,
    ),
);
const categoryCount = (category: string) =>
  category === "Todos"
    ? products.length
    : products.filter((product) => product.category === category).length;
function addProduct(product: CatalogProduct) {
  addToQuote({
    name: product.name,
    price: product.price,
    details: product.description,
  });
  cartOpen.value = true;
}
function resetFilters() {
  selectedCategory.value = "Todos";
  maxPrice.value = 250000;
  searchQuery.value = "";
  sortOrder.value = "featured";
}
function sendQuote() {
  const items = quoteItems.value
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join("\n");
  window.open(
    `https://wa.me/5491131250453?text=${encodeURIComponent(`Hola! Quisiera cotizar:\n${items}`)}`,
    "_blank",
  );
}
useHead({
  title: "Catálogo | Kraken",
  meta: [
    {
      name: "description",
      content: "Catálogo de productos industriales Kraken.",
    },
  ],
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap");
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  background: #0f0f12;
  color: #f3f4f6;
  font-family: "Space Grotesk", sans-serif;
}
:global(button),
:global(input),
:global(select) {
  font: inherit;
}
.catalog-page {
  min-height: 100vh;
  --bg: #0f0f12;
  --surface: #18191e;
  --line: #2a2d34;
  --muted: #9ca3af;
  --red: #dc2626;
  background:
    radial-gradient(
      circle at 90% 15%,
      rgba(220, 38, 38, 0.13),
      transparent 25rem
    ),
    var(--bg);
}
.catalog-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
  padding: 0 5vw;
  background: rgba(15, 15, 18, 0.9);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px);
}
.brand img {
  display: block;
  width: auto;
  height: 36px;
}
.catalog-header nav {
  display: flex;
  gap: 30px;
  color: var(--muted);
  font-size: 13px;
}
.catalog-header nav a:hover {
  color: #ef4444;
}
.cart-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 15px;
  color: #fff;
  border: 1px solid #ef4444;
  background: var(--red);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition:
    transform 0.25s,
    background 0.25s;
}
.cart-trigger:hover {
  background: #ef4444;
  transform: translateY(-2px);
}
.cart-trigger b {
  position: absolute;
  top: -9px;
  right: -9px;
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  color: var(--red);
  font-size: 11px;
}
.catalog-content {
  display: grid;
  grid-template-columns: 235px 1fr;
  gap: 45px;
  width: min(1280px, 90vw);
  margin: 0 auto;
  padding: 90px 0 120px;
}
.filters {
  color: var(--muted);
}
.filter-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 25px;
}
.filters h2 {
  margin: 0;
  color: #f3f4f6;
  font-size: 18px;
  letter-spacing: -0.03em;
}
.filter-heading span {
  font: 10px "DM Mono";
}
.filters > button {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 15px 0;
  color: var(--muted);
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
}
.filters > button:hover,
.filters > button.active {
  color: #ef4444;
}
.filters > button span {
  color: #6b7280;
}
.filter-divider {
  height: 1px;
  margin: 44px 0 28px;
  background: var(--line);
}
.price-label {
  display: grid;
  gap: 17px;
  margin-top: 23px;
  color: var(--muted);
  font: 11px "DM Mono";
}
input[type="range"] {
  width: 100%;
  accent-color: var(--red);
}
.reset-filter,
.clear-button {
  margin-top: 25px;
  padding: 0;
  color: #ef4444;
  border: 0;
  background: none;
  cursor: pointer;
  font: 11px "DM Mono";
  text-transform: uppercase;
}
.products-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 30px;
}
.products-toolbar label {
  position: relative;
  display: flex;
  align-items: center;
  width: min(360px, 100%);
}
.products-toolbar label svg {
  position: absolute;
  left: 13px;
  color: #ef4444;
}
.products-toolbar input,
.products-toolbar select {
  height: 42px;
  color: #f3f4f6;
  border: 1px solid var(--line);
  background: var(--surface);
  outline: 0;
}
.products-toolbar input {
  width: 100%;
  padding: 0 14px 0 40px;
}
.products-toolbar select {
  margin-left: 8px;
  padding: 0 10px;
}
.products-toolbar > div {
  color: var(--muted);
  font: 11px "DM Mono";
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.product-card {
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--surface);
  animation: rise 0.55s both;
  transition:
    transform 0.3s,
    border-color 0.3s;
}
.product-card:hover {
  border-color: #ef4444;
  transform: translateY(-5px);
}
.product-image {
  position: relative;
  height: 245px;
  overflow: hidden;
  background: #e5e5e5;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.75) contrast(1.05);
  transition: transform 0.5s;
}
.product-card:hover img {
  transform: scale(1.06);
}
.product-image > span {
  position: absolute;
  top: 13px;
  left: 13px;
  padding: 5px 7px;
  color: #fff;
  background: rgba(15, 15, 18, 0.78);
  font: 10px "DM Mono";
}
.product-image > button {
  position: absolute;
  right: 13px;
  bottom: 13px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  color: #fff;
  border: 0;
  background: var(--red);
  cursor: pointer;
}
.product-details {
  padding: 18px;
}
.product-details small {
  color: var(--muted);
  font: 10px "DM Mono";
  text-transform: uppercase;
}
.product-details h3 {
  min-height: 43px;
  margin: 9px 0 20px;
  font-size: 16px;
  line-height: 1.3;
}
.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.product-bottom strong {
  font-size: 14px;
}
.add-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  color: #ef4444;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.no-products {
  grid-column: 1 / -1;
  padding: 60px 0;
  color: var(--muted);
  text-align: center;
}
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  justify-content: end;
  background: rgba(5, 5, 7, 0.72);
  backdrop-filter: blur(7px);
  animation: fade 0.25s;
}
.cart-drawer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(410px, 92vw);
  min-height: 100%;
  padding: 42px 30px 30px;
  background: var(--surface);
  border-left: 1px solid var(--red);
  animation: slide 0.35s ease-out;
}
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  color: #f3f4f6;
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}
.cart-drawer h2 {
  margin: 14px 0 30px;
  font-size: 40px;
  letter-spacing: -0.05em;
}
.cart-drawer h2 span {
  color: #ef4444;
  font: 12px "DM Mono";
}
.cart-list {
  border-top: 1px solid var(--line);
}
.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}
.cart-item strong,
.cart-item small {
  display: block;
}
.cart-item strong {
  font-size: 13px;
}
.cart-item small {
  margin-top: 5px;
  color: var(--muted);
  font: 10px "DM Mono";
}
.quantity {
  display: flex;
  align-items: center;
  gap: 9px;
}
.quantity button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: #f3f4f6;
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}
.quantity span {
  min-width: 15px;
  text-align: center;
}
.cart-empty {
  display: grid;
  flex: 1;
  place-content: center;
  gap: 13px;
  color: var(--muted);
  text-align: center;
}
.cart-total {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding: 20px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font: 11px "DM Mono";
}
.cart-total strong {
  color: #f3f4f6;
  font: 600 19px "Space Grotesk";
}
.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  color: #fff;
  border: 0;
  background: var(--red);
  cursor: pointer;
  font-weight: 600;
}
.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.clear-button {
  align-self: center;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slide {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@media (max-width: 900px) {
  .catalog-header nav {
    display: none;
  }
  .catalog-content {
    grid-template-columns: 190px 1fr;
    gap: 30px;
  }
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 620px) {
  .catalog-header {
    height: 64px;
  }
  .brand img {
    height: 30px;
    max-width: 150px;
  }
  .cart-trigger {
    padding: 0 10px;
  }
  .catalog-hero {
    min-height: 400px;
    padding: 65px 0 50px;
  }
  .hero-stamp {
    display: none;
  }
  .catalog-content {
    display: block;
    width: 90vw;
    padding-top: 56px;
    padding-bottom: 80px;
  }
  .filters {
    margin-bottom: 38px;
    overflow: hidden;
  }
  .filter-heading {
    align-items: baseline;
  }
  .filters > button {
    display: inline-flex;
    width: auto;
    margin: 0 18px 0 0;
    padding: 0 0 10px;
    border-bottom: 1px solid transparent;
  }
  .filters > button.active {
    border-bottom-color: #ef4444;
  }
  .filter-divider,
  .filters h2:not(.filter-heading h2) {
    display: none;
  }
  .price-label,
  .reset-filter {
    display: none;
  }
  .products-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }
  .products-toolbar label {
    width: 100%;
  }
  .products-toolbar > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .products-toolbar select {
    flex: 0 0 150px;
    margin-left: 12px;
  }
  .product-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .product-image {
    height: min(72vw, 300px);
  }
  .product-details h3 {
    min-height: 0;
  }
}
</style>
