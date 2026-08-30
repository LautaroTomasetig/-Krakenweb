<template>
  <div v-if="$route.path === '/'" class="site-shell">
    <NuxtRouteAnnouncer />
    <header
      class="site-header"
      :class="{ 'site-header-scrolled': hasScrolled }"
    >
      <a class="brand" href="#inicio" aria-label="Kraken Group inicio">
        <img
          src="/img/logo-kraken.png"
          alt="Kraken Group Logo"
          class="brand-logo"
        />
      </a>
      <nav class="desktop-nav" aria-label="Navegación principal">
        <a href="#servicios">Servicios</a><a href="#galeria">Galería</a
        ><a href="#catalogo">Catálogo</a><a href="#nosotros">Nosotros</a
        ><a href="#contacto">Contacto</a>
      </nav>
      <!-- <button class="header-cta" @click="sendWhatsApp('Hola Kraken, quiero hablar con un especialista.')">Hablar con un especialista <ArrowUpRight :size="16" /></button> -->
      <button
        class="quote-cart"
        aria-label="Abrir carrito de cotización"
        @click="quoteCartOpen = true"
      >
        <ShoppingCart :size="19" /><strong>{{ formatPrice(quoteTotal) }}</strong
        ><span class="quote-cart-count">{{ quoteItemCount }}</span>
      </button>
      <button
        class="menu-toggle"
        aria-label="Abrir menú"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <Menu :size="22" />
      </button>
      <nav v-if="mobileMenuOpen" class="mobile-nav">
        <a href="#servicios" @click="mobileMenuOpen = false">Servicios</a
        ><a href="#galeria" @click="mobileMenuOpen = false">Galería</a
        ><a href="#catalogo" @click="mobileMenuOpen = false">Catálogo</a
        ><a href="#nosotros" @click="mobileMenuOpen = false">Nosotros</a
        ><a href="#contacto" @click="mobileMenuOpen = false">Contacto</a>
      </nav>
    </header>

    <main id="inicio">
      <section class="hero section-grid">
        <div class="hero-copy reveal">
          <div class="eyebrow">
            <span class="status-dot" /> Ingeniería · Fabricación · Precisión
          </div>
          <h1>Soluciones industriales<br /><em>que toman forma.</em></h1>
          <p>
            Diseñamos, fabricamos e innovamos para que tus proyectos avancen con
            la precisión que exige la industria.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" href="#catalogo"
              >Ver catálogo <ArrowUpRight :size="18" /></a
            ><button
              class="button button-ghost"
              @click="sendWhatsApp('Hola Kraken, quiero cotizar un proyecto.')"
            >
              <MessageCircle :size="18" /> Cotizar ahora
            </button>
          </div>
          <div class="trust-row">
            <span><strong>10+</strong> años de trayectoria</span
            ><span><strong>24/7</strong> respuesta comercial</span
            ><span><strong>100%</strong> bajo plano</span>
          </div>
        </div>
        <div class="hero-visual reveal">
          <video
            class="hero-img"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            poster="/img/heroimg.jpeg"
            aria-label="Máquinas trabajando en la planta industrial"
          >
            <source src="/img/krakenvid.mp4" type="video/mp4" />
          </video>
          <div class="hero-image-overlay" />
          <div class="visual-caption">
            <span>01 / 04</span> <span>PLANTA MALVINAS ARGENTINAS</span>
          </div>
        </div>
      </section>

      <section class="metrics-band">
        <div>
          <span>01</span><strong>Una planta.<br />21 servicios.</strong>
        </div>
        <div>
          <span>02</span><strong>Del plano<br />a la pieza.</strong>
        </div>
        <div>
          <span>03</span><strong>Tu industria,<br />nuestro foco.</strong>
        </div>
        <div class="metrics-note"></div>
      </section>

      <section id="nosotros" class="about-section">
        <div class="about-copy">
          <div class="eyebrow">01 / Sobre Kraken</div>
          <h2>Una década<br /><em>haciendo industria.</em></h2>
          <p>
            Somos un equipo de ingeniería y fabricación metalúrgica enfocado en
            resolver lo complejo. Combinamos maquinaria de última generación,
            criterio técnico y escala mayorista para convertir cada plano en una
            pieza confiable.
          </p>
          <a class="text-link" href="#contacto"
            >Conocé nuestra forma de trabajar <ArrowUpRight :size="16"
          /></a>
        </div>
        <div class="about-stats">
          <div>
            <strong>10<span>+</span></strong
            ><small>Años de liderazgo industrial</small>
          </div>
          <div>
            <strong>21<span>+</span></strong
            ><small>Servicios en una planta integral</small>
          </div>
          <div>
            <strong>100<span>%</span></strong
            ><small>Venta mayorista y a medida</small>
          </div>
          <div>
            <strong>20<span>+</span></strong
            ><small>Máquinas de última generación</small>
          </div>
          <div class="about-values">
            <span><ShieldCheck :size="17" /> Calidad asegurada</span
            ><span><PackageCheck :size="17" /> Envíos a todo el país</span
            ><span><Settings2 :size="17" /> Soluciones personalizadas</span>
          </div>
        </div>
      </section>

      <section id="servicios" class="content-section services-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow">02 / Servicios</div>
            <h2>
              Todo lo que tu proyecto<br /><em>necesita para avanzar.</em>
            </h2>
          </div>
          <p>
            Un equipo técnico, una planta integral y la capacidad de acompañar
            cada etapa de tu proyecto.
          </p>
        </div>
        <div class="service-toolbar">
          <label class="service-search"
            ><Search :size="17" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Buscar servicio: corte láser, PLC..."
              aria-label="Buscar servicios"
          /></label>
          <span>{{ filteredServices.length }} servicios encontrados</span>
        </div>
        <div class="service-grid">
          <button
            v-for="(service, index) in filteredServices"
            :key="service.name"
            class="service-card"
            @click="activeService = service"
          >
            <span class="service-index">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <component :is="service.icon" :size="22" stroke-width="1.5" />
            <span class="service-name">{{ service.name }}</span>
            <ChevronRight class="service-arrow" :size="17" />
          </button>
          <div v-if="!filteredServices.length" class="no-results">
            No encontramos ese servicio. Probá con otro término.
          </div>
        </div>
        <div
          class="marquee-window"
          aria-label="Todas los servicios industriales"
        ></div>
      </section>

      <section id="proceso" class="process-section">
        <div class="eyebrow">03 / Método Kraken</div>
        <h2>Precisión en cada <em>movimiento.</em></h2>
        <div class="process-grid">
          <div>
            <span>01</span>
            <h3>Entendemos</h3>
            <p>
              Nos metemos en tu operación para encontrar la solución correcta.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Diseñamos</h3>
            <p>Convertimos la necesidad en un plano claro y fabricable.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Fabricamos</h3>
            <p>
              Producimos, controlamos y entregamos piezas listas para trabajar.
            </p>
          </div>
        </div>
      </section>

      <section id="galeria" class="content-section gallery-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow">04 / En acción</div>
            <h2>Donde las ideas<br /><em>se vuelven piezas.</em></h2>
          </div>
          <p>
            Conocé el ritmo de nuestra planta: tecnología, oficio y un equipo
            que convierte cada desafío en producción real.
          </p>
        </div>
        <div class="gallery-grid">
          <article
            v-for="item in galleryItems"
            :key="item.title"
            class="gallery-item"
            :class="{ 'gallery-item-featured': item.featured }"
            role="button"
            tabindex="0"
            :aria-label="`Ver ${item.title} en detalle`"
            @click="activeGalleryItem = item"
            @keydown.enter="activeGalleryItem = item"
            @keydown.space.prevent="activeGalleryItem = item"
          >
            <div class="gallery-media">
              <video
                v-if="item.type === 'video'"
                :src="item.src"
                :poster="item.poster"
                muted
                loop
                autoplay
                playsinline
                preload="metadata"
                :aria-label="item.alt"
              /><img
                v-else
                :src="item.src"
                :alt="item.alt"
                loading="lazy"
                :style="{ objectPosition: item.position || 'center' }"
              /><span class="gallery-kind">{{
                item.type === "video" ? "Video" : "Registro"
              }}</span
              ><span class="gallery-open"
                >Ver detalle <ArrowUpRight :size="14"
              /></span>
            </div>
            <div class="gallery-caption">
              <span>{{ item.number }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <CatalogoPage embedded />

      <section class="calculator-section">
        <div class="calculator-intro">
          <div class="eyebrow">05 / Cotización rápida</div>
          <h2>¿Tenés una medida?<br /><em>La hacemos realidad.</em></h2>
          <p>
            Calculá una referencia inicial y contanos qué necesitás. El valor
            final se confirma según plano y especificación.
          </p>
          <div class="estimate-tag">
            <CircleCheck :size="17" /> Estimación instantánea
          </div>
        </div>
        <div class="calculator">
          <div class="calculator-head">
            <span>Configurá tu pieza</span><span>REF. 2026</span>
          </div>
          <label
            >Material<select v-model="material">
              <option>Chapa de acero</option>
              <option>Tubo estructural</option>
            </select></label
          >
          <div class="input-row">
            <label
              >Ancho
              <div class="number-input">
                <input v-model.number="width" type="number" min="1" /><span
                  >mm</span
                >
              </div></label
            ><label
              >Largo
              <div class="number-input">
                <input v-model.number="length" type="number" min="1" /><span
                  >mm</span
                >
              </div></label
            >
          </div>
          <div class="input-row">
            <label
              >Espesor
              <div class="number-input">
                <input v-model.number="thickness" type="number" min="1" /><span
                  >mm</span
                >
              </div></label
            ><label
              >Cantidad
              <div class="number-input">
                <input v-model.number="quantity" type="number" min="1" /><span
                  >un.</span
                >
              </div></label
            >
          </div>
          <div class="estimate-result">
            <span>Referencia estimada</span
            ><strong>{{ formatPrice(calculatorEstimate) }}</strong>
          </div>
          <button
            class="button button-primary full-button"
            @click="
              sendWhatsApp(
                `Hola Kraken, calculé una pieza de ${material}, ${width} x ${length} mm, espesor ${thickness} mm, cantidad ${quantity}.`,
              )
            "
          >
            Solicitar presupuesto <ArrowUpRight :size="17" />
          </button>
        </div>
      </section>

      <section id="contacto" class="contact-section">
        <div>
          <div class="eyebrow">06 / Hablemos</div>
          <h2>Lo complejo es<br /><em>nuestro punto de partida.</em></h2>
        </div>
        <form
          class="contact-form"
          @submit.prevent="
            contactSent = true;
            sendWhatsApp(createQuotePayload());
          "
        >
          <input
            v-model="contactName"
            required
            placeholder="Nombre y apellido"
          /><input
            required
            type="tel"
            placeholder="Teléfono / WhatsApp"
          /><textarea
            v-model="contactMessage"
            required
            rows="3"
            placeholder="Contanos brevemente sobre tu proyecto..."
          />
        <button class="button button-primary full-button" type="submit">
            {{ contactSent ? "Solicitud enviada" : "Enviar consulta" }}
            <Check v-if="contactSent" :size="17" /><Send v-else :size="17" />
          </button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <a class="brand" href="#inicio" aria-label="Kraken Group inicio">
        <img
          src="/img/logo-kraken.png"
          alt="Kraken Group Logo"
          class="brand-logo"
        /> </a
      ><span>© 2026 Kraken.</span
      ><a href="#inicio">Volver arriba <ArrowUpRight :size="15" /></a>
    </footer>
    <button
      class="whatsapp-float"
      aria-label="Contactar por WhatsApp"
      @click="sendWhatsApp('Hola Kraken, quiero hacer una consulta.')"
    >
      <MessageCircle :size="25" />
    </button>

    <div
      v-if="quoteCartOpen"
      class="cart-backdrop"
      @click.self="quoteCartOpen = false"
    >
      <aside class="cart-drawer">
        <button
          class="close-button"
          aria-label="Cerrar carrito"
          @click="quoteCartOpen = false"
        >
          <X :size="18" />
        </button>
        <p class="eyebrow">Tu cotización</p>
        <h2>
          Cantidad:  <span>{{ quoteItemCount }}</span>
        </h2>
        <div v-if="quoteItems.length" class="cart-list">
          <div v-for="item in quoteItems" :key="item.name" class="cart-item">
            <div>
              <strong>{{ item.name }}</strong
              ><small>{{ formatPrice(item.price) }} c/u</small>
            </div>
            <div class="quantity">
              <button @click="updateQuoteQuantity(item.name, -1)">
                <Minus :size="13" /></button
              ><span>{{ item.quantity }}</span
              ><button @click="updateQuoteQuantity(item.name, 1)">
                <Plus :size="13" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="cart-empty">
          <ShoppingCart :size="28" />
          <p>Tu carrito está vacío.<br />Agregá productos para comenzar.</p>
        </div>
        <div class="cart-total">
          <span>Total estimado</span
          ><strong>{{ formatPrice(quoteTotal) }}</strong>
        </div>
        <button
          class="send-button"
          :disabled="!quoteItems.length"
          @click="sendQuote"
        >
          Solicitar cotización <Send :size="16" /></button
        ><button
          v-if="quoteItems.length"
          class="clear-button"
          @click="clearQuote"
        >
          Vaciar carrito
        </button>
      </aside>
    </div>
    <div
      v-if="activeService"
      class="modal-backdrop"
      @click.self="activeService = null"
    >
      <div class="service-modal">
        <button
          class="modal-close"
          aria-label="Cerrar"
          @click="activeService = null"
        >
          <X :size="19" />
        </button>
        <div class="eyebrow">{{ activeService.category }}</div>
        <component :is="activeService.icon" :size="35" stroke-width="1.3" />
        <h2>{{ activeService.name }}</h2>
        <p>{{ activeService.detail }}</p>
        <ul class="spec-list">
          <li v-for="spec in serviceSpecs(activeService)" :key="spec">
            <Check :size="15" /> {{ spec }}
          </li>
        </ul>
        <button
          class="button button-primary"
          @click="quoteService(activeService)"
        >
          Solicitar cotización <ArrowUpRight :size="17" />
        </button>
      </div>
    </div>
    <div
      v-if="activeGalleryItem"
      class="modal-backdrop gallery-lightbox"
      @click.self="activeGalleryItem = null"
    >
      <div class="gallery-lightbox-panel">
        <button
          class="modal-close"
          aria-label="Cerrar imagen"
          @click="activeGalleryItem = null"
        >
          <X :size="19" /></button
        ><video
          v-if="activeGalleryItem.type === 'video'"
          :src="activeGalleryItem.src"
          :poster="activeGalleryItem.poster"
          controls
          autoplay
          muted
          loop
          playsinline
        /><img
          v-else
          :src="activeGalleryItem.src"
          :alt="activeGalleryItem.alt"
        />
        <div class="gallery-lightbox-copy">
          <span>{{ activeGalleryItem.number }} / GALERÍA KRAKEN</span>
          <h2>{{ activeGalleryItem.title }}</h2>
          <p>{{ activeGalleryItem.description }}</p>
        </div>
      </div>
    </div>
  </div>
  <NuxtPage />
</template>

<script setup lang="ts">
import {
  ArrowUpRight,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Factory,
  FileText,
  FlaskConical,
  Gauge,
  Layers3,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  Ruler,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  X,
  Zap,
} from "lucide-vue-next";
import CatalogoPage from "./pages/catalogo.vue";

type Service = {
  name: string;
  category: string;
  detail: string;
  icon: typeof Zap;
};
type QuoteItem = {
  name: string;
  quantity: number;
  price: number;
  details?: string;
};
type GalleryItem = {
  number: string;
  title: string;
  description: string;
  type: "video" | "image";
  src: string;
  alt: string;
  poster?: string;
  position?: string;
  featured?: boolean;
};

const services: Service[] = [
  {
    name: "Pintura en polvo",
    category: "Terminación",
    detail:
      "Acabados resistentes y uniformes para piezas industriales de alto tránsito.",
    icon: Sparkles,
  },
  {
    name: "Corte por láser",
    category: "Corte & conformado",
    detail:
      "Corte de chapa de precisión para series cortas, medias y producción continua.",
    icon: Zap,
  },
  {
    name: "Fresado CNC",
    category: "Mecanizado",
    detail:
      "Geometrías complejas y tolerancias estrictas en múltiples materiales.",
    icon: Settings2,
  },
  {
    name: "Plegado",
    category: "Corte & conformado",
    detail:
      "Plegado CNC de hasta 3 metros para prototipos y estructuras repetibles.",
    icon: Layers3,
  },
  {
    name: "Inyección de plástico",
    category: "Polímeros",
    detail: "Componentes técnicos con matrices optimizadas para cada volumen.",
    icon: FlaskConical,
  },
  {
    name: "Soldadura láser",
    category: "Unión",
    detail: "Uniones limpias, rápidas y con mínima distorsión térmica.",
    icon: Gauge,
  },
  {
    name: "Soldadura robotizada",
    category: "Unión",
    detail: "Celdas automatizadas para consistencia y velocidad de producción.",
    icon: Factory,
  },
  {
    name: "Limpieza láser",
    category: "Terminación",
    detail: "Remoción de óxido, pintura y contaminantes sin abrasivos.",
    icon: Sparkles,
  },
  {
    name: "Electroerosión",
    category: "Mecanizado",
    detail: "Cavidades y cortes de alta precisión en aceros templados.",
    icon: Ruler,
  },
  {
    name: "Centro de mecanizado",
    category: "Mecanizado",
    detail: "Producción multieje con control dimensional documentado.",
    icon: Settings2,
  },
  {
    name: "Tornería",
    category: "Mecanizado",
    detail: "Piezas torneadas bajo plano y componentes de reposición.",
    icon: Gauge,
  },
  {
    name: "Corte por hilo",
    category: "Mecanizado",
    detail: "Corte de precisión para matrices, insertos y piezas especiales.",
    icon: Zap,
  },
  {
    name: "Corte de caños por láser",
    category: "Corte & conformado",
    detail: "Procesamos caños de hasta 240 mm con perforaciones y encastres.",
    icon: Ruler,
  },
  {
    name: "Dobladora de caños",
    category: "Corte & conformado",
    detail: "Curvado repetible para estructuras, mobiliario y conducción.",
    icon: Layers3,
  },
  {
    name: "Racks y estanterías industriales",
    category: "Soluciones",
    detail: "Almacenamiento modular diseñado alrededor de tu operación.",
    icon: Box,
  },
  {
    name: "Impresión 3D",
    category: "Prototipado",
    detail: "Validación funcional rápida antes de pasar a producción.",
    icon: Sparkles,
  },
  {
    name: "Matrices de estampado",
    category: "Herramental",
    detail: "Diseño y fabricación de matrices para ciclos de alta exigencia.",
    icon: Settings2,
  },
  {
    name: "Punzonado",
    category: "Corte & conformado",
    detail: "Perforaciones y formas repetibles con eficiencia industrial.",
    icon: Ruler,
  },
  {
    name: "Escaneo 3D",
    category: "Ingeniería",
    detail: "Digitalización de piezas para control, rediseño o réplica.",
    icon: Gauge,
  },
  {
    name: "Tableros PLC y programación",
    category: "Automatización",
    detail: "Control industrial, puesta en marcha y mejora de procesos.",
    icon: Factory,
  },
  {
    name: "Estampado en prensas 140 TN",
    category: "Conformado",
    detail:
      "Estampado robusto para piezas estructurales y componentes seriados.",
    icon: ShieldCheck,
  },
];

const galleryItems: GalleryItem[] = [
  {
    number: "01",
    title: "La precisión en marcha",
    description: "Tecnología que trabaja al ritmo de cada proyecto.",
    type: "video",
    src: "img/krakenvid.mp4",
    alt: "Máquinas trabajando en una planta industrial",
    featured: true,
  },
  {
    number: "02",
    title: "Manos que saben",
    description: "Experiencia técnica detrás de cada terminación.",
    type: "image",
    src: "/img/pintura.jpg",
    alt: "Interior de la planta industrial Kraken Group",
    position: "35% center",
  },
  {
    number: "03",
    title: "Del plano a la pieza",
    description: "Cada detalle controlado antes de entregar.",
    type: "image",
    src: "/img/diseño.jpg",
    poster: "/img/diseño.jpg",
    alt: "Operario trabajando con maquinaria industrial",
  },
  {
    number: "04",
    title: "Un equipo en movimiento",
    description: "Personas y procesos alineados para producir mejor.",
    type: "image",
    src: "/img/equipo.jpg",
    alt: "Planta y maquinaria industrial Kraken Group",
    position: "72% center",
  },
  {
    number: "05",
    title: "Listos para entregar",
    description: "El resultado final preparado para entrar en operación.",
    type: "image",
    src: "/img/final.jpg",
    alt: "Detalle de producción industrial Kraken Group",
    position: "center 65%",
  },
];

const activeService = ref<Service | null>(null);
const activeGalleryItem = ref<GalleryItem | null>(null);
const {
  quoteItems,
  quoteTotal,
  quoteItemCount,
  updateQuoteQuantity,
  removeFromQuote,
  clearQuote,
} = useQuoteCart();
const quoteCartOpen = ref(false);
const mobileMenuOpen = ref(false);
const searchQuery = ref("");
const material = ref("Chapa de acero");
const width = ref(400);
const length = ref(800);
const thickness = ref(2);
const quantity = ref(10);
const contactSent = ref(false);
const contactName = ref("");
const contactMessage = ref("");
const hasScrolled = ref(false);

function updateHeaderOnScroll() {
  hasScrolled.value = window.scrollY > 80;
}

onMounted(() =>
  window.addEventListener("scroll", updateHeaderOnScroll, { passive: true }),
);
onBeforeUnmount(() =>
  window.removeEventListener("scroll", updateHeaderOnScroll),
);

const calculatorEstimate = computed(() =>
  Math.max(
    9500,
    Math.round(
      width.value *
        length.value *
        thickness.value *
        quantity.value *
        (material.value === "Tubo estructural" ? 0.0012 : 0.0009),
    ),
  ),
);
const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const filteredServices = computed(() => {
  const queryWords = normalizeSearch(searchQuery.value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return services.filter((service) => {
    const searchableText = normalizeSearch(
      `${service.name} ${service.category} ${service.detail}`,
    );
    return queryWords.every((word) => searchableText.includes(word));
  });
});
const marqueeServices = computed(() => [...services, ...services]);
const formatPrice = (value: number) =>
  value ? `$ ${value.toLocaleString("es-AR")}` : "$0";

function serviceSpecs(service: Service) {
  const specs: Record<string, string[]> = {
    "Corte & conformado": [
      "Formato máximo: 3000 x 1500 mm",
      "Tolerancia: +/- 0.1 mm",
      "Producción bajo plano",
    ],
    Mecanizado: [
      "Tolerancia dimensional: hasta 0.01 mm",
      "Control multieje",
      "Acero, aluminio y polímeros",
    ],
    Unión: [
      "Cordón de alta resistencia",
      "Acero inoxidable y carbono",
      "Control visual y dimensional",
    ],
    Terminación: [
      "Acabado uniforme",
      "Tratamiento de superficies",
      "Piezas listas para montaje",
    ],
    Automatización: [
      "Programación PLC",
      "Puesta en marcha en planta",
      "Documentación técnica",
    ],
  };
  return (
    specs[service.category] || [
      "Ingeniería bajo plano",
      "Control de calidad documentado",
      "Producción para series B2B",
    ]
  );
}

function createQuotePayload(extraItem?: QuoteItem) {
  const items = [...quoteItems.value, ...(extraItem ? [extraItem] : [])];
  const lines = items.length
    ? items
        .map(
          (item) =>
            `- ${item.name}${item.details ? ` (${item.details})` : ""} - Cant: ${item.quantity}`,
        )
        .join("\n")
    : "- Consulta general";
  const contact = contactName.value ? `\n\nNombre: ${contactName.value}` : "";
  const message = contactMessage.value
    ? `\nMensaje adicional: ${contactMessage.value}`
    : "";
  return `Hola! Quisiera solicitar presupuesto para los siguientes ítems:\n\n${lines}${contact}${message}`;
}

function sendWhatsApp(message = createQuotePayload()) {
  window.open(
    `https://wa.me/5491131250453?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}

function sendQuote() {
  sendWhatsApp(createQuotePayload());
  quoteCartOpen.value = false;
}

function quoteService(service: Service) {
  sendWhatsApp(
    createQuotePayload({
      name: service.name,
      quantity: 1,
      price: 0,
      details: `Servicio: ${service.category}`,
    }),
  );
  activeService.value = null;
}

useHead({
  title: "Kraken | Soluciones Metalúrgicas y Servicios Industriales",
  link: [{ rel: "icon", type: "image/png", href: "/img/iconkraken.png" }],
  meta: [
    {
      name: "description",
      content:
        "Diseñamos, fabricamos e innovamos soluciones industriales B2B de alta precisión.",
    },
    { property: "og:title", content: "Kraken | Ingeniería que toma forma" },
  ],
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap");



.close-button{
        padding-bottom: 5px;
        margin-left: auto;
}


.close-button:hover{
        padding-bottom: 5px;
        margin-left: auto;
        color:var(--red-bright);
}


.clear-button{
  background: none;
  border: none;
  color: var(--red);
  font-size: 15px;
  margin-top: 15px;
  cursor: pointer;
}

.clear-button:hover{
  background: none;
  border: none;
  color: var(--red-bright);
  
  font-size: 15px;
  cursor: pointer;
}
/* Cambia el color de la X nativa del input search */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  height: 14px;
  width: 14px;
  /* Usamos un SVG como máscara para controlar el color exacto */
  background-color: #9ca3af; /* Color deseado (Gris secundario) */
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>")
    no-repeat 50% 50%;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>")
    no-repeat 50% 50%;
  cursor: pointer;
}

/* Opcional: cambio de color al hacer hover */
input[type="search"]::-webkit-search-cancel-button:hover {
  background-color: #dc2626; /* Rojo Kraken */
}

:root {
  --bg: #0f0f12;
  --surface: #18191e;
  --line: #2a2d34;
  --text: #f3f4f6;
  --muted: #9ca3af;
  --red: #dc2626;
  --red-bright: #ef4444;
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Space Grotesk", sans-serif;
}
button,
input,
textarea,
select {
  font: inherit;
}
button,
a {
  -webkit-tap-highlight-color: transparent;
}
a {
  color: inherit;
  text-decoration: none;
}

.site-shell {
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 78% 5%,
      rgba(220, 38, 38, 0.1),
      transparent 28rem
    ),
    var(--bg);
}

.site-header {
  position: relative;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
  padding: 0 5vw;
  background: rgba(15, 15, 18, 0.87);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px);
}

.site-header-scrolled {
  position: fixed;
  right: 0;
  left: 0;
  animation: header-reveal 0.25s ease-out;
}

@keyframes header-reveal {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 13px;
}
.brand i {
  color: var(--muted);
  font-style: normal;
  font-weight: 400;
}
.brand-mark {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid var(--red);
  color: var(--red-bright);
  font-size: 18px;
  transform: skew(-8deg);
}

.desktop-nav {
  display: flex;
  gap: 31px;
  color: var(--muted);
  font-size: 13px;
}
.desktop-nav a,
.mobile-nav a {
  position: relative;
  padding-bottom: 5px;
}
.desktop-nav a::after,
.mobile-nav a::after {
  position: absolute;
  right: 50%;
  bottom: 0;
  left: 50%;
  height: 2px;
  background: var(--red-bright);
  content: "";
  transition:
    left 0.25s ease,
    right 0.25s ease;
}
.desktop-nav a:hover::after,
.desktop-nav a:focus-visible::after,
.mobile-nav a:hover::after,
.mobile-nav a:focus-visible::after {
  right: 0;
  left: 0;
}
.desktop-nav a:hover,
.site-footer a:hover {
  color: var(--text);
}
.header-cta,
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  cursor: pointer;
  transition: 0.25s ease;
}

.header-cta {
  background: transparent;
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
}
.header-cta:hover {
  color: var(--red-bright);
}
.quote-cart {
  position: relative;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  color: var(--text);
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
  transition: 0.25s ease;
}
.quote-cart:hover {
  color: var(--red-bright);
  border-color: var(--red);
}
.quote-cart-count {
  position: absolute;
  top: -7px;
  right: -7px;
  display: grid;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  place-items: center;
  color: var(--text);
  border-radius: 50%;
  background: var(--red);
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}
.menu-toggle {
  display: none;
  background: none;
  color: var(--text);
  border: 0;
}
.mobile-nav {
  position: absolute;
  top: 76px;
  left: 0;
  right: 0;
  display: grid;
  gap: 18px;
  padding: 25px 5vw;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.section-grid,
.content-section,
.process-section,
.calculator-section,
.contact-section {
  max-width: 1280px;
  margin: auto;
  padding-left: 5vw;
  padding-right: 5vw;
}
.hero {
  min-height: 670px;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  align-items: center;
  gap: 5vw;
  padding-top: 64px;
  padding-bottom: 64px;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--red-bright);
  font:
    500 11px "DM Mono",
    monospace;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.status-dot {
  width: 6px;
  height: 6px;
  background: var(--red);
  border-radius: 50%;
  box-shadow: 0 0 14px var(--red);
}
h1,
h2,
h3,
p {
  margin-top: 0;
}
h1 {
  max-width: 660px;
  margin: 24px 0;
  font-size: clamp(42px, 5.6vw, 79px);
  line-height: 0.98;
  letter-spacing: -0.055em;
}
h1 em,
h2 em {
  color: var(--red-bright);
  font-style: normal;
}
.hero-copy > p {
  max-width: 490px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.65;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 34px 0 50px;
}
.button {
  min-height: 48px;
  padding: 0 20px;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}
.button-primary {
  background: var(--red);
  box-shadow: 0 0 25px rgba(220, 38, 38, 0.2);
}
.button-primary:hover {
  background: var(--red-bright);
  box-shadow: 0 0 32px rgba(220, 38, 38, 0.45);
  transform: translateY(-2px);
}
.button-ghost {
  border: 1px solid var(--line);
  background: transparent;
}
.button-ghost:hover {
  border-color: var(--red);
  color: var(--red-bright);
}
.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--muted);
  font:
    10px "DM Mono",
    monospace;
  text-transform: uppercase;
}
.trust-row strong {
  display: block;
  margin-bottom: 5px;
  color: var(--text);
  font-size: 16px;
  font-family: "Space Grotesk";
}
.hero-visual {
  position: relative;
  min-height: 460px;
  border: 1px solid var(--line);
  background:
    linear-gradient(135deg, rgba(42, 45, 52, 0.25), transparent 60%),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 79px,
      rgba(156, 163, 175, 0.06) 80px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 79px,
      rgba(156, 163, 175, 0.06) 80px
    );
  overflow: hidden;
}
.visual-ring {
  position: absolute;
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 50%;
}
.ring-one {
  width: 470px;
  height: 470px;
  left: 10%;
  top: -7%;
}
.ring-two {
  width: 330px;
  height: 330px;
  left: 25%;
  top: 9%;
  border-color: rgba(156, 163, 175, 0.2);
}
.machine-block {
  position: absolute;
  left: 28%;
  top: 20%;
  width: 230px;
  height: 255px;
  transform: perspective(500px) rotateY(-23deg) rotateX(6deg);
}
.machine-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  border: 1px solid #686b73;
  background: linear-gradient(115deg, #34363d, #141519 65%);
  box-shadow:
    24px 30px 0 rgba(0, 0, 0, 0.2),
    0 0 40px rgba(220, 38, 38, 0.12);
}
.machine-top {
  position: absolute;
  width: 100%;
  height: 32px;
  top: -31px;
  left: 22px;
  border: 1px solid #555861;
  background: #292b30;
  transform: skewX(-50deg);
  transform-origin: bottom left;
}
.machine-leg {
  position: absolute;
  bottom: -44px;
  width: 28px;
  height: 46px;
  background: #25272c;
  border: 1px solid #50535a;
}
.leg-one {
  left: 22px;
}
.leg-two {
  right: 20px;
}
.machine-label,
.machine-spec,
.coordinate,
.visual-caption {
  font:
    10px "DM Mono",
    monospace;
  letter-spacing: 0.08em;
}
.machine-label {
  color: var(--red-bright);
}
.machine-line {
  width: 100%;
  height: 1px;
  background: #62656b;
}
.machine-spec {
  color: #d1d5db;
  line-height: 1.7;
}
.coordinate {
  position: absolute;
  color: var(--muted);
}
.coordinate b {
  color: var(--red-bright);
}
.coordinate-a {
  top: 20px;
  right: 20px;
}
.coordinate-b {
  bottom: 40px;
  left: 20px;
}
.visual-caption {
  position: absolute;
  right: 20px;
  bottom: 18px;
  left: 20px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  border-top: 1px solid var(--line);
  padding-top: 12px;
  font-size: 9px;
}

.metrics-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 35px 5vw;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.metrics-band > div {
  display: flex;
  justify-content: center;
  gap: 17px;
}

.metrics-band span {
  color: var(--red);
  font: 11px "DM Mono";
}
.metrics-band strong {
  font-size: 14px;
  line-height: 1.3;
}
.metrics-note {
  justify-content: center;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}
.content-section {
  padding-top: 125px;
  padding-bottom: 125px;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 40px;
  margin-bottom: 46px;
}
h2 {
  margin: 16px 0 0;
  font-size: clamp(32px, 4vw, 54px);
  line-height: 1;
  letter-spacing: -0.05em;
}
.section-heading p {
  max-width: 330px;
  margin-bottom: 4px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}
.service-card {
  position: relative;
  min-height: 145px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 17px;
  padding: 22px;
  color: var(--muted);
  text-align: left;
  border: 0;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
  transition: 0.25s ease;
}
.service-card:hover {
  color: var(--text);
  background: rgba(220, 38, 38, 0.07);
  box-shadow: inset 0 0 0 1px var(--red);
  transform: translateY(-2px);
}
.service-index {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #52555d;
  font: 10px "DM Mono";
}
.service-name {
  max-width: 170px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}
.service-arrow {
  position: absolute;
  right: 20px;
  bottom: 20px;
  color: var(--red);
}
.process-section {
  max-width: none;
  padding-top: 100px;
  padding-bottom: 110px;
  background: var(--surface);
}
.process-section > h2,
.process-section > .eyebrow,
.process-grid {
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}
.process-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin-top: 64px;
  background: var(--line);
}
.process-grid > div {
  min-height: 180px;
  padding: 27px;
  background: var(--surface);
}
.process-grid span {
  color: var(--red-bright);
  font: 11px "DM Mono";
}
.process-grid h3 {
  margin: 35px 0 8px;
  font-size: 20px;
}
.process-grid p {
  max-width: 230px;
  margin-bottom: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}
.catalog-section {
  padding-bottom: 110px;
}
.catalog-layout {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 28px;
  align-items: start;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.product-card {
  border: 1px solid var(--line);
  background: var(--surface);
  transition: 0.25s ease;
}
.product-card:hover {
  border-color: #575b65;
  transform: translateY(-3px);
}
.product-visual {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 160px;
  padding: 22px;
  color: var(--red-bright);
  background: linear-gradient(140deg, #24262c, #15161a);
}
.product-visual span {
  color: var(--muted);
  font: 10px "DM Mono";
}
.product-info {
  padding: 18px 20px 20px;
}
.product-type {
  color: var(--muted);
  font: 10px "DM Mono";
  text-transform: uppercase;
}
.product-info h3 {
  margin: 10px 0 19px;
  font-size: 17px;
}
.product-info > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.product-info strong {
  font-size: 14px;
}
.product-info button,
.modal-close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: var(--text);
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}
.product-info button:hover,
.modal-close:hover {
  color: var(--red-bright);
  border-color: var(--red);
}
.quote-panel,
.calculator {
  padding: 22px;
  border: 1px solid var(--line);
  background: var(--surface);
}
.panel-top,
.calculator-head {
  display: flex;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
  font: 12px "DM Mono";
  text-transform: uppercase;
}

.quote-count {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  color: var(--text);
  background: var(--red);
  font: 10px "Space Grotesk";
  margin-left: 5px;
}

.empty-quote {
  display: grid;
  place-items: center;
  gap: 11px;
  min-height: 190px;
  color: var(--muted);
  text-align: center;
}
.empty-quote p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}
.quote-list {
  min-height: 130px;
  padding: 15px 0;
}
.quote-list > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  color: var(--text);
  font-size: 12px;
  border-bottom: 1px solid var(--line);
}
.quote-list small {
  color: var(--red-bright);
}
.quote-list button {
  color: var(--muted);
  border: 0;
  background: none;
  cursor: pointer;
}
.quote-total {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  color: var(--muted);
  font-size: 11px;
  border-top: 1px solid var(--line);
}
.quote-total strong {
  color: var(--text);
}
.full-button {
  width: 100%;
}
.calculator-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10vw;
  align-items: center;
  max-width: none;
  padding-top: 110px;
  padding-bottom: 110px;
  border-top: 1px solid var(--line);
  background:
    linear-gradient(115deg, rgba(220, 38, 38, 0.08), transparent 44%),
    var(--surface);
}
.calculator-intro {
  max-width: 430px;
  justify-self: end;
}
.calculator-intro p {
  margin: 25px 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}
.estimate-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--red-bright);
  font: 11px "DM Mono";
}
.calculator {
  width: 100%;
  max-width: 510px;
  justify-self: start;
}
.calculator-head {
  color: var(--muted);
}
.calculator label {
  display: block;
  margin-top: 18px;
  color: var(--muted);
  font: 10px "DM Mono";
  text-transform: uppercase;
}
select,
input,
textarea {
  width: 100%;
  color: var(--text);
  border: 1px solid var(--line);
  outline: 0;
  background: #121317;
}
select,
input {
  height: 42px;
  margin-top: 8px;
  padding: 0 12px;
}
textarea {
  resize: vertical;
  padding: 12px;
}
select:focus,
input:focus,
textarea:focus {
  border-color: var(--red);
}
.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.number-input {
  position: relative;
}
.number-input input {
  padding-right: 35px;
}
.number-input span {
  position: absolute;
  right: 12px;
  bottom: 13px;
  color: var(--muted);
  font-size: 10px;
}
.estimate-result {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin: 25px 0 18px;
  padding-top: 17px;
  border-top: 1px solid var(--line);
}
.estimate-result span {
  color: var(--muted);
  font: 10px "DM Mono";
  text-transform: uppercase;
}
.estimate-result strong {
  color: var(--red-bright);
  font-size: 24px;
}
.contact-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10vw;
  padding-top: 130px;
  padding-bottom: 130px;
}
.contact-form {
  display: grid;
  gap: 12px;
}
.file-label {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px;
  color: var(--muted);
  border: 1px dashed var(--line);
  font-size: 12px;
  cursor: pointer;
}
.file-label input {
  display: none;
}
.site-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 28px 5vw;
  color: var(--muted);
  border-top: 1px solid var(--line);
  font: 10px "DM Mono";
}
.site-footer > a:last-child {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
}
.whatsapp-float {
  position: fixed;
  right: 26px;
  bottom: 25px;
  z-index: 15;
  display: grid;
  width: 55px;
  height: 55px;
  place-items: center;
  color: #0f0f12;
  border: 0;
  border-radius: 50%;
  background: #25d366;
  box-shadow: 0 5px 28px rgba(37, 211, 102, 0.25);
  cursor: pointer;
  transition: 0.2s ease;
}
.whatsapp-float:hover {
  transform: scale(1.08);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(5, 5, 7, 0.8);
  backdrop-filter: blur(8px);
}
.service-modal {
  position: relative;
  width: min(490px, 100%);
  padding: 42px;
  border: 1px solid var(--red);
  background: var(--surface);
  box-shadow: 0 0 60px rgba(220, 38, 38, 0.15);
}
.service-modal > svg {
  margin: 34px 0 20px;
  color: var(--red-bright);
}
.service-modal h2 {
  margin-bottom: 16px;
  font-size: 36px;
}
.service-modal p {
  margin-bottom: 28px;
  color: var(--muted);
  line-height: 1.65;
}
.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
}
@media (max-width: 850px) {
  .desktop-nav,
  .header-cta {
    display: none;
  }
  .menu-toggle {
    display: block;
  }
  .hero,
  .calculator-section,
  .contact-section {
    grid-template-columns: 1fr;
  }

  .hero {
    padding-top: 70px;
    padding-bottom: 80px;
  }
  .hero-visual {
    min-height: 370px;
  }
  .calculator-intro,
  .calculator {
    justify-self: stretch;
    max-width: none;
  }
  .metrics-band {
    grid-template-columns: repeat(2, 1fr);
  }
  .metrics-note {
    justify-content: flex-start;
    text-align: left;
  }
  .service-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .catalog-layout {
    grid-template-columns: 1fr;
  }
  .quote-panel {
    order: -1;
  }
  .contact-section {
    gap: 45px;
  }
}
@media (max-width: 520px) {
  .site-header {
    height: 64px;
  }
  .mobile-nav {
    top: 64px;
  }
  h1 {
    font-size: 44px;
  }
  h2 {
    font-size: 35px;
  }
  .hero-visual {
    min-height: 330px;
  }
  .machine-block {
    left: 18%;
    transform: scale(0.82) perspective(500px) rotateY(-23deg) rotateX(6deg);
    transform-origin: left top;
  }
  .ring-one {
    left: -14%;
  }
  .ring-two {
    left: 6%;
  }
  .trust-row {
    gap: 12px;
  }
  .metrics-band {
    gap: 25px 10px;
    padding-top: 28px;
    padding-bottom: 28px;
  }
  .metrics-band strong {
    font-size: 12px;
  }
  .content-section,
  .process-section,
  .calculator-section,
  .contact-section {
    padding-top: 80px;
    padding-bottom: 80px;
  }
  .section-heading {
    display: block;
  }
  .section-heading p {
    margin-top: 24px;
  }
  .service-grid,
  .product-grid,
  .process-grid {
    grid-template-columns: 1fr;
  }
  .service-card {
    min-height: 125px;
  }
  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }
  .site-footer > span {
    max-width: 230px;
    line-height: 1.5;
  }
}

.hero-visual {
  position: relative;
  width: 100%;
  /* 1. ANCHO Y ALTURA: Le damos más espacio para que se expanda horizontalmente */
  width: 900px;
  height: 480px;
  margin: 0 auto;
  overflow: hidden;

  /* 2. MÁSCARA DUAL: Suavizado agresivo en bordes superiores/inferiores y laterales */
  -webkit-mask-image:
    linear-gradient(
      180deg,
      transparent 0%,
      black 25%,
      black 75%,
      transparent 100%
    ),
    linear-gradient(
      90deg,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%
    );
  mask-image:
    linear-gradient(
      180deg,
      transparent 0%,
      black 25%,
      black 75%,
      transparent 100%
    ),
    linear-gradient(
      90deg,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%
    );

  /* Intersección de máscaras para combinar ambas direcciones */
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.brand-logo {
  height: 36px; /* Ajustá la altura según el diseño de tu header */
  width: auto; /* Mantiene la proporción original de la imagen */
  object-fit: contain;
}

/* Asegurar que la etiqueta img dentro ocupe todo el espacio sin deformarse */
.hero-visual .hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-image-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    /* Gradiente vertical: difumina arriba (100% var(--bg)) y abajo */
    linear-gradient(
      180deg,
      var(--bg) 0%,
      transparent 40%,
      transparent 60%,
      var(--bg) 100%
    ),
    /* Gradiente horizontal: difumina izquierda y derecha */
      linear-gradient(
        90deg,
        var(--bg) 0%,
        transparent 30%,
        transparent 70%,
        var(--bg) 100%
      );
}

.about-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10vw;
  max-width: 1280px;
  margin: 0 auto;
  padding: 120px 5vw;
}

.gallery-section {
  padding-top: 110px;
  padding-bottom: 125px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.gallery-item {
  min-width: 0;
  border: 1px solid var(--line);
  background: var(--bg);
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    transform 0.25s ease;
}

.gallery-item:hover,
.gallery-item:focus-visible {
  border-color: var(--red);
  outline: 0;
  transform: translateY(-3px);
}

.gallery-item-featured {
  grid-row: span 2;
}

.gallery-media {
  position: relative;
  height: 235px;
  overflow: hidden;
  background: #121317;
}

.gallery-item-featured .gallery-media {
  height: 100%;
  min-height: 484px;
}

.gallery-media img,
.gallery-media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.72) contrast(1.08);
  transition:
    transform 0.5s ease,
    filter 0.5s ease;
}

.gallery-item:hover .gallery-media img,
.gallery-item:hover .gallery-media video {
  filter: saturate(1) contrast(1.08);
  transform: scale(1.04);
}

.gallery-media::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 48%, rgba(15, 15, 18, 0.72));
  content: "";
  pointer-events: none;
}

.gallery-kind {
  position: absolute;
  right: 15px;
  bottom: 14px;
  z-index: 1;
  padding: 5px 8px;
  color: var(--text);
  border: 1px solid rgba(243, 244, 246, 0.3);
  background: rgba(15, 15, 18, 0.65);
  font:
    10px "DM Mono",
    monospace;
  text-transform: uppercase;
}

.gallery-open {
  position: absolute;
  bottom: 14px;
  left: 15px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text);
  font:
    10px "DM Mono",
    monospace;
  opacity: 0;
  transform: translateY(5px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  text-transform: uppercase;
}

.gallery-item:hover .gallery-open,
.gallery-item:focus-visible .gallery-open {
  opacity: 1;
  transform: translateY(0);
}

.gallery-caption {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 8px 14px;
  padding: 18px 20px 20px;
}

.gallery-caption > span {
  grid-row: span 2;
  color: var(--red-bright);
  font:
    11px "DM Mono",
    monospace;
}

.gallery-caption h3 {
  margin: 0;
  font-size: 17px;
}

.gallery-caption p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.gallery-lightbox-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.5fr);
  width: min(1080px, 100%);
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--red);
  background: var(--surface);
  box-shadow: 0 0 70px rgba(220, 38, 38, 0.18);
}

.gallery-lightbox-panel > img,
.gallery-lightbox-panel > video {
  display: block;
  width: 100%;
  height: min(70vh, 650px);
  object-fit: contain;
  background: #090a0c;
}

.gallery-lightbox-copy {
  display: flex;
  flex-direction: column;
  justify-content: end;
  min-width: 0;
  padding: 38px 44px 42px;
  border-left: 1px solid var(--line);
}

.gallery-lightbox-copy > span {
  color: var(--red-bright);
  font:
    11px "DM Mono",
    monospace;
}

.gallery-lightbox-copy h2 {
  margin: 16px 0 12px;
  font-size: clamp(28px, 3.5vw, 40px);
  line-height: 1.05;
  overflow-wrap: break-word;
}

.gallery-lightbox-copy p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.about-copy p {
  max-width: 480px;
  margin: 28px 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.text-link:hover {
  color: var(--red-bright);
}

.about-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--line);
}

.about-stats > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 150px;
  padding: 25px;
  background: var(--surface);
}

.about-stats strong {
  font-size: clamp(38px, 5vw, 62px);
  letter-spacing: -0.06em;
}

.about-stats strong span {
  color: var(--red-bright);
}

.about-stats small {
  max-width: 140px;
  margin-top: 8px;
  color: var(--muted);
  font:
    10px "DM Mono",
    monospace;
  line-height: 1.5;
  text-transform: uppercase;
}

.about-values {
  grid-column: 1 / -1;
  gap: 13px;
}

.about-values span {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--muted);
  font-size: 12px;
}

.about-values svg {
  color: var(--red-bright);
}

.service-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.service-toolbar > span {
  color: var(--muted);
  font:
    10px "DM Mono",
    monospace;
  text-transform: uppercase;
}

.service-search {
  position: relative;
  width: min(440px, 100%);
}

.service-search svg {
  position: absolute;
  top: 13px;
  left: 13px;
  color: var(--red-bright);
}

.service-search input {
  height: 44px;
  margin: 0;
  padding-left: 42px;
  background: var(--surface);
}

.no-results {
  grid-column: 1 / -1;
  padding: 40px;
  color: var(--muted);
  text-align: center;
}

.marquee-window {
  margin-top: 34px;
  overflow: hidden;
  mask-image: linear-gradient(
    90deg,
    transparent,
    black 8%,
    black 92%,
    transparent
  );
}

.service-marquee {
  display: flex;
  width: max-content;
  animation: marquee 38s linear infinite;
}

.service-marquee:hover {
  animation-play-state: paused;
}

.marquee-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
  margin-right: 10px;
  padding: 13px 16px;
  color: var(--muted);
  border: 1px solid var(--line);
  background: var(--surface);
  font-size: 12px;
}

.marquee-card svg {
  color: var(--red-bright);
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

.spec-list {
  display: grid;
  gap: 11px;
  margin: 0 0 28px;
  padding: 17px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  list-style: none;
}

.spec-list li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--muted);
  font-size: 12px;
}

.spec-list svg {
  color: var(--red-bright);
}

@media (max-width: 850px) {
  .hero-visual,
  .hero-visual .hero-img {
    min-height: 390px;
  }

  .gallery-item-featured .gallery-media {
    min-height: 390px;
  }

  .about-section {
    grid-template-columns: 1fr;
    gap: 45px;
  }
}

@media (max-width: 520px) {
  .service-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .service-search {
    width: 100%;
  }

  .about-section {
    padding-top: 80px;
    padding-bottom: 80px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-item-featured {
    grid-row: auto;
  }

  .gallery-item-featured .gallery-media,
  .gallery-media {
    height: 250px;
    min-height: 250px;
  }

  .gallery-open {
    opacity: 1;
    transform: none;
  }

  .gallery-lightbox-panel {
    display: block;
    max-height: 85vh;
    overflow-y: auto;
  }

  .gallery-lightbox-panel > img,
  .gallery-lightbox-panel > video {
    height: 48vh;
  }

  .gallery-lightbox-copy {
    padding: 24px;
    border-top: 1px solid var(--line);
    border-left: 0;
  }
}

.cart-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -22px 0 22px;
  color: #86efac;
  font:
    11px "DM Mono",
    monospace;
}

.cart-notice svg {
  color: #4ade80;
}

.panel-top {
  align-items: center;
}

.clear-cart {
  margin-left: auto;
  padding: 0;
  color: var(--muted);
  border: 0;
  background: transparent;
  cursor: pointer;
  font:
    10px "DM Mono",
    monospace;
  text-transform: uppercase;
}

.clear-cart:hover {
  color: var(--red-bright);
}

.quote-list > div {
  align-items: center;
}

.quote-item-name {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: var(--text);
}

.quote-item-name small {
  color: var(--muted);
  font-size: 10px;
}

.quote-item-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.quote-item-actions small {
  min-width: 14px;
  color: var(--text);
  text-align: center;
}

.quote-item-actions button {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  padding: 0;
  color: var(--muted);
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}

.quote-item-actions button:hover {
  color: var(--red-bright);
  border-color: var(--red);
}

.full-button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.quote-cart-modal {
  position: relative;
  width: min(520px, 100%);
  max-height: min(80vh, 620px);
  overflow-y: auto;
}

.quote-cart-modal .panel-top {
  padding-right: 42px;
}

.desktop-nav,
.mobile-nav,
.header-cta,
.button {
  font-size: 14px;
}

.quote-cart {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: auto;
  min-width: 116px;
  padding: 0 14px;
}

.quote-cart strong {
  color: var(--text);
  font-size: 12px;
  white-space: nowrap;
}

.cart-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  justify-content: flex-end;
  background: rgba(5, 5, 7, 0.72);
  animation: cart-fade 0.2s ease;
}

.cart-drawer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(410px, 92vw);
  min-height: 100%;
  padding: 42px 30px 30px;
  border-left: 1px solid var(--red);
  background: var(--surface);
  animation: cart-slide 0.3s ease-out;
}

.cart-drawer .cart-list {
  border-top: 1px solid var(--line);
}

.cart-drawer .cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.cart-drawer .cart-item strong,
.cart-drawer .cart-item small {
  display: block;
}

.cart-drawer .cart-item strong {
  font-size: 13px;
}

.cart-drawer .cart-item small {
  margin-top: 5px;
  color: var(--muted);
  font: 10px "DM Mono";
}

.cart-drawer .quantity {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cart-drawer .quantity button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: var(--text);
  border: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}

.cart-drawer .quantity span {
  min-width: 15px;
  text-align: center;
}

.cart-drawer .cart-empty {
      display: grid;
    flex: 1;
    place-content: center;
    gap: 13px;
    color: var(--muted);
    text-align: center;
    justify-items: center;
}

.cart-drawer .cart-empty p {
  margin: 0;
  line-height: 1.6;
}

.cart-drawer .cart-total {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding: 20px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font: 11px "DM Mono";
}

.cart-drawer .cart-total strong {
  color: var(--text);
  font: 600 19px "Space Grotesk";
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  color: var(--text);
  border: 0;
  background: var(--red);
  cursor: pointer;
  font-weight: 600;
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quote-cart-drawer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(440px, 92vw);
  min-height: 100%;
  max-height: 100vh;
  overflow-y: auto;
  padding: 28px;
  animation: cart-slide 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.quote-cart-drawer .quote-list {
  flex: 1;
}

@keyframes cart-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes cart-slide {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.eyebrow,
.trust-row,
.metrics-band span,
.service-index,
.product-type,
.panel-top,
.calculator-head,
.calculator label,
.estimate-tag,
.estimate-result span,
.clear-cart,
.site-footer {
  font-size: 12px;
}

.metrics-note,
.section-heading p,
.calculator-intro p,
.file-label,
.text-link,
.quote-list > div,
.empty-quote p,
.quote-total,
.service-name,
.process-grid p {
  font-size: 14px;
}

.quote-item-name small,
.quote-item-actions small,
.number-input span,
.about-stats small {
  font-size: 12px;
}

.desktop-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 850px) {
  .site-header {
    padding-right: 5vw;
    padding-left: 5vw;
  }

  .desktop-nav {
    position: static;
    transform: none;
  }

  .quote-cart {
    margin-left: auto;
    margin-right: 12px;
  }

  .hero {
    min-height: auto;
    padding-top: 52px;
  }

  .hero-visual {
    width: 100%;
    max-width: 100%;
    height: clamp(300px, 65vw, 420px);
    min-height: 0;
  }

  .hero-visual img {
    min-height: 0;
  }

  .section-heading {
    align-items: start;
  }
}

@media (max-width: 520px) {
  .site-header {
    height: 64px;
  }

  .brand-logo {
    max-width: 150px;
    height: 30px;
  }

  .quote-cart {
    margin-right: 8px;
  }

  .hero {
    gap: 38px;
    padding-top: 42px;
    padding-bottom: 55px;
  }

  .hero-copy > p {
    font-size: 16px;
  }

  .hero-actions {
    margin: 28px 0 38px;
  }

  .hero-visual {
    height: 330px;
  }

  .metrics-band {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .metrics-band > div,
  .metrics-note {
    justify-content: center;
    text-align: center;
  }

  .process-grid > div {
    min-height: 150px;
  }

  .catalog-layout,
  .calculator-section,
  .contact-section {
    gap: 32px;
  }

  .quote-cart-modal {
    max-height: 85vh;
  }

  .quote-cart-drawer {
    width: 100%;
    padding: 24px 20px;
  }
}
</style>
