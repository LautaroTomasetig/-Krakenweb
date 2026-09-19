import type { CatalogProduct } from "./products";

export function productBasePrice(product: Partial<CatalogProduct>) {
  return product.priceBase ?? product.priceFrom ?? product.price ?? 0;
}

export function productFinalPrice(product: Partial<CatalogProduct>) {
  return productBasePrice(product) * (1 + (product.markupPercent ?? 0) / 100);
}

export function productPriceRange(product: Partial<CatalogProduct>): [number, number] {
  const price = productFinalPrice(product);
  return [price, product.priceBase != null ? price : (product.priceTo ?? price)];
}
