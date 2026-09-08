// GET /api/references
//
// Cette route est de la PLOMBERIE : elle lit ce qui suit le "?" dans l'adresse,
// appelle la regle, et rend le resultat. Le metier - le calcul de l'etat, le
// filtrage, le tri - vit dans shared/regles.ts, ou il se verifie sans demarrer
// de serveur.
//
// LE FILTRAGE SE FAIT SUR LE SERVEUR, ET C'EST UN CHOIX.
//
// On pourrait tout envoyer a la page et la laisser filtrer dans le navigateur :
// c'est plus simple a ecrire, et sur dix-huit lignes personne ne verrait la
// difference. Mais un stock reel se compte en milliers de references, et le
// jour ou ce fichier devient une table, filtrer cote page voudrait dire
// telecharger toute la table a chaque ouverture. La regle qu'on se donne :
// la page demande ce qu'elle affiche, elle ne trie pas ce qu'elle n'affichera
// pas.
//
// Nuxt transforme ce fichier en route d'API par son seul emplacement :
// server/api/references.get.ts repond a GET /api/references. Le ".get" dans le
// nom est ce qui limite la route a cette methode.

import { REFERENCES, SITES } from '~~/server/donnees/references'
import { filtrerReferences } from '~~/shared/regles'
import type { Famille, ReferenceCalculee } from '~~/shared/types/stock'

export default defineEventHandler((event): ReferenceCalculee[] => {
  // Tout arrive de l'adresse sous forme de chaine, y compris "true" : c'est
  // pour ca qu'on compare a la chaine et non au booleen.
  const q = getQuery(event)

  return filtrerReferences(REFERENCES, SITES, {
    site: typeof q.site === 'string' ? q.site : undefined,
    famille: typeof q.famille === 'string' ? (q.famille as Famille) : undefined,
    recherche: typeof q.recherche === 'string' ? q.recherche : undefined,
    aCommanderSeulement: q.aCommanderSeulement === 'true',
  })
})
