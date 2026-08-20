
<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="Kraken Group inicio">
  <img 
    src="/img/logo-kraken.png" 
    alt="Kraken Group Logo" 
    class="brand-logo"
  />
</a>
      <nav class="desktop-nav" aria-label="Navegación principal"><a href="#servicios">Servicios</a><a href="#catalogo">Catálogo</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav>
      <button class="header-cta" @click="sendWhatsApp('Hola Kraken, quiero hablar con un especialista.')">Hablar con un especialista <ArrowUpRight :size="16" /></button>
      <button class="menu-toggle" aria-label="Abrir menú" @click="mobileMenuOpen = !mobileMenuOpen"><Menu :size="22" /></button>
      <nav v-if="mobileMenuOpen" class="mobile-nav"><a href="#servicios" @click="mobileMenuOpen = false">Servicios</a><a href="#catalogo" @click="mobileMenuOpen = false">Catálogo</a><a href="#nosotros" @click="mobileMenuOpen = false">Nosotros</a><a href="#contacto" @click="mobileMenuOpen = false">Contacto</a></nav>
    </header>

    <main id="inicio">
      <section class="hero section-grid">
        <div class="hero-copy reveal"><div class="eyebrow"><span class="status-dot" /> Ingeniería · Fabricación · Precisión</div><h1>Soluciones industriales<br><em>que toman forma.</em></h1><p>Diseñamos, fabricamos e innovamos para que tus proyectos avancen con la precisión que exige la industria.</p><div class="hero-actions"><a class="button button-primary" href="#catalogo">Ver catálogo <ArrowUpRight :size="18" /></a><button class="button button-ghost" @click="sendWhatsApp('Hola Kraken, quiero cotizar un proyecto.')"><MessageCircle :size="18" /> Quiero mi cotización</button></div><div class="trust-row"><span><strong>10+</strong> años de trayectoria</span><span><strong>24/7</strong> respuesta comercial</span><span><strong>100%</strong> bajo plano</span></div></div>
        <div class="hero-visual reveal"><img src="/img/heroimg.jpeg" alt="Planta industrial Kraken Group" class="hero-img" /><div class="hero-image-overlay" /><div class="visual-caption"><span>01 / 04</span><span>PLANTA MALVINAS ARGENTINAS</span></div></div>
      </section>

      <section class="metrics-band">
        
        <div><span>01</span><strong>Una planta.<br>21 servicios.</strong></div><div><span>02</span><strong>Del plano<br>a la pieza.</strong></div><div><span>03</span><strong>Tu industria,<br>nuestro foco.</strong></div><div class="metrics-note">Fabricamos soluciones que<br>resuelven lo complejo.</div>
      
      
      </section>

      <section id="nosotros" class="about-section"><div class="about-copy"><div class="eyebrow">01 / Sobre Kraken</div><h2>Una década<br><em>haciendo industria.</em></h2><p>Somos un equipo de ingeniería y fabricación metalúrgica enfocado en resolver lo complejo. Combinamos maquinaria de última generación, criterio técnico y escala mayorista para convertir cada plano en una pieza confiable.</p><a class="text-link" href="#contacto">Conocé nuestra forma de trabajar <ArrowUpRight :size="16" /></a></div><div class="about-stats"><div><strong>10<span>+</span></strong><small>Años de liderazgo industrial</small></div><div><strong>21<span>+</span></strong><small>Servicios en una planta integral</small></div><div><strong>100<span>%</span></strong><small>Venta mayorista y a medida</small></div><div class="about-values"><span><ShieldCheck :size="17" /> Calidad asegurada</span><span><PackageCheck :size="17" /> Envíos a todo el país</span><span><Settings2 :size="17" /> Soluciones personalizadas</span></div></div></section>

      <section id="servicios" class="content-section services-section"><div class="section-heading">
        
        <div>
          <div class="eyebrow">02 / Servicios</div>
          <h2>Todo lo que tu proyecto<br><em>necesita para avanzar.</em></h2>
        </div>
        <p>Un equipo técnico, una planta integral y la capacidad de acompañar cada etapa de tu proyecto.</p>
      </div><div class="service-toolbar"><label class="service-search"><Search :size="17" />
        <input v-model="searchQuery" type="search" placeholder="Buscar capacidad: corte láser, PLC..." aria-label="Buscar servicios"></label>
        <span>{{ filteredServices.length }} servicios encontrados</span></div><div class="service-grid">
          <button v-for="(service, index) in filteredServices" :key="service.name" class="service-card" @click="activeService = service">
            <span class="service-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <component :is="service.icon" :size="22" stroke-width="1.5" />
            <span class="service-name">{{ service.name }}</span>
            <ChevronRight class="service-arrow" :size="17" /></button><div v-if="!filteredServices.length" class="no-results">No encontramos esa capacidad. Probá con otro término.</div></div><div class="marquee-window" aria-label="Todas las servicios industriales"></div></section>

      <section id="proceso" class="process-section"><div class="eyebrow">03 / Método Kraken</div><h2>Precisión en cada <em>movimiento.</em></h2><div class="process-grid"><div><span>01</span><h3>Entendemos</h3><p>Nos metemos en tu operación para encontrar la solución correcta.</p></div><div><span>02</span><h3>Diseñamos</h3><p>Convertimos la necesidad en un plano claro y fabricable.</p></div><div><span>03</span><h3>Fabricamos</h3><p>Producimos, controlamos y entregamos piezas listas para trabajar.</p></div></div></section>

      <section id="catalogo" class="content-section catalog-section">
        <div class="section-heading"><div><div class="eyebrow">04 / Catálogo de cotización</div><h2>Empezá con una<br><em>idea concreta.</em></h2></div><p>Sumá productos a tu pedido de cotización. Un especialista lo revisa y te responde con una propuesta precisa.</p></div><p v-if="cartNotice" class="cart-notice" role="status"><Check :size="15" /> {{ cartNotice }}</p><div class="catalog-layout"><div class="product-grid"><article v-for="product in products" :key="product.code" class="product-card"><div class="product-visual"><component :is="product.icon" :size="40" stroke-width="1" /><span>{{ product.code }}</span></div><div class="product-info"><span class="product-type">{{ product.description }}</span><h3>{{ product.name }}</h3><div><strong>{{ formatPrice(product.price) }}</strong><button aria-label="Agregar a cotización" @click="addToQuote(product)"><Plus :size="18" /></button></div></div></article></div><aside class="quote-panel"><div class="panel-top"><span>Tu cotización</span><span class="quote-count">{{ quoteItems.length }}</span><button v-if="quoteItems.length" class="clear-cart" @click="clearQuote">Vaciar</button></div><div v-if="quoteItems.length" class="quote-list"><div v-for="item in quoteItems" :key="item.name"><span class="quote-item-name">{{ item.name }}<small>{{ formatPrice(item.price) }} c/u</small></span><span class="quote-item-actions"><button aria-label="Restar unidad" @click="updateQuoteQuantity(item.name, -1)"><Minus :size="13" /></button><small>{{ item.quantity }}</small><button aria-label="Agregar unidad" @click="updateQuoteQuantity(item.name, 1)"><Plus :size="13" /></button><button aria-label="Quitar producto" @click="removeFromQuote(item.name)"><X :size="14" /></button></span></div></div><div v-else class="empty-quote"><FileText :size="24" /><p>Tu pedido está vacío.<br>Sumá productos para empezar.</p></div><div class="quote-total"><span>Estimado parcial</span><strong>{{ formatPrice(quoteTotal) }}</strong></div><button class="button button-primary full-button" :disabled="!quoteItems.length" @click="sendQuote">Enviar por WhatsApp <Send :size="16" /></button></aside></div></section>

      <section class="calculator-section"><div class="calculator-intro"><div class="eyebrow">05 / Cotización rápida</div><h2>¿Tenés una medida?<br><em>La hacemos realidad.</em></h2><p>Calculá una referencia inicial y contanos qué necesitás. El valor final se confirma según plano y especificación.</p><div class="estimate-tag"><CircleCheck :size="17" /> Estimación instantánea</div></div><div class="calculator"><div class="calculator-head"><span>Configurá tu pieza</span><span>REF. 2026</span></div><label>Material<select v-model="material"><option>Chapa de acero</option><option>Tubo estructural</option></select></label><div class="input-row"><label>Ancho <div class="number-input"><input v-model.number="width" type="number" min="1"><span>mm</span></div></label><label>Largo <div class="number-input"><input v-model.number="length" type="number" min="1"><span>mm</span></div></label></div><div class="input-row"><label>Espesor <div class="number-input"><input v-model.number="thickness" type="number" min="1"><span>mm</span></div></label><label>Cantidad <div class="number-input"><input v-model.number="quantity" type="number" min="1"><span>un.</span></div></label></div><div class="estimate-result"><span>Referencia estimada</span><strong>{{ formatPrice(calculatorEstimate) }}</strong></div><button class="button button-primary full-button" @click="sendWhatsApp(`Hola Kraken, calculé una pieza de ${material}, ${width} x ${length} mm, espesor ${thickness} mm, cantidad ${quantity}.`)" >Solicitar presupuesto <ArrowUpRight :size="17" /></button></div></section>

      <section id="contacto" class="contact-section"><div><div class="eyebrow">06 / Hablemos</div><h2>Lo complejo es<br><em>nuestro punto de partida.</em></h2></div><form class="contact-form" @submit.prevent="contactSent = true; sendWhatsApp(createQuotePayload())"><input v-model="contactName" required placeholder="Nombre y apellido"><input required type="tel" placeholder="Teléfono / WhatsApp"><textarea v-model="contactMessage" required rows="3" placeholder="Contanos brevemente sobre tu proyecto..." /><label class="file-label"><Plus :size="16" /> Adjuntar plano o archivo <input type="file"></label><button class="button button-primary full-button" type="submit">{{ contactSent ? 'Solicitud enviada' : 'Enviar consulta' }} <Check v-if="contactSent" :size="17" /><Send v-else :size="17" /></button></form></section>
    </main>

    <footer class="site-footer"><a class="brand" href="#inicio"><span class="brand-mark">K</span><span>KRAKEN</span></a><span>© 2024 Kraken. Soluciones industriales B2B.</span><a href="#inicio">Volver arriba <ArrowUpRight :size="15" /></a></footer>
    <button class="whatsapp-float" aria-label="Contactar por WhatsApp" @click="sendWhatsApp('Hola Kraken, quiero hacer una consulta.')"><MessageCircle :size="25" /></button>

    <div v-if="activeService" class="modal-backdrop" @click.self="activeService = null"><div class="service-modal"><button class="modal-close" aria-label="Cerrar" @click="activeService = null"><X :size="19" /></button><div class="eyebrow">{{ activeService.category }}</div><component :is="activeService.icon" :size="35" stroke-width="1.3" /><h2>{{ activeService.name }}</h2><p>{{ activeService.detail }}</p><ul class="spec-list"><li v-for="spec in serviceSpecs(activeService)" :key="spec"><Check :size="15" /> {{ spec }}</li></ul><button class="button button-primary" @click="quoteService(activeService)">Solicitar cotización <ArrowUpRight :size="17" /></button></div></div>
  </div>
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
  Sparkles,
  X,
  Zap,
} from 'lucide-vue-next'

