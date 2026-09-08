// LES REGLES METIER, SORTIES DES ROUTES.
//
// Ces fonctions decident : quel etat porte une ligne, quelles references
// repondent a une selection, une quantite demandee est-elle acceptable. Elles
// vivaient dans server/api/references.get.ts, melangees a la lecture de la
// requete HTTP.
//
// POURQUOI LES AVOIR SORTIES.
//
// Une regle enfermee dans une route ne peut etre appelee que par un appel HTTP.
// Pour verifier qu'une quantite de 0 est refusee, il fallait demarrer un
// serveur, envoyer une requete et lire une reponse - trois choses qui peuvent
// echouer pour des raisons qui n'ont rien a voir avec la regle. Ici, la meme
// verification est un appel de fonction.
//
// Ce n'est pas un amenagement pour les tests. C'est le bon decoupage, et les
// tests ne font que le rendre visible : la route HTTP est de la plomberie -
// elle lit une adresse et rend une reponse - et le metier n'a pas a en dependre.
// Le jour ou ces memes regles doivent servir ailleurs (une tache planifiee, un
// export, un autre ecran), elles sont deja disponibles.

import type { EtatStock, Famille, FiltresStock, Reference, ReferenceCalculee, Site } from './types/stock'

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
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** L'urgence d'abord : c'est la seule question qu'on se pose le matin. */
const RANG: Record<EtatStock, number> = { rupture: 0, 'a-commander': 1, suffisant: 2 }

/**
 * Les references qui repondent a une selection, calculees et triees.
 *
 * Elle recoit les donnees en argument plutot que de les importer : c'est ce qui
 * permet de la verifier sur trois lignes fabriquees pour l'occasion, au lieu de
 * dependre des dix-huit references de demonstration - qui changeront, et
 * feraient alors echouer des tests qui n'ont rien a voir.
 */
export function filtrerReferences(
  references: Reference[],
  sites: Site[],
  filtres: FiltresStock = {}
): ReferenceCalculee[] {
  const nomDuSite = new Map(sites.map((s) => [s.code, s.nom]))
  const recherche = filtres.recherche ? aPlat(filtres.recherche) : ''

  return references
    .filter((r) => (filtres.site ? r.siteCode === filtres.site : true))
    .filter((r) => (filtres.famille ? r.famille === filtres.famille : true))
    .filter((r) => (recherche ? aPlat(r.designation).includes(recherche) : true))
    .map((r) => ({
      ...r,
      etat: etatDe(r.quantite, r.seuil),
      // Le repli sur le code n'arrivera pas avec les donnees du projet, mais
      // TypeScript a raison d'exiger qu'on le prevoie : une Map peut toujours
      // ne rien trouver, et afficher "undefined" dans une colonne Site serait
      // pire que d'afficher le code.
      siteNom: nomDuSite.get(r.siteCode) ?? r.siteCode,
    }))
    .filter((r) => (filtres.aCommanderSeulement ? r.etat !== 'suffisant' : true))
    .sort((a, b) => {
      if (RANG[a.etat] !== RANG[b.etat]) return RANG[a.etat] - RANG[b.etat]
      return a.designation.localeCompare(b.designation, 'fr')
    })
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
