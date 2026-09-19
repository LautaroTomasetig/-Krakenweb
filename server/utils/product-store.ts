import { createError } from "h3";
import { collection, deleteDoc, doc, getDocFromServer, getDocsFromServer, runTransaction } from "firebase/firestore";
import type { CatalogProduct } from "../../data/products";
import { categoryForProduct, initialCategories, type ProductCategory } from "../../data/categories";
import { categoriesRef, loadCategories, rawCategoryProducts } from "./category-store";
import { db } from "./firebase.js";

export const DEFAULT_PRODUCT_IMAGE = "/img/moldes.JPG";

export async function loadProducts(): Promise<CatalogProduct[]> {
  const snapshot = await getDocsFromServer(collection(db, "products"));
  const categories = await loadCategories();
  return snapshot.docs.map((item) => {
    const product = { ...item.data(), id: item.id } as CatalogProduct;
    const category = categoryForProduct(product, categories);
    return { ...product, categoryId: category?.id || product.categoryId, category: category?.name || product.category, isRack: category?.isRack || false };
  });
}

export async function removeProduct(id: string) {
  const ref = doc(db, "products", id);
  if (!(await getDocFromServer(ref)).exists()) {
    throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  }
  await deleteDoc(ref);
}

async function saveProduct(id: string, product: Partial<CatalogProduct>, creating: boolean) {
  const ref = doc(db, "products", id);
  return runTransaction(db, async transaction => {
    const categoryRef = categoriesRef();
    const categorySnapshot = await transaction.get(categoryRef);
    const snapshot = await transaction.get(ref);
    if (creating && snapshot.exists()) throw createError({ statusCode: 409, statusMessage: "El ID ya existe" });
    if (!creating && !snapshot.exists()) throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
    const categories: ProductCategory[] = categorySnapshot.exists() ? categorySnapshot.data().items : initialCategories(await rawCategoryProducts());
    const category = categories.find(item => item.id === product.categoryId);
    if (!category) throw createError({ statusCode: 400, statusMessage: "La categoría ya no existe. Elegí otra categoría." });
    const previous = snapshot.data() || {};
    const data = { ...product };
    // price/priceFrom/priceTo and any other legacy fields remain untouched.
    transaction.set(ref, data, { merge: true });
    transaction.set(categoryRef, { items: categories, revision: (categorySnapshot.data()?.revision || 0) + 1 }, { merge: true });
    return { ...previous, ...data, id: ref.id };
  });
}

export const createProduct = (product: Partial<CatalogProduct> & { slug: string }) => saveProduct(product.slug, product, true);
export const updateProduct = (id: string, product: Partial<CatalogProduct>) => saveProduct(id, product, false);
