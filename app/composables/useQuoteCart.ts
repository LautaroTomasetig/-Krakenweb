export type QuoteItem = {
  name: string;
  quantity: number;
  price: number;
  details?: string;
};

export function useQuoteCart() {
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

  function addToQuote(product: Omit<QuoteItem, "quantity">) {
    const existing = quoteItems.value.find(
      (item) => item.name === product.name,
    );
    quoteItems.value = existing
      ? quoteItems.value.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [...quoteItems.value, { ...product, quantity: 1 }];
  }

  function updateQuoteQuantity(name: string, change: number) {
    const item = quoteItems.value.find((quoteItem) => quoteItem.name === name);
    if (item) {
      quoteItems.value = quoteItems.value.map((quoteItem) =>
        quoteItem.name === name
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

  return {
    quoteItems,
    quoteTotal,
    quoteItemCount,
    addToQuote,
    updateQuoteQuantity,
    removeFromQuote,
    clearQuote,
  };
}
