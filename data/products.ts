import { Box, Layers3, Ruler, Settings2 } from "lucide-vue-next";

export type CatalogProduct = {
  id?: string;
  slug: string;
  name: string;
  code: string;
  price: number;
  priceFrom: number;
  priceTo: number;
  description: string;
  technicalDescription: string;
  category: string;
  image: string;
  images: string[];
  rackConfig?: { width: number; height: number; depth: number; levels: number };
  icon: typeof Box;
};

export const products: CatalogProduct[] = [
  {
    slug: "racks-industriales-reforzados",
    name: "Racks industriales reforzados",
    code: "RK-01",
    price: 185000,
    priceFrom: 185000,
    priceTo: 460000,
    description: "Carga pesada · modular",
    technicalDescription: "Sistema modular para almacenamiento de carga pesada, con bastidores reforzados y niveles regulables. Se fabrica bajo plano según las dimensiones y operación de cada depósito.",
    category: "Racks metálicos",
    image: "/img/moldes.JPG",
    images: ["/img/moldes.JPG", "/img/equipo.JPG", "/img/final.JPG"],
    rackConfig: { width: 2000, height: 2000, depth: 1000, levels: 3 },
    icon: Box,
  },
  {
    slug: "estanterias-modulares",
    name: "Estanterías modulares",
    code: "ES-04",
    price: 92000,
    priceFrom: 92000,
    priceTo: 220000,
    description: "Adaptable · galvanizada",
    technicalDescription: "Estantería modular de armado flexible para organizar stock, herramientas y componentes. La configuración final se define por cantidad de niveles, carga y terminación.",
    category: "Estanterías metálicas",
    image: "/img/final.JPG",
    images: ["/img/final.JPG", "/img/pintura.JPG"],
    icon: Layers3,
  },
  {
    slug: "canos-curvados",
    name: "Caños curvados",
    code: "CC-12",
    price: 48000,
    priceFrom: 48000,
    priceTo: 130000,
    description: "Bajo plano · repetible",
    technicalDescription: "Piezas curvadas repetibles para estructuras y conducción, procesadas a partir de especificación técnica y control dimensional.",
    category: "Góndolas",
    image: "/img/torneria.JPG",
    images: ["/img/torneria.JPG"],
    icon: Ruler,
  },
  {
    slug: "piezas-a-medida",
    name: "Piezas a medida",
    code: "PM-00",
    price: 0,
    priceFrom: 0,
    priceTo: 0,
    description: "Ingeniería · fabricación",
    technicalDescription: "Desarrollo integral de piezas especiales a partir de plano, muestra o relevamiento en planta.",
    category: "Soluciones especiales",
    image: "/img/diseño.JPG",
    images: ["/img/diseño.JPG", "/img/moldes.JPG"],
    icon: Settings2,
  },
  {
    slug: "rack-para-pallets",
    name: "Rack para pallets",
    code: "RK-08",
    price: 222400,
    priceFrom: 222400,
    priceTo: 580000,
    description: "Alta resistencia · industrial",
    category: "Racks metálicos",
    technicalDescription: "Rack selectivo para pallets y operación intensiva. Configurable por altura, profundidad, cantidad de niveles y carga por módulo.",
    image: "/img/equipo.JPG",
    images: ["/img/equipo.JPG", "/img/moldes.JPG"],
    rackConfig: { width: 2700, height: 3000, depth: 1100, levels: 3 },
    icon: Box,
  },
  {
    slug: "modulo-deposito",
    name: "Módulo de depósito",
    code: "MD-02",
    price: 141600,
    priceFrom: 141600,
    priceTo: 340000,
    description: "Orden · optimización",
    technicalDescription: "Módulo de depósito pensado para maximizar el espacio útil y facilitar el acceso al inventario.",
    category: "Estanterías metálicas",
    image: "/img/pintura.JPG",
    images: ["/img/pintura.JPG", "/img/final.JPG"],
    icon: Layers3,
  },
];
