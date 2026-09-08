// LES TYPES DU PROJET.
//
// Ce fichier est dans shared/ et non dans app/ ou server/ : Nuxt 4 rend ce
// dossier disponible des deux cotes. Le serveur qui fabrique une reference et
// la page qui l'affiche parlent donc de la MEME chose, decrite a un seul
// endroit. Le jour ou on ajoute un champ, TypeScript signale tous les endroits
// qui ne le connaissent pas encore, au lieu de laisser une page afficher
// "undefined" sans rien dire.

/** Un site du groupe : un entrepot ou une usine qui detient du stock. */
export interface Site {
  /** Identifiant court et stable, celui qui voyage dans les adresses. */
  code: string
  nom: string
  departement: string
}

/**
 * Les familles de produits.
 *
 * Ecrit comme une union de chaines plutot qu'en `string` : une faute de frappe
 * dans "emballage" devient une erreur signalee a l'ecriture, pas un filtre qui
 * ne renvoie rien un mardi matin sans qu'on comprenne pourquoi.
 */
export type Famille = 'emballage' | 'protection' | 'conditionnement'

/**
 * L'etat d'une ligne de stock.
 *
 * Trois etats nommes, et jamais un simple booleen "en rupture" : entre "il en
 * reste assez" et "il n'y en a plus", il y a le moment ou il faut commander,
 * et c'est le seul qui soit utile a quelqu'un dont c'est le travail.
 */
export type EtatStock = 'suffisant' | 'a-commander' | 'rupture'

/** Une reference d'emballage, telle qu'elle est detenue sur un site donne. */
export interface Reference {
  id: string
  designation: string
  famille: Famille
  /** L'unite dans laquelle on compte : palette, carton, rouleau. */
  unite: string
  siteCode: string
  quantite: number
  /** En dessous de ce nombre, il faut commander. Propre a chaque site. */
  seuil: number
  /** Date du dernier mouvement, au format ISO (AAAA-MM-JJ). */
  dernierMouvement: string
}

/**
 * Une reference telle que l'API la RENVOIE : la reference, plus ce que le
 * serveur a calcule pour elle.
 *
 * L'etat n'est pas stocke, il est calcule. S'il etait enregistre en base, il
 * faudrait penser a le recalculer a chaque mouvement, et le jour ou on oublie,
 * l'ecran affiche "suffisant" sur une ligne vide. Une valeur qui se deduit
 * d'une autre ne se stocke pas.
 */
export interface ReferenceCalculee extends Reference {
  etat: EtatStock
  /** Le nom lisible du site, pour que la page n'ait pas a le rechercher. */
  siteNom: string
}

/** Les filtres que la page envoie a l'API, tous facultatifs. */
export interface FiltresStock {
  site?: string
  famille?: Famille
  /** Ne garder que ce qui est a commander ou en rupture. */
  aCommanderSeulement?: boolean
  /** Recherche libre sur la designation. */
  recherche?: string
}

/** Ce que la page envoie quand elle demande un reapprovisionnement. */
export interface DemandeReappro {
  referenceId: string
  quantite: number
  commentaire?: string
}

/** Ce que le serveur repond a une demande de reapprovisionnement. */
export interface ReponseReappro {
  accepte: boolean
  message: string
  /** Le numero de la demande enregistree, quand elle est acceptee. */
  numero?: string
}