type Service = { name: string; category: string; detail: string; icon: typeof Zap }
type QuoteItem = { name: string; quantity: number; price: number; details?: string }

const services: Service[] = [
  { name: 'Pintura en polvo', category: 'Terminación', detail: 'Acabados resistentes y uniformes para piezas industriales de alto tránsito.', icon: Sparkles },
  { name: 'Corte por láser', category: 'Corte & conformado', detail: 'Corte de chapa de precisión para series cortas, medias y producción continua.', icon: Zap },
  { name: 'Fresado CNC', category: 'Mecanizado', detail: 'Geometrías complejas y tolerancias estrictas en múltiples materiales.', icon: Settings2 },
  { name: 'Plegado', category: 'Corte & conformado', detail: 'Plegado CNC de hasta 3 metros para prototipos y estructuras repetibles.', icon: Layers3 },
  { name: 'Inyección de plástico', category: 'Polímeros', detail: 'Componentes técnicos con matrices optimizadas para cada volumen.', icon: FlaskConical },
  { name: 'Soldadura láser', category: 'Unión', detail: 'Uniones limpias, rápidas y con mínima distorsión térmica.', icon: Gauge },
  { name: 'Soldadura robotizada', category: 'Unión', detail: 'Celdas automatizadas para consistencia y velocidad de producción.', icon: Factory },
  { name: 'Limpieza láser', category: 'Terminación', detail: 'Remoción de óxido, pintura y contaminantes sin abrasivos.', icon: Sparkles },
  { name: 'Electroerosión', category: 'Mecanizado', detail: 'Cavidades y cortes de alta precisión en aceros templados.', icon: Ruler },
  { name: 'Centro de mecanizado', category: 'Mecanizado', detail: 'Producción multieje con control dimensional documentado.', icon: Settings2 },
  { name: 'Tornería', category: 'Mecanizado', detail: 'Piezas torneadas bajo plano y componentes de reposición.', icon: Gauge },
  { name: 'Corte por hilo', category: 'Mecanizado', detail: 'Corte de precisión para matrices, insertos y piezas especiales.', icon: Zap },
  { name: 'Corte de caños por láser', category: 'Corte & conformado', detail: 'Procesamos caños de hasta 240 mm con perforaciones y encastres.', icon: Ruler },
  { name: 'Dobladora de caños', category: 'Corte & conformado', detail: 'Curvado repetible para estructuras, mobiliario y conducción.', icon: Layers3 },
  { name: 'Racks y estanterías industriales', category: 'Soluciones', detail: 'Almacenamiento modular diseñado alrededor de tu operación.', icon: Box },
  { name: 'Impresión 3D', category: 'Prototipado', detail: 'Validación funcional rápida antes de pasar a producción.', icon: Sparkles },
  { name: 'Matrices de estampado', category: 'Herramental', detail: 'Diseño y fabricación de matrices para ciclos de alta exigencia.', icon: Settings2 },
  { name: 'Punzonado', category: 'Corte & conformado', detail: 'Perforaciones y formas repetibles con eficiencia industrial.', icon: Ruler },
  { name: 'Escaneo 3D', category: 'Ingeniería', detail: 'Digitalización de piezas para control, rediseño o réplica.', icon: Gauge },
  { name: 'Tableros PLC y programación', category: 'Automatización', detail: 'Control industrial, puesta en marcha y mejora de procesos.', icon: Factory },
  { name: 'Estampado en prensas 140 TN', category: 'Conformado', detail: 'Estampado robusto para piezas estructurales y componentes seriados.', icon: ShieldCheck },
]

