// LES REGLES METIER, SORTIES DES ROUTES.
//
// Ces fonctions decident : quel etat porte une ligne, quelles lignes repondent a
// une selection, comment le catalogue se construit, une quantite demandee
// est-elle acceptable.
//
// POURQUOI ELLES NE SONT PAS DANS LES ROUTES.
//
// Une regle enfermee dans une route ne peut etre appelee que par un appel HTTP.
// Pour verifier qu'une quantite de 0 est refusee, il faudrait demarrer un
// serveur, envoyer une requete et lire une reponse - trois choses qui peuvent
// echouer pour des raisons qui n'ont rien a voir avec la regle. Ici, la meme
// verification est un appel de fonction.
//
// Ce n'est pas un amenagement pour les tests. C'est le bon decoupage, et les
// tests ne font que le rendre visible : la route HTTP est de la plomberie -
// elle lit une adresse et rend une reponse - et le metier n'a pas a en dependre.

import type {
  EtatStock,
  FicheCatalogue,
  FiltresStock,
  LigneStock,
  Mouvement,
  Produit,
  Site,
  Stock,
} from './types/stock'

/** Au-dela de cette quantite, une demande de reapprovisionnement est refusee. */
export const QUANTITE_MAX = 500

/**
 * L'etat d'une ligne, calcule a partir de la quantite et du seuil.
 *
 * Une seule fonction, appelee au seul endroit ou l'etat est produit. Si ce
 * calcul etait recopie dans la page pour colorer une ligne, les deux versions
 * finiraient par diverger, et l'ecran dirait "a commander" la ou l'API dit
 * "suffisant".
 */
export function etatDe(quantite: number, seuil: number): EtatStock {
  if (quantite <= 0) return 'rupture'
  // Au seuil exactement, on commande deja : attendre d'etre en dessous, c'est
  // attendre d'etre en retard.
  if (quantite <= seuil) return 'a-commander'
  return 'suffisant'
}

