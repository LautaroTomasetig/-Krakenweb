// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    adminEmail: '',
    adminPassword: '',
  },
  app: {
    head: {
      title: 'Kraken | Soluciones Industriales',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Diseño, ingeniería y fabricación metalúrgica de alta precisión.' }
      ],
      link: [
       
        { rel: 'icon', type: 'image/png', href: '/img/iconkraken.png' }
        
      ]
    }
  }
})