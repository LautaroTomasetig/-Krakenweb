import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { products, type CatalogProduct } from "../../data/products";

const storePath = resolve(process.cwd(), "server/data/products.json");
export const DEFAULT_PRODUCT_IMAGE = "/img/moldes.JPG";
let loaded = false;

export async function loadProducts() {
  if (loaded) return products;
  try {
    const stored = JSON.parse(await readFile(storePath, "utf8")) as CatalogProduct[];
    const defaultIcon = products[0]?.icon;
    products.splice(0, products.length, ...stored.map((product) => ({ ...product, icon: defaultIcon })) as CatalogProduct[]);
  } catch {
    await persistProducts();
  }
  loaded = true;
  return products;
}

export async function persistProducts() {
  await mkdir(dirname(storePath), { recursive: true });
  const serializable = products.map(({ icon, ...product }) => product);
  await writeFile(storePath, JSON.stringify(serializable, null, 2), "utf8");
}
