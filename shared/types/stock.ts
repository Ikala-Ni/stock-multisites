// LES TYPES DU PROJET.
//
// Ce fichier est dans shared/ et non dans app/ ou server/ : Nuxt 4 rend ce
// dossier disponible des deux cotes. Le serveur qui fabrique une reference et
// la page qui l'affiche parlent donc de la MEME chose, decrite a un seul
// endroit. Le jour ou on ajoute un champ, TypeScript signale tous les endroits
// qui ne le connaissent pas encore, au lieu de laisser une page afficher
// "undefined" sans rien dire.
//
// DEUX TABLES, ET C'EST LA DECISION DE MODELE LA PLUS IMPORTANTE DU PROJET.
//
// Un PRODUIT est ce qu'on achete : une cagette bois 30 x 40, ses dimensions,
// son fournisseur, ce a quoi elle sert. Il existe une fois pour le groupe.
// Un STOCK est ce qu'un site en detient : une quantite, un seuil, des
// mouvements. Il existe une fois PAR SITE.
//
// La premiere version melangeait les deux : chaque ligne portait la quantite ET
// la designation ET l'unite. Tant qu'on n'affichait qu'un tableau, ca passait.
// Des qu'il a fallu un catalogue - un ecran qui montre les produits, pas les
// stocks - le defaut est apparu : la description d'une cagette aurait ete
// recopiee sur chaque site qui en detient, et le jour ou on la corrige a Moissac
// elle reste fausse a Agen. Une information qui ne depend pas du site n'a rien a
// faire dans une ligne de site.
//
// C'est aussi ce qui rend concrete la phrase du README sur PostgreSQL : deux
// tables et une cle etrangere, exactement ce qu'on ecrirait en base.

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
 * La silhouette dessinee pour un produit, dans le catalogue.
 *
 * Elle est DECLAREE sur le produit et non deduite de la famille : trois
 * emballages peuvent avoir trois formes tres differentes, et c'est justement ce
 * qu'on veut montrer a quelqu'un qui ne connait pas encore le catalogue.
 */
export type Visuel =
  | 'cagette'
  | 'barquette'
  | 'plateau'
  | 'bobine-film'
  | 'bobine-etiquette'
  | 'filet'
  | 'voile'
  | 'sangle'
  | 'piece-machine'

/**
 * Un produit du catalogue : ce qu'on achete, independamment de qui en detient.
 */
export interface Produit {
  id: string
  designation: string
  famille: Famille
  visuel: Visuel
  /**
   * A quoi ca sert, en une phrase et sans jargon.
   *
   * C'est le champ le plus important du catalogue, et il ne sert a personne qui
   * connait deja la maison. Il sert a la personne arrivee lundi, qui lit
   * "Voile d'hivernage 17 g" et n'a aucun moyen de deviner ce que c'est.
   */
  description: string
  /** L'unite dans laquelle on compte : palette, carton, rouleau. */
  unite: string
  dimensions: string
  /** Ce qu'il y a dans une unite : "12 rouleaux par palette". */
  conditionnement: string
  /** La reference du fournisseur, celle qu'on rappelle en commandant. */
  fournisseur: string
}

/** Un mouvement de stock : une entree ou une sortie, a une date. */
export interface Mouvement {
  /** Format ISO, AAAA-MM-JJ. */
  date: string
  sens: 'entree' | 'sortie'
  /** Toujours positive : c'est `sens` qui porte la direction, pas le signe. */
  quantite: number
  /** D'ou ca vient ou ou ca va : un fournisseur, un chantier, un autre site. */
  motif: string
}

/** Ce qu'un site detient d'un produit. */
export interface Stock {
  produitId: string
  siteCode: string
  quantite: number
  /** En dessous de ce nombre, il faut commander. Propre a chaque site. */
  seuil: number
  /** Du plus recent au plus ancien. */
  mouvements: Mouvement[]
}

/**
 * L'etat d'une ligne de stock.
 *
 * Trois etats nommes, et jamais un simple booleen "en rupture" : entre "il en
 * reste assez" et "il n'y en a plus", il y a le moment ou il faut commander,
 * et c'est le seul qui soit utile a quelqu'un dont c'est le travail.
 */
export type EtatStock = 'suffisant' | 'a-commander' | 'rupture'

/**
 * Une ligne du tableau : un produit vu depuis un site.
 *
 * C'est la jointure des deux tables, plus ce que le serveur a calcule. Elle
 * n'est jamais stockee, elle est fabriquee a la demande - c'est exactement ce
 * que ferait un SELECT avec un JOIN.
 */
export interface LigneStock {
  /** L'identifiant de la ligne : le produit et le site qui la detient. */
  id: string
  produit: Produit
  siteCode: string
  siteNom: string
  quantite: number
  seuil: number
  etat: EtatStock
  /** La date du mouvement le plus recent, ou null si le stock n'a jamais bouge. */
  dernierMouvement: string | null
  mouvements: Mouvement[]
}

/**
 * Une fiche du catalogue : un produit, et ou il se trouve.
 *
 * Le catalogue ne montre pas des lignes de stock, il montre des produits. La
 * repartition est la pour repondre a la seule question qu'on se pose depuis
 * cet ecran : "j'en ai besoin, qui en a ?"
 */
export interface FicheCatalogue {
  produit: Produit
  /** La somme detenue par tous les sites. */
  stockTotal: number
  /** Un site et son etat, du plus critique au moins critique. */
  presences: { siteCode: string; siteNom: string; quantite: number; etat: EtatStock }[]
  /** Le pire etat rencontre : ce qui merite d'etre signale sur la carte. */
  etatLePlusCritique: EtatStock
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
  ligneId: string
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
