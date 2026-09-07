export type QuoteItem = {
  name: string;
  quantity: number;
  price: number;
  details?: string;
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
    const existing = quoteItems.value.find(
      (item) => item.name === product.name && item.details === product.details,
    );
    quoteItems.value = existing
      ? quoteItems.value.map((item) =>
          item.name === product.name && item.details === product.details
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [...quoteItems.value, { ...product, quantity }];
    quoteCartOpen.value = true;
  }

  function updateQuoteQuantity(name: string, change: number, details?: string) {
    const item = quoteItems.value.find((quoteItem) => quoteItem.name === name && quoteItem.details === details);
    if (item) {
      quoteItems.value = quoteItems.value.map((quoteItem) =>
        quoteItem.name === name && quoteItem.details === details
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
