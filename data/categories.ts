import type { CatalogProduct } from "./products";

export type ProductCategory = { id: string; name: string; aliases: string[]; isRack: boolean };
export const normalizeCategoryName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const legacyCategoryId = (name: string) => `legacy-${Array.from(normalizeCategoryName(name)).map(char => char.codePointAt(0)!.toString(16)).join("-")}`;
export function categoryForProduct(product: Partial<CatalogProduct>, categories: ProductCategory[]) {
  if (product.categoryId) return categories.find(category => category.id === product.categoryId);
  const name = normalizeCategoryName(product.category || "");
  return categories.find(category => [category.name, ...category.aliases].some(alias => normalizeCategoryName(alias) === name));
}

// Only used before site/categories exists; legacy products are never rewritten here.
export function initialCategories(products: Partial<CatalogProduct>[]): ProductCategory[] {
  const names = ["Racks metálicos", "Estanterías metálicas", "Góndolas", "Soluciones especiales", ...products.map(product => product.category || "").filter(Boolean)];
  const categories: ProductCategory[] = [];
  for (const name of names) {
    if (categoryForProduct({ category: name }, categories)) continue;
    categories.push({ id: legacyCategoryId(name), name, aliases: [name], isRack: normalizeCategoryName(name) === "racks metalicos" });
  }
  return categories;
}
