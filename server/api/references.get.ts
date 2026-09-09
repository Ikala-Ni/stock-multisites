// GET /api/references
//
// Cette route est de la PLOMBERIE : elle lit ce qui suit le "?" dans l'adresse,
// demande les donnees au depot, joint les deux tables, applique la regle, et
// rend le resultat. Le metier vit dans shared/regles.ts, ou il se verifie sans
// demarrer de serveur ni de base.
//
// Elle ne sait PAS d'ou viennent les donnees. Que le depot ait interroge
// PostgreSQL ou relu les fichiers TypeScript ne change rien ici, et c'est tout
// l'interet d'avoir une seule porte.
//
// LE FILTRAGE SE FAIT SUR LE SERVEUR, ET C'EST UN CHOIX.
//
// On pourrait tout envoyer a la page et la laisser filtrer dans le navigateur :
// c'est plus simple a ecrire, et sur dix-huit lignes personne ne verrait la
// difference. Mais un stock reel se compte en milliers de references, et
// filtrer cote page voudrait dire telecharger toute la table a chaque ouverture.
// La regle qu'on se donne : la page demande ce qu'elle affiche, elle ne trie pas
// ce qu'elle n'affichera pas.
//
// Nuxt transforme ce fichier en route d'API par son seul emplacement :
// server/api/references.get.ts repond a GET /api/references. Le ".get" dans le
// nom est ce qui limite la route a cette methode.

import { lireDonnees } from '~~/server/depot'
import { filtrerLignes, joindre } from '~~/shared/regles'
import type { Famille, LigneStock } from '~~/shared/types/stock'

export default defineEventHandler(async (event): Promise<LigneStock[]> => {
  // Tout arrive de l'adresse sous forme de chaine, y compris "true" : c'est
  // pour ca qu'on compare a la chaine et non au booleen.
  const q = getQuery(event)
  const { produits, sites, stocks } = await lireDonnees()

  return filtrerLignes(joindre(stocks, produits, sites), {
    site: typeof q.site === 'string' ? q.site : undefined,
    famille: typeof q.famille === 'string' ? (q.famille as Famille) : undefined,
    recherche: typeof q.recherche === 'string' ? q.recherche : undefined,
    aCommanderSeulement: q.aCommanderSeulement === 'true',
  })
})
