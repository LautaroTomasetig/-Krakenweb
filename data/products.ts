import { Box, Layers3, Ruler, Settings2 } from "lucide-vue-next";

export type CatalogProduct = {
  name: string;
  code: string;
  price: number;
  description: string;
  category: string;
  image: string;
  icon: typeof Box;
};

export const products: CatalogProduct[] = [
  {
    name: "Racks industriales reforzados",
    code: "RK-01",
    price: 185000,
    description: "Carga pesada · modular",
    category: "Racks metálicos",
    image: "/img/moldes.JPG",
    icon: Box,
  },
  {
    name: "Estanterías modulares",
    code: "ES-04",
    price: 92000,
    description: "Adaptable · galvanizada",
    category: "Estanterías metálicas",
    image: "/img/final.JPG",
    icon: Layers3,
  },
  {
    name: "Caños curvados",
    code: "CC-12",
    price: 48000,
    description: "Bajo plano · repetible",
    category: "Góndolas",
    image: "/img/torneria.JPG",
    icon: Ruler,
  },
  {
    name: "Piezas a medida",
    code: "PM-00",
    price: 0,
    description: "Ingeniería · fabricación",
    category: "Soluciones especiales",
    image: "/img/diseño.JPG",
    icon: Settings2,
  },
  {
    name: "Rack para pallets",
    code: "RK-08",
    price: 222400,
    description: "Alta resistencia · industrial",
    category: "Racks metálicos",
    image: "/img/equipo.JPG",
    icon: Box,
  },
  {
    name: "Módulo de depósito",
    code: "MD-02",
    price: 141600,
    description: "Orden · optimización",
    category: "Estanterías metálicas",
    image: "/img/pintura.JPG",
    icon: Layers3,
  },
];