/** Enleve les accents et la casse, pour que "etiquette" trouve "Etiquette". */
export function aPlat(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** L'urgence d'abord : c'est la seule question qu'on se pose le matin. */
const RANG: Record<EtatStock, number> = { rupture: 0, 'a-commander': 1, suffisant: 2 }

/** L'identifiant d'une ligne du tableau : un produit vu depuis un site. */
export const idDeLigne = (produitId: string, siteCode: string) => `${siteCode}-${produitId}`

/** Le mouvement le plus recent, ou null si le stock n'a jamais bouge. */
function dateDuDernierMouvement(mouvements: Mouvement[]): string | null {
  if (!mouvements.length) return null
  // On ne suppose PAS que le tableau est deja trie : une donnee qui arrive d'une
  // base ou d'un import n'a aucune raison de l'etre, et une supposition tacite
  // est exactement ce qui casse six mois plus tard sans prevenir.
  return mouvements.reduce((plusRecent, m) => (m.date > plusRecent ? m.date : plusRecent), mouvements[0]!.date)
}

/**
 * LA JOINTURE : un stock plus son produit, plus ce qu'on calcule.
 *
 * C'est exactement ce que ferait un SELECT avec un JOIN, ecrit a la main parce
 * que les donnees vivent dans deux fichiers plutot que dans deux tables. Le jour
 * ou on branche PostgreSQL, cette fonction disparait au profit d'une requete, et
 * rien d'autre ne bouge.
 *
 * Un stock dont le produit est introuvable est ECARTE, et c'est un choix : une
 * ligne sans designation n'est pas affichable, et l'inventer serait pire que de
 * ne rien montrer. En base, c'est la cle etrangere qui rendrait le cas
 * impossible ; ici, rien ne l'empeche, donc on le traite.
 */
export function joindre(stocks: Stock[], produits: Produit[], sites: Site[]): LigneStock[] {
  const parId = new Map(produits.map((p) => [p.id, p]))
  const nomDuSite = new Map(sites.map((s) => [s.code, s.nom]))

  return stocks.flatMap((s) => {
    const produit = parId.get(s.produitId)
    if (!produit) return []

    return [
      {
        id: idDeLigne(s.produitId, s.siteCode),
        produit,
        siteCode: s.siteCode,
        // Le repli sur le code : une Map peut toujours ne rien trouver, et
        // afficher "undefined" dans une colonne Site serait pire que le code.
        siteNom: nomDuSite.get(s.siteCode) ?? s.siteCode,
        quantite: s.quantite,
        seuil: s.seuil,
        etat: etatDe(s.quantite, s.seuil),
        dernierMouvement: dateDuDernierMouvement(s.mouvements),
        mouvements: [...s.mouvements].sort((a, b) => b.date.localeCompare(a.date)),
      },
    ]
  })
}

/**
 * Les lignes qui repondent a une selection, triees par urgence.
 *
 * Elle recoit les lignes deja jointes plutot que de les fabriquer : filtrer et
 * joindre sont deux travaux, et les separer permet de verifier chacun sans
 * l'autre.
 */
export function filtrerLignes(lignes: LigneStock[], filtres: FiltresStock = {}): LigneStock[] {
  const recherche = filtres.recherche ? aPlat(filtres.recherche) : ''

  return lignes
    .filter((l) => (filtres.site ? l.siteCode === filtres.site : true))
    .filter((l) => (filtres.famille ? l.produit.famille === filtres.famille : true))
    .filter((l) => (recherche ? aPlat(l.produit.designation).includes(recherche) : true))
    .filter((l) => (filtres.aCommanderSeulement ? l.etat !== 'suffisant' : true))
    .sort((a, b) => {
      if (RANG[a.etat] !== RANG[b.etat]) return RANG[a.etat] - RANG[b.etat]
      return a.produit.designation.localeCompare(b.produit.designation, 'fr')
    })
}

/**
 * LE CATALOGUE : les produits, et ou ils se trouvent.
 *
 * Cet ecran ne montre pas des lignes de stock, il montre des PRODUITS. C'est la
 * difference qui a impose deux tables : une cagette est une cagette, qu'elle
 * soit a Moissac ou a Agen.
 *
 * Un produit que personne ne detient apparait quand meme, avec un stock de zero.
 * C'est voulu : le catalogue sert a decouvrir ce qui existe, et un produit
 * absent de tous les sites reste un produit qu'on peut commander. Le masquer
 * ferait croire qu'il n'existe pas.
 *
 * L'ordre est alphabetique et non par urgence : ici on cherche un produit qu'on
 * a en tete, on ne surveille pas un stock. Le tri par urgence est le bon sur le
 * tableau, il serait desorientant ici - un produit ne serait jamais deux jours
 * de suite au meme endroit de la grille.
 */
export function construireCatalogue(
  produits: Produit[],
  stocks: Stock[],
  sites: Site[]
): FicheCatalogue[] {
  const nomDuSite = new Map(sites.map((s) => [s.code, s.nom]))

  return produits
    .map((produit) => {
      const presences = stocks
        .filter((s) => s.produitId === produit.id)
        .map((s) => ({
          siteCode: s.siteCode,
          siteNom: nomDuSite.get(s.siteCode) ?? s.siteCode,
          quantite: s.quantite,
          etat: etatDe(s.quantite, s.seuil),
        }))
        .sort((a, b) => RANG[a.etat] - RANG[b.etat] || a.siteNom.localeCompare(b.siteNom, 'fr'))

      return {
        produit,
        stockTotal: presences.reduce((somme, p) => somme + p.quantite, 0),
        presences,
        // Le pire etat rencontre. Sans presence, c'est une rupture : personne
        // n'en a, ce qui est bien la situation la plus critique possible.
        etatLePlusCritique: presences.length
          ? presences.reduce<EtatStock>((pire, p) => (RANG[p.etat] < RANG[pire] ? p.etat : pire), 'suffisant')
          : 'rupture',
      }
    })
    .sort((a, b) => a.produit.designation.localeCompare(b.produit.designation, 'fr'))
}

/** Le refus d'une quantite, ou null si elle est acceptable. */
export type RefusQuantite = { statut: 400; raison: string } | null

/**
 * Une quantite demandee est-elle acceptable.
 *
 * Elle rend le refus au lieu de le lancer : lancer une erreur est le travail de
 * la route HTTP, qui seule sait qu'on repond en HTTP. La regle, elle, dit
 * seulement oui ou non, et pourquoi.
 */
export function verifierQuantite(valeur: unknown, unitePluriel: string): RefusQuantite {
  const quantite = Number(valeur)
  if (!Number.isInteger(quantite) || quantite <= 0) {
    return { statut: 400, raison: 'La quantite doit etre un nombre entier superieur a zero.' }
  }
  if (quantite > QUANTITE_MAX) {
    return { statut: 400, raison: `La quantite demandee depasse le maximum de ${QUANTITE_MAX} ${unitePluriel}.` }
  }
  return null
}