const products = [
  { name: 'Racks industriales', code: 'RK-01', price: 185000, description: 'Carga pesada · modular', icon: Box },
  { name: 'Estanterías modulares', code: 'ES-04', price: 92000, description: 'Adaptable · galvanizada', icon: Layers3 },
  { name: 'Caños curvados', code: 'CC-12', price: 48000, description: 'Bajo plano · repetible', icon: Ruler },
  { name: 'Piezas a medida', code: 'PM-00', price: 0, description: 'Ingeniería · fabricación', icon: Settings2 },
]

const activeService = ref<Service | null>(null)
const quoteItems = ref<QuoteItem[]>([])
const mobileMenuOpen = ref(false)
const searchQuery = ref('')
const material = ref('Chapa de acero')
const width = ref(400)
const length = ref(800)
const thickness = ref(2)
const quantity = ref(10)
const contactSent = ref(false)
const contactName = ref('')
const contactMessage = ref('')
const cartNotice = ref('')

const quoteTotal = computed(() => quoteItems.value.reduce((total, item) => total + item.price * item.quantity, 0))
const calculatorEstimate = computed(() => Math.max(9500, Math.round((width.value * length.value * thickness.value * quantity.value * (material.value === 'Tubo estructural' ? 0.0012 : 0.0009)))))
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const filteredServices = computed(() => {
  const queryWords = normalizeSearch(searchQuery.value).trim().split(/\s+/).filter(Boolean)
  return services.filter((service) => {
    const searchableText = normalizeSearch(`${service.name} ${service.category} ${service.detail}`)
    return queryWords.every((word) => searchableText.includes(word))
  })
})
const marqueeServices = computed(() => [...services, ...services])
const formatPrice = (value: number) => value ? `$ ${value.toLocaleString('es-AR')}` : 'A cotizar'

