// GET /api/references
//
// LE FILTRAGE SE FAIT ICI, SUR LE SERVEUR, ET C'EST UN CHOIX.
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
import type { EtatStock, Famille, ReferenceCalculee } from '~~/shared/types/stock'

/**
 * L'etat d'une ligne, calcule a partir de la quantite et du seuil.
 *
 * Une seule fonction, appelee au seul endroit ou l'etat est produit. Si ce
 * calcul etait recopie dans la page pour colorer une ligne, les deux versions
 * finiraient par diverger, et l'ecran dirait "a commander" la ou l'API dit
 * "suffisant".
 */
function etatDe(quantite: number, seuil: number): EtatStock {
  if (quantite <= 0) return 'rupture'
  // Au seuil exactement, on commande deja : attendre d'etre en dessous, c'est
  // attendre d'etre en retard.
  if (quantite <= seuil) return 'a-commander'
  return 'suffisant'
}

/** Enleve les accents et la casse, pour que "etiquette" trouve "Etiquette". */
function aPlat(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export default defineEventHandler((event): ReferenceCalculee[] => {
  // getQuery lit ce qui suit le "?" dans l'adresse. Tout en arrive sous forme
  // de chaine, y compris "true" : c'est pour ca qu'on compare a la chaine et
  // non au booleen.
  const q = getQuery(event)
  const site = typeof q.site === 'string' ? q.site : ''
  const famille = typeof q.famille === 'string' ? (q.famille as Famille) : ''
  const recherche = typeof q.recherche === 'string' ? aPlat(q.recherche) : ''
  const aCommanderSeulement = q.aCommanderSeulement === 'true'

  const nomDuSite = new Map(SITES.map((s) => [s.code, s.nom]))

  return REFERENCES
    .filter((r) => (site ? r.siteCode === site : true))
    .filter((r) => (famille ? r.famille === famille : true))
    .filter((r) => (recherche ? aPlat(r.designation).includes(recherche) : true))
    .map((r) => ({
      ...r,
      etat: etatDe(r.quantite, r.seuil),
      // Le repli sur le code n'arrivera jamais avec ces donnees, mais TypeScript
      // a raison d'exiger qu'on le prevoie : une Map peut toujours ne rien
      // trouver, et afficher "undefined" dans une colonne Site serait pire que
      // d'afficher le code.
      siteNom: nomDuSite.get(r.siteCode) ?? r.siteCode,
    }))
    .filter((r) => (aCommanderSeulement ? r.etat !== 'suffisant' : true))
    // A commander d'abord, et a l'interieur, le plus urgent en premier : c'est
    // la seule question que se pose quelqu'un qui ouvre cet ecran le matin.
    .sort((a, b) => {
      const rang: Record<EtatStock, number> = { rupture: 0, 'a-commander': 1, suffisant: 2 }
      if (rang[a.etat] !== rang[b.etat]) return rang[a.etat] - rang[b.etat]
      return a.designation.localeCompare(b.designation, 'fr')
    })
})
