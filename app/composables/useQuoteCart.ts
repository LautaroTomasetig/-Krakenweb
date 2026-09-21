import type { RackOption, RackOptionKey } from "../../data/rack-calculator";
export type QuoteItem = {
  name: string;
  quantity: number;
  price: number;
  details?: string;
  productId?: string;
  pricingVersion?: 2;
  quoteKey?: string;
  rackSelection?: Record<RackOptionKey, RackOption>;
};

export function useQuoteCart() {
  const quoteCartOpen = useState("kraken-quote-cart-open", () => false);
  const quoteItems = useCookie<QuoteItem[]>("kraken-quote-items", {
    default: () => [],
    watch: "shallow",
  });
  const quoteTotal = computed(() =>
    quoteItems.value.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),
  );
  const quoteItemCount = computed(() =>
    quoteItems.value.reduce((total, item) => total + item.quantity, 0),
  );

  function addToQuote(product: Omit<QuoteItem, "quantity">, quantity = 1) {
    const matches = (item: QuoteItem) => product.quoteKey
      ? item.quoteKey === product.quoteKey
      : !item.quoteKey && item.name === product.name && item.details === product.details;
    const existing = quoteItems.value.find(
      matches,
    );
    quoteItems.value = existing
      ? quoteItems.value.map((item) =>
          matches(item)
            ? { ...item, ...(product.quoteKey ? product : {}), quantity: item.quantity + quantity }
            : item,
        )
      : [...quoteItems.value, { ...product, quantity }];
    quoteCartOpen.value = true;
  }

  function updateQuoteQuantity(name: string, change: number, details?: string, quoteKey?: string) {
    const matches = (item: QuoteItem) => quoteKey ? item.quoteKey === quoteKey : !item.quoteKey && item.name === name && item.details === details;
    const item = quoteItems.value.find(matches);
    if (item) {
      quoteItems.value = quoteItems.value.map((quoteItem) =>
        matches(quoteItem)
          ? { ...quoteItem, quantity: Math.max(1, quoteItem.quantity + change) }
          : quoteItem,
      );
    }
  }

  function removeFromQuote(name: string) {
    quoteItems.value = quoteItems.value.filter((item) => item.name !== name);
  }

  function clearQuote() {
    quoteItems.value = [];
  }

  function openQuoteCart() {
    quoteCartOpen.value = true;
  }

  function closeQuoteCart() {
    quoteCartOpen.value = false;
  }

  return {
    quoteItems,
    quoteTotal,
    quoteItemCount,
    addToQuote,
    updateQuoteQuantity,
    removeFromQuote,
    clearQuote,
    quoteCartOpen,
    openQuoteCart,
    closeQuoteCart,
  };
}