function serviceSpecs(service: Service) {
  const specs: Record<string, string[]> = {
    'Corte & conformado': ['Formato máximo: 3000 x 1500 mm', 'Tolerancia: +/- 0.1 mm', 'Producción bajo plano'],
    Mecanizado: ['Tolerancia dimensional: hasta 0.01 mm', 'Control multieje', 'Acero, aluminio y polímeros'],
    Unión: ['Cordón de alta resistencia', 'Acero inoxidable y carbono', 'Control visual y dimensional'],
    Terminación: ['Acabado uniforme', 'Tratamiento de superficies', 'Piezas listas para montaje'],
    Automatización: ['Programación PLC', 'Puesta en marcha en planta', 'Documentación técnica'],
  }
  return specs[service.category] || ['Ingeniería bajo plano', 'Control de calidad documentado', 'Producción para series B2B']
}

function addToQuote(product: typeof products[number]) {
  const existing = quoteItems.value.find((item) => item.name === product.name)
  if (existing) existing.quantity += 1
  else quoteItems.value.push({ name: product.name, quantity: 1, price: product.price, details: product.description })
  cartNotice.value = `${product.name} agregado a tu cotización`
  window.setTimeout(() => {
    cartNotice.value = ''
  }, 2400)
}

function updateQuoteQuantity(name: string, change: number) {
  const item = quoteItems.value.find((quoteItem) => quoteItem.name === name)
  if (!item) return

  item.quantity = Math.max(1, item.quantity + change)
}

function removeFromQuote(name: string) {
  quoteItems.value = quoteItems.value.filter((item) => item.name !== name)
}

function clearQuote() {
  quoteItems.value = []
}

