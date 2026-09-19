import { randomUUID } from "node:crypto";
import { createError } from "h3";
import { collection, doc, getDocFromServer, getDocsFromServer, runTransaction } from "firebase/firestore";
import { categoryForProduct, initialCategories, normalizeCategoryName, type ProductCategory } from "../../data/categories";
import type { CatalogProduct } from "../../data/products";
import { db } from "./firebase.js";

export const categoriesRef = () => doc(db, "site", "categories");
export async function rawCategoryProducts() {
  const snapshot = await getDocsFromServer(collection(db, "products"));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as CatalogProduct);
}
export async function loadCategories(): Promise<ProductCategory[]> {
  const snapshot = await getDocFromServer(categoriesRef());
  return snapshot.exists() ? snapshot.data().items : initialCategories(await rawCategoryProducts());
}
export async function mutateCategory(action: "create" | "update" | "delete", id?: string, input?: { name?: unknown }) {
  return runTransaction(db, async transaction => {
    const ref = categoriesRef();
    const snapshot = await transaction.get(ref);
    // All product assignment writes also update this document. A concurrent assignment
    // causes a retry, including a fresh association check before deletion.
    const products = await rawCategoryProducts();
    const items: ProductCategory[] = snapshot.exists() ? snapshot.data().items : initialCategories(products);
    const current = items.find(item => item.id === id);
    if (action !== "create" && !current) throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" });
    if (action === "delete") {
      const count = products.filter(product => categoryForProduct(product, items)?.id === id).length;
      if (count) throw createError({ statusCode: 409, statusMessage: `No se puede eliminar: hay ${count} producto(s) en esta categoría. Reasignalos primero.` });
      transaction.set(ref, { items: items.filter(item => item.id !== id), revision: (snapshot.data()?.revision || 0) + 1 }, { merge: true });
      return { ok: true };
    }
    const name = typeof input?.name === "string" ? input.name.trim() : "";
    if (!name || name.length > 80) throw createError({ statusCode: 400, statusMessage: "Ingresá un nombre de categoría de hasta 80 caracteres" });
    const normalized = normalizeCategoryName(name);
    if (items.some(item => item.id !== id && [item.name, ...item.aliases].some(alias => normalizeCategoryName(alias) === normalized))) {
      throw createError({ statusCode: 409, statusMessage: "Ya existe una categoría con ese nombre" });
    }
    const category: ProductCategory = current
      ? { ...current, name, aliases: [...new Set([...current.aliases, current.name, name])] }
      : { id: randomUUID(), name, aliases: [name], isRack: normalized === "racks metalicos" };
    const updated = current ? items.map(item => item.id === id ? category : item) : [...items, category];
    transaction.set(ref, { items: updated, revision: (snapshot.data()?.revision || 0) + 1 }, { merge: true });
    return category;
  });
}
