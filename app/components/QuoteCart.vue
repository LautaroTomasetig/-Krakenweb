<template>
  <div v-if="quoteCartOpen" class="cart-backdrop" @click.self="closeQuoteCart">
    <aside class="cart-drawer">
      <button class="close-button" aria-label="Cerrar carrito" @click="closeQuoteCart"><X :size="18" /></button>
      <p class="eyebrow">Tu cotización</p>
      <h2>Carrito <span>{{ quoteItemCount }}</span></h2>
      <div v-if="quoteItems.length" class="cart-list">
        <div v-for="item in quoteItems" :key="`${item.name}-${item.details || ''}`" class="cart-item">
          <div><strong>{{ item.name }}</strong><small>{{ formatPrice(item.price) }} c/u</small><small v-if="item.details">{{ item.details }}</small></div>
          <div class="quantity"><button aria-label="Reducir cantidad" @click="updateQuoteQuantity(item.name, -1, item.details)"><Minus :size="13" /></button><span>{{ item.quantity }}</span><button aria-label="Aumentar cantidad" @click="updateQuoteQuantity(item.name, 1, item.details)"><Plus :size="13" /></button></div>
        </div>
      </div>
      <div v-else class="cart-empty"><ShoppingCart :size="28" /><p>Tu carrito está vacío.<br />Agregá productos para comenzar.</p></div>
      <div class="cart-total"><span>Total estimado</span><strong>{{ formatPrice(quoteTotal) }}</strong></div>
      <button class="send-button" :disabled="!quoteItems.length" @click="sendQuote">Solicitar cotización <Send :size="16" /></button>
      <button v-if="quoteItems.length" class="clear-button" @click="clearQuote">Vaciar carrito</button>
    </aside>
  </div>
</template>
<script setup lang="ts">
import { Minus, Plus, Send, ShoppingCart, X } from "lucide-vue-next";
const { quoteItems, quoteTotal, quoteItemCount, quoteCartOpen, updateQuoteQuantity, clearQuote, closeQuoteCart } = useQuoteCart();
const formatPrice = (value: number) => value ? `$ ${value.toLocaleString("es-AR")}` : "$0";
function sendQuote() { window.open(`https://wa.me/5491131250453?text=${encodeURIComponent(quoteItems.value.map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price)} c/u${item.details ? ` (${item.details})` : ""}`).join("\n"))}`, "_blank"); }
</script>