function createQuotePayload(extraItem?: QuoteItem) {
  const items = [...quoteItems.value, ...(extraItem ? [extraItem] : [])]
  const lines = items.length
    ? items.map((item) => `- ${item.name}${item.details ? ` (${item.details})` : ''} - Cant: ${item.quantity}`).join('\n')
    : '- Consulta general'
  const contact = contactName.value ? `\n\nNombre: ${contactName.value}` : ''
  const message = contactMessage.value ? `\nMensaje adicional: ${contactMessage.value}` : ''
  return `Hola! Quisiera solicitar presupuesto para los siguientes ítems:\n\n${lines}${contact}${message}`
}

function sendWhatsApp(message = createQuotePayload()) {
  window.open(`https://wa.me/5491123456789?text=${encodeURIComponent(message)}`, '_blank')
}

function sendQuote() {
  sendWhatsApp(createQuotePayload())
}

function quoteService(service: Service) {
  sendWhatsApp(createQuotePayload({ name: service.name, quantity: 1, price: 0, details: `Servicio: ${service.category}` }))
  activeService.value = null
}

useHead({
  title: 'Kraken | Soluciones Metalúrgicas y Servicios Industriales',
  meta: [
    { name: 'description', content: 'Diseñamos, fabricamos e innovamos soluciones industriales B2B de alta precisión.' },
    { property: 'og:title', content: 'Kraken | Ingeniería que toma forma' },
  ],
})
</script>



<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');
:root { 
  --bg: #0f0f12; --surface: #18191e; --line: #2a2d34; --text: #f3f4f6; --muted: #9ca3af; --red: #dc2626;
   --red-bright: #ef4444; }
* { box-sizing: border-box; } 
html { scroll-behavior: smooth; } 
body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Space Grotesk', sans-serif; } 
button, input, textarea, select { font: inherit; } button, 
a { -webkit-tap-highlight-color: transparent; } 
a { color: inherit; text-decoration: none; }

.site-shell { 
  min-height: 100vh;
  overflow: hidden; 
  background: radial-gradient(circle at 78% 5%, rgba(220,38,38,.10), transparent 28rem), var(--bg); } 
  
.site-header { 
  position: sticky; 
  top: 0; z-index: 20; 
  display: flex; align-items: 
  center; justify-content: 
  space-between; height: 76px; 
  padding: 0 5vw; 
  background: rgba(15,15,18,.87); 
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px); } 

  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: .08em; font-size: 13px; } 
  .brand i { color: var(--muted); font-style: normal; font-weight: 400; } 
  .brand-mark { display: grid; width: 29px; height: 29px; place-items: center; border: 1px solid var(--red);
     color: var(--red-bright); font-size: 18px; transform: skew(-8deg); } 
     
     .desktop-nav { display: flex; gap: 31px; color: var(--muted); font-size: 13px; } 
     .desktop-nav a:hover, .site-footer a:hover { color: var(--text); } 
     .header-cta, .button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 0; 
      cursor: pointer; transition: .25s ease; } 
      
      .header-cta { background: transparent; color: var(--text); font-size: 12px; font-weight: 600; } .header-cta:hover { color: var(--red-bright); } .menu-toggle { display: none; background: none; color: var(--text); border: 0; } .mobile-nav { position: absolute; top: 76px; left: 0; right: 0; display: grid; gap: 18px; padding: 25px 5vw; background: var(--surface); border-bottom: 1px solid var(--line); }
.section-grid, .content-section, .process-section, .calculator-section, .contact-section { 
  max-width: 1280px; margin: auto; padding-left: 5vw; padding-right: 5vw; } 
  .hero { min-height: 670px; display: grid; grid-template-columns: .85fr 1.15fr; align-items: center; gap: 5vw; padding-top: 64px; padding-bottom: 64px; }
 .eyebrow { display: flex; align-items: center; gap: 10px; color: var(--red-bright); 
  font: 500 11px 'DM Mono', monospace; letter-spacing: .11em; text-transform: uppercase; } .status-dot { width: 6px; height: 6px; background: var(--red); border-radius: 50%; box-shadow: 0 0 14px var(--red); } h1, h2, h3, p { margin-top: 0; } h1 { max-width: 660px; margin: 24px 0; font-size: clamp(42px, 5.6vw, 79px); line-height: .98; letter-spacing: -.055em; } h1 em, h2 em { color: var(--red-bright); font-style: normal; } .hero-copy > p { max-width: 490px; color: var(--muted); font-size: 17px; line-height: 1.65; } .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 34px 0 50px; } .button { min-height: 48px; padding: 0 20px; color: var(--text); font-size: 13px; font-weight: 600; } .button-primary { background: var(--red); box-shadow: 0 0 25px rgba(220,38,38,.2); } .button-primary:hover { background: var(--red-bright); box-shadow: 0 0 32px rgba(220,38,38,.45); transform: translateY(-2px); } .button-ghost { border: 1px solid var(--line); background: transparent; } .button-ghost:hover { border-color: var(--red); color: var(--red-bright); } .trust-row { display: flex; flex-wrap: wrap; gap: 24px; color: var(--muted); font: 10px 'DM Mono', monospace; text-transform: uppercase; } .trust-row strong { display: block; margin-bottom: 5px; color: var(--text); font-size: 16px; font-family: 'Space Grotesk'; }
