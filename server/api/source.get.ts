// GET /api/source
//
// D'ou viennent les donnees que vous lisez : "postgresql" ou "fichiers".
//
// POURQUOI CETTE ROUTE EXISTE. Le depot replie sur les fichiers quand la base
// ne repond pas, ce qui evite qu'une demonstration tombe a cause d'un conteneur
// arrete. Mais un repli SILENCIEUX est un piege : on croirait interroger la base
// alors qu'on lit des fichiers, et on chercherait pendant une heure pourquoi une
// modification faite en SQL n'apparait pas a l'ecran.
//
// La regle est la meme que partout ailleurs ici : un ecart entre ce qu'on croit
// et ce qui se passe doit etre visible, pas devine.

import { baseJoignable, lireDonnees } from '~~/server/depot'

export default defineEventHandler(async () => {
  const { source, produits, stocks } = await lireDonnees()

  return {
    source,
    configuree: Boolean(process.env.DATABASE_URL),
    joignable: await baseJoignable(),
    produits: produits.length,
    stocks: stocks.length,
  }
})
