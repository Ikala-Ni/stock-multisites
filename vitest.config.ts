// Configuration des tests.
//
// Vitest tout seul, sans l'environnement Nuxt : les fonctions verifiees sont
// dans shared/, elles n'ont besoin ni de navigateur ni de serveur. Charger Nuxt
// pour les tester rendrait la suite lente et la ferait echouer pour des raisons
// sans rapport avec ce qu'on verifie.
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    // Les memes raccourcis que dans le projet, pour que les imports s'ecrivent
    // pareil des deux cotes.
    alias: {
      '~~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