.hero-visual { 
position: relative; min-height: 460px; border: 1px solid var(--line); background: linear-gradient(135deg, rgba(42,45,52,.25), transparent 60%), repeating-linear-gradient(90deg, transparent 0, transparent 79px, rgba(156,163,175,.06) 80px), repeating-linear-gradient(0deg, transparent 0, transparent 79px, rgba(156,163,175,.06) 80px); overflow: hidden; } .visual-ring { position: absolute; border: 1px solid rgba(220,38,38,.25); border-radius: 50%; } .ring-one { width: 470px; height: 470px; left: 10%; top: -7%; } .ring-two { width: 330px; height: 330px; left: 25%; top: 9%; border-color: rgba(156,163,175,.2); } .machine-block { position: absolute; left: 28%; top: 20%; width: 230px; height: 255px; transform: perspective(500px) rotateY(-23deg) rotateX(6deg); } .machine-face { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 24px; border: 1px solid #686b73; background: linear-gradient(115deg, #34363d, #141519 65%); box-shadow: 24px 30px 0 rgba(0,0,0,.2), 0 0 40px rgba(220,38,38,.12); } .machine-top { position: absolute; width: 100%; height: 32px; top: -31px; left: 22px; border: 1px solid #555861; background: #292b30; transform: skewX(-50deg); transform-origin: bottom left; } .machine-leg { position: absolute; bottom: -44px; width: 28px; height: 46px; background: #25272c; border: 1px solid #50535a; } .leg-one { left: 22px; } .leg-two { right: 20px; } .machine-label, .machine-spec, .coordinate, .visual-caption { font: 10px 'DM Mono', monospace; letter-spacing: .08em; } .machine-label { color: var(--red-bright); } .machine-line { width: 100%; height: 1px; background: #62656b; } .machine-spec { color: #d1d5db; line-height: 1.7; } .coordinate { position: absolute; color: var(--muted); } .coordinate b { color: var(--red-bright); } .coordinate-a { top: 20px; right: 20px; } .coordinate-b { bottom: 40px; left: 20px; } .visual-caption { position: absolute; right: 20px; bottom: 18px; left: 20px; display: flex; justify-content: space-between; color: var(--muted); border-top: 1px solid var(--line); padding-top: 12px; font-size: 9px; }
.metrics-band { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding: 35px 5vw; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--surface); } .metrics-band > div { display: flex; gap: 17px; } .metrics-band span { color: var(--red); font: 11px 'DM Mono'; } .metrics-band strong { font-size: 14px; line-height: 1.3; } .metrics-note { justify-content: flex-end; color: var(--muted); font-size: 12px; line-height: 1.5; text-align: right; }
.content-section { padding-top: 125px; padding-bottom: 125px; } .section-heading { display: flex; justify-content: space-between; align-items: end; gap: 40px; margin-bottom: 46px; } h2 { margin: 16px 0 0; font-size: clamp(32px, 4vw, 54px); line-height: 1; letter-spacing: -.05em; } .section-heading p { max-width: 330px; margin-bottom: 4px; color: var(--muted); font-size: 14px; line-height: 1.6; } .service-grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); } .service-card { position: relative; min-height: 145px; display: flex; flex-direction: column; align-items: flex-start; gap: 17px; padding: 22px; color: var(--muted); text-align: left; border: 0; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); background: transparent; cursor: pointer; transition: .25s ease; } .service-card:hover { color: var(--text); background: rgba(220,38,38,.07); box-shadow: inset 0 0 0 1px var(--red); transform: translateY(-2px); } .service-index { position: absolute; top: 20px; right: 20px; color: #52555d; font: 10px 'DM Mono'; } .service-name { max-width: 170px; color: var(--text); font-size: 14px; font-weight: 600; line-height: 1.3; } .service-arrow { position: absolute; right: 20px; bottom: 20px; color: var(--red); }
.process-section { max-width: none; padding-top: 100px; padding-bottom: 110px; background: var(--surface); } .process-section > h2, .process-section > .eyebrow, .process-grid { max-width: 1180px; margin-left: auto; margin-right: auto; } .process-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 64px; background: var(--line); } .process-grid > div { min-height: 180px; padding: 27px; background: var(--surface); } .process-grid span { color: var(--red-bright); font: 11px 'DM Mono'; } .process-grid h3 { margin: 35px 0 8px; font-size: 20px; } .process-grid p { max-width: 230px; margin-bottom: 0; color: var(--muted); font-size: 13px; line-height: 1.5; }
.catalog-section { padding-bottom: 110px; } .catalog-layout { display: grid; grid-template-columns: 1fr 310px; gap: 28px; align-items: start; } .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; } .product-card { border: 1px solid var(--line); background: var(--surface); transition: .25s ease; } .product-card:hover { border-color: #575b65; transform: translateY(-3px); } .product-visual { display: flex; align-items: center; justify-content: space-between; min-height: 160px; padding: 22px; color: var(--red-bright); background: linear-gradient(140deg, #24262c, #15161a); } .product-visual span { color: var(--muted); font: 10px 'DM Mono'; } .product-info { padding: 18px 20px 20px; } .product-type { color: var(--muted); font: 10px 'DM Mono'; text-transform: uppercase; } .product-info h3 { margin: 10px 0 19px; font-size: 17px; } .product-info > div { display: flex; align-items: center; justify-content: space-between; } .product-info strong { font-size: 14px; } .product-info button, .modal-close { display: grid; place-items: center; width: 34px; height: 34px; color: var(--text); border: 1px solid var(--line); background: transparent; cursor: pointer; } .product-info button:hover, .modal-close:hover { color: var(--red-bright); border-color: var(--red); } .quote-panel, .calculator { padding: 22px; border: 1px solid var(--line); background: var(--surface); } .panel-top, .calculator-head { display: flex; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid var(--line); font: 12px 'DM Mono'; text-transform: uppercase; } 



.quote-count { 
  display: grid; width: 20px; 
  height: 20px; 
  place-items: center; border-radius: 50%; color: var(--text); 
  background: var(--red); font: 10px 'Space Grotesk';
  margin-left: 5px; } 
  
  .empty-quote { display: grid; place-items: center; gap: 11px; min-height: 190px; color: var(--muted); text-align: center; } .empty-quote p { margin: 0; font-size: 12px; line-height: 1.6; } .quote-list { min-height: 130px; padding: 15px 0; } .quote-list > div { display: flex; justify-content: space-between; gap: 10px; padding: 10px 0; color: var(--text); font-size: 12px; border-bottom: 1px solid var(--line); } .quote-list small { color: var(--red-bright); } .quote-list button { color: var(--muted); border: 0; background: none; cursor: pointer; } .quote-total { display: flex; justify-content: space-between; padding: 15px 0; color: var(--muted); font-size: 11px; border-top: 1px solid var(--line); } .quote-total strong { color: var(--text); } .full-button { width: 100%; }
.calculator-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10vw; align-items: center; max-width: none; padding-top: 110px; padding-bottom: 110px; border-top: 1px solid var(--line); background: linear-gradient(115deg, rgba(220,38,38,.08), transparent 44%), var(--surface); } .calculator-intro { max-width: 430px; justify-self: end; } .calculator-intro p { margin: 25px 0; color: var(--muted); font-size: 14px; line-height: 1.7; } .estimate-tag { display: inline-flex; align-items: center; gap: 8px; color: var(--red-bright); font: 11px 'DM Mono'; } .calculator { width: 100%; max-width: 510px; justify-self: start; } .calculator-head { color: var(--muted); } .calculator label { display: block; margin-top: 18px; color: var(--muted); font: 10px 'DM Mono'; text-transform: uppercase; } select, input, textarea { width: 100%; color: var(--text); border: 1px solid var(--line); outline: 0; background: #121317; } select, input { height: 42px; margin-top: 8px; padding: 0 12px; } textarea { resize: vertical; padding: 12px; } select:focus, input:focus, textarea:focus { border-color: var(--red); } .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; } .number-input { position: relative; } .number-input input { padding-right: 35px; } .number-input span { position: absolute; right: 12px; bottom: 13px; color: var(--muted); font-size: 10px; } .estimate-result { display: flex; align-items: end; justify-content: space-between; margin: 25px 0 18px; padding-top: 17px; border-top: 1px solid var(--line); } .estimate-result span { color: var(--muted); font: 10px 'DM Mono'; text-transform: uppercase; } .estimate-result strong { color: var(--red-bright); font-size: 24px; }
.contact-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10vw; padding-top: 130px; padding-bottom: 130px; } .contact-form { display: grid; gap: 12px; } .file-label { display: flex; align-items: center; gap: 9px; padding: 13px; color: var(--muted); border: 1px dashed var(--line); font-size: 12px; cursor: pointer; } .file-label input { display: none; } .site-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 28px 5vw; color: var(--muted); border-top: 1px solid var(--line); font: 10px 'DM Mono'; } .site-footer > a:last-child { display: flex; align-items: center; gap: 8px; color: var(--text); } .whatsapp-float { position: fixed; right: 26px; bottom: 25px; z-index: 15; display: grid; width: 55px; height: 55px; place-items: center; color: #0f0f12; border: 0; border-radius: 50%; background: #25d366; box-shadow: 0 5px 28px rgba(37,211,102,.25); cursor: pointer; transition: .2s ease; } .whatsapp-float:hover { transform: scale(1.08); }


.modal-backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 24px; background: rgba(5,5,7,.8); backdrop-filter: blur(8px); } .service-modal { position: relative; width: min(490px, 100%); padding: 42px; border: 1px solid var(--red); background: var(--surface); box-shadow: 0 0 60px rgba(220,38,38,.15); } .service-modal > svg { margin: 34px 0 20px; color: var(--red-bright); } .service-modal h2 { margin-bottom: 16px; font-size: 36px; } .service-modal p { margin-bottom: 28px; color: var(--muted); line-height: 1.65; } .modal-close { position: absolute; top: 18px; right: 18px; }
@media (max-width: 850px) { .desktop-nav, .header-cta { display: none; } .menu-toggle { display: block; } .hero, .calculator-section, .contact-section { grid-template-columns: 1fr; } 

.hero { padding-top: 70px; padding-bottom: 80px; } .hero-visual { min-height: 370px; } .calculator-intro, .calculator { justify-self: stretch; max-width: none; } .metrics-band { grid-template-columns: repeat(2, 1fr); } .metrics-note { justify-content: flex-start; text-align: left; } .service-grid { grid-template-columns: repeat(2, 1fr); } .catalog-layout { grid-template-columns: 1fr; } .quote-panel { order: -1; } .contact-section { gap: 45px; } }
@media (max-width: 520px) { .site-header { height: 64px; } .mobile-nav { top: 64px; } h1 { font-size: 44px; } h2 { font-size: 35px; } .hero-visual { min-height: 330px; } .machine-block { left: 18%; transform: scale(.82) perspective(500px) rotateY(-23deg) rotateX(6deg); transform-origin: left top; } .ring-one { left: -14%; } .ring-two { left: 6%; } .trust-row { gap: 12px; } .metrics-band { gap: 25px 10px; padding-top: 28px; padding-bottom: 28px; } .metrics-band strong { font-size: 12px; } .content-section, .process-section, .calculator-section, .contact-section { padding-top: 80px; padding-bottom: 80px; } .section-heading { display: block; } .section-heading p { margin-top: 24px; } .service-grid, .product-grid, .process-grid { grid-template-columns: 1fr; } .service-card { min-height: 125px; } .site-footer { align-items: flex-start; flex-direction: column; } .site-footer > span { max-width: 230px; line-height: 1.5; } }

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
    linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%),
    linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
  mask-image: 
    linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%),
    linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);

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
  width: auto;  /* Mantiene la proporción original de la imagen */
  object-fit: contain;
}

/* Asegurar que la etiqueta img dentro ocupe todo el espacio sin deformarse */
.hero-visual img {
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
    linear-gradient(180deg, var(--bg) 0%, transparent 40%, transparent 60%, var(--bg) 100%),
    /* Gradiente horizontal: difumina izquierda y derecha */
    linear-gradient(90deg, var(--bg) 0%, transparent 30%, transparent 70%, var(--bg) 100%);
}

.about-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10vw;
  max-width: 1280px;
  margin: 0 auto;
  padding: 120px 5vw;
  border-top: 1px solid var(--line);
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
  letter-spacing: -.06em;
}

.about-stats strong span {
  color: var(--red-bright);
}

.about-stats small {
  max-width: 140px;
  margin-top: 8px;
  color: var(--muted);
  font: 10px 'DM Mono', monospace;
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
  font: 10px 'DM Mono', monospace;
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
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
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
  to { transform: translateX(-50%); }
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
  .hero-visual img {
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
}

.cart-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -22px 0 22px;
  color: #86efac;
  font: 11px 'DM Mono', monospace;
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
  font: 10px 'DM Mono', monospace;
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
  opacity: .42;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>
