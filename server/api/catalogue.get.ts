// GET /api/catalogue
//
// Les produits, et ou ils se trouvent. C'est ce que sert la page "Les produits",
// et ce n'est PAS le meme objet que /api/references.
//
// La difference tient en une phrase : /api/references rend des lignes de stock,
// une par produit ET par site ; celle-ci rend des produits, une fois chacun,
// avec la liste des sites qui en detiennent. Deux ecrans, deux questions, deux
// formes de reponse - servir la seconde depuis la premiere obligerait la page a
// regrouper elle-meme, donc a refaire du metier dans le navigateur.

import { lireDonnees } from '~~/server/depot'
import { aPlat, construireCatalogue } from '~~/shared/regles'
import type { Famille, FicheCatalogue } from '~~/shared/types/stock'

export default defineEventHandler(async (event): Promise<FicheCatalogue[]> => {
  const q = getQuery(event)
  const famille = typeof q.famille === 'string' ? (q.famille as Famille) : ''
  const recherche = typeof q.recherche === 'string' ? aPlat(q.recherche) : ''

  const { produits, sites, stocks } = await lireDonnees()

  return construireCatalogue(produits, stocks, sites)
    .filter((f) => (famille ? f.produit.famille === famille : true))
    .filter((f) =>
      recherche
        ? aPlat(f.produit.designation).includes(recherche) || aPlat(f.produit.description).includes(recherche)
        : true
    )
})
