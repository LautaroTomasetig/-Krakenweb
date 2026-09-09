import { createError } from "h3";
import { collection, deleteDoc, doc, getDocFromServer, getDocsFromServer, setDoc } from "firebase/firestore";
import type { CatalogProduct } from "../../data/products";
import { db } from "./firebase.js";

export const DEFAULT_PRODUCT_IMAGE = "/img/moldes.JPG";

export async function loadProducts(): Promise<CatalogProduct[]> {
  const snapshot = await getDocsFromServer(collection(db, "products"));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as CatalogProduct);
}

export async function removeProduct(id: string) {
  const ref = doc(db, "products", id);
  if (!(await getDocFromServer(ref)).exists()) {
    throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  }
  await deleteDoc(ref);
}

function firestoreProduct({ icon, id, ...product }: CatalogProduct) {
  return product;
}

export async function createProduct(product: CatalogProduct) {
  const ref = doc(db, "products", product.slug);
  if ((await getDocFromServer(ref)).exists()) {
    throw createError({ statusCode: 409, statusMessage: "El ID ya existe" });
  }
  const data = firestoreProduct(product);
  await setDoc(ref, data);
  return { ...data, id: ref.id };
}

export async function updateProduct(id: string, product: CatalogProduct) {
  const ref = doc(db, "products", id);
  if (!(await getDocFromServer(ref)).exists()) {
    throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });
  }
  const data = firestoreProduct(product);
  await setDoc(ref, data);
  return { ...data, id: ref.id };
}
