import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { products, type CatalogProduct } from "../../data/products";
import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase.js";

const storePath = resolve(process.cwd(), "server/data/products.json");
export const DEFAULT_PRODUCT_IMAGE = "/img/moldes.JPG";
let loaded = false;

export async function loadProducts() {
  if (loaded) return products;
  const snapshot = await getDocs(collection(db, "products"));
  if (!snapshot.empty) {
    const defaultIcon = products[0]?.icon;
    products.splice(0, products.length, ...snapshot.docs.map((item) => ({ ...item.data(), icon: defaultIcon })) as CatalogProduct[]);
  } else {
    const legacy = await readLegacyProducts();
    products.splice(0, products.length, ...legacy);
    await persistProducts();
  }
  loaded = true;
  return products;
}

async function readLegacyProducts() {
  try {
    const stored = JSON.parse(await readFile(storePath, "utf8")) as CatalogProduct[];
    const defaultIcon = products[0]?.icon;
    return stored.map((product) => ({ ...product, icon: defaultIcon })) as CatalogProduct[];
  } catch {
    return products;
  }
}

export async function persistProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => batch.delete(item.ref));
  products.forEach(({ icon, ...product }) => batch.set(doc(db, "products", product.slug), product));
  await batch.commit();
}

export async function removeProduct(slug: string) {
  await deleteDoc(doc(db, "products", slug));
}

/** Guarda solamente los datos serializables: los iconos son componentes de Vue. */
function firestoreProduct({ icon, ...product }: CatalogProduct) {
  return product;
}

export async function createProduct(product: CatalogProduct) {
  await setDoc(doc(db, "products", product.slug), firestoreProduct(product));
}

/**
 * Firestore no permite renombrar IDs de documentos. Si cambia el slug, se crea
 * el documento con el ID nuevo y se elimina el anterior en el mismo batch.
 */
export async function updateProduct(previousSlug: string, product: CatalogProduct) {
  const batch = writeBatch(db);
  batch.set(doc(db, "products", product.slug), firestoreProduct(product));
  if (previousSlug !== product.slug) batch.delete(doc(db, "products", previousSlug));
  await batch.commit();
}

export async function persistLegacyProducts() {
  await mkdir(dirname(storePath), { recursive: true });
  const serializable = products.map(({ icon, ...product }) => product);
  await writeFile(storePath, JSON.stringify(serializable, null, 2), "utf8");
}
