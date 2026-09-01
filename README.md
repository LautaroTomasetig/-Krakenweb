# Kraken Web

El sitio público tiene dos páginas: `/` y `/catalogo`. El acceso a la gestión no tiene registro y se encuentra en `/admin/login`.

## Administración

Copiá `.env.example` como `.env` y definí las credenciales privadas del único administrador:

```bash
NUXT_ADMIN_EMAIL=admin@example.com
NUXT_ADMIN_PASSWORD=una-clave-segura
```

Después iniciá el proyecto con `npm run dev` y entrá a `/admin/login`. El panel `/admin/productos` permite crear, editar y eliminar productos, incluyendo imágenes y rangos de precio. Los cambios se guardan en `server/data/products.json`.

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
