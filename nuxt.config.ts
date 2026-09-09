// Configuration de Nuxt.
//
// Nuxt fabrique une application Vue complete a partir de conventions de
// dossiers : tout fichier depose dans app/pages devient une adresse, tout
// fichier de app/components est utilisable sans import, et tout fichier de
// server/api devient une route d'API. Ce fichier ne sert donc qu'aux quelques
// choix qui ne se devinent pas.
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-08',

  // Le mode strict de TypeScript est actif par defaut dans Nuxt 4. On le laisse :
  // c'est lui qui refuse qu'une valeur puisse etre nulle sans qu'on l'ait prevu,
  // et c'est tout l'interet d'ecrire en TypeScript plutot qu'en JavaScript.
  typescript: {
    typeCheck: false, // verifie a la demande avec "npm run verifier", pas a chaque sauvegarde
  },

  // Tailwind 4 s'installe comme un plugin de Vite et non plus comme un module
  // Nuxt : il n'y a plus de fichier tailwind.config.js, la configuration se fait
  // dans le CSS lui-meme. Voir app/assets/css/main.css.
  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Suivi de stock multisites',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            "Outil interne de consultation du stock d'emballages réparti sur plusieurs sites.",
        },
      ],
    },
  },
})
