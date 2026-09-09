// LA LECTURE DEPUIS POSTGRESQL.
//
// Quatre requetes, ecrites a la main. Pas d'ORM, et c'est un choix : sur un
// projet de cette taille, un ORM ajouterait une couche a apprendre, une
// configuration a tenir, et il cacherait justement ce qu'on cherche a montrer -
// le SQL. Le jour ou les requetes deviennent nombreuses et repetitives, la
// question se reposera.
//
// UN SEUL POOL POUR TOUTE L'APPLICATION.
//
// Ouvrir une connexion a chaque requete HTTP marche tant qu'il y a un visiteur.
// A dix, la base passe son temps a ouvrir et fermer des connexions au lieu de
// repondre. Le pool en garde quelques-unes ouvertes et les prete. Il est cree
// une fois, a la premiere demande, et garde pour la duree du processus.

import { Pool } from 'pg'
import type { Mouvement, Produit, Site, Stock } from '~~/shared/types/stock'

let pool: Pool | null = null

function connexion(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Une base qui ne repond pas en trois secondes ne repondra pas : on
      // preferre echouer vite et replier sur les fichiers plutot que de laisser
      // une page tourner trente secondes avant d'abandonner.
      connectionTimeoutMillis: 3000,
      max: 5,
    })
  }
  return pool
}

/** Est-ce que la base repond ? Sert a /api/source, pas au chemin normal. */
export async function baseJoignable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false
  try {
    await connexion().query('SELECT 1')
    return true
  } catch {
    return false
  }
}

/**
 * Les lignes du tableau, telles que PostgreSQL les rend.
 *
 * Les noms de colonnes sont en minuscules avec des tirets bas - c'est la
 * convention SQL, et PostgreSQL met de toute facon en minuscules ce qu'on ne
 * met pas entre guillemets. Le code TypeScript, lui, ecrit `produitId`. La
 * traduction se fait ICI et nulle part ailleurs : si elle etait faite dans les
 * routes, chaque route la referait a sa facon.
 */
interface LigneProduit {
  id: string
  designation: string
  famille: string
  visuel: string
  description: string
  unite: string
  dimensions: string
  conditionnement: string
  fournisseur: string
}

interface LigneStock {
  produit_id: string
  site_code: string
  quantite: number
  seuil: number
}

interface LigneMouvement {
  produit_id: string
  site_code: string
  date: string
  sens: string
  quantite: number
  motif: string
}

export async function lireDepuisLaBase(): Promise<{
  produits: Produit[]
  sites: Site[]
  stocks: Stock[]
}> {
  const bd = connexion()

  // Les quatre lectures partent EN MEME TEMPS plutot qu'a la suite. Elles ne
  // dependent pas les unes des autres, donc les enchainer ferait attendre quatre
  // allers-retours la ou un seul suffit.
  const [produits, sites, stocks, mouvements] = await Promise.all([
    bd.query<LigneProduit>('SELECT * FROM produits ORDER BY designation'),
    bd.query<Site>('SELECT code, nom, departement FROM sites ORDER BY nom'),
    bd.query<LigneStock>('SELECT produit_id, site_code, quantite, seuil FROM stocks'),
    // La date revient en objet Date ; on la ramene au format AAAA-MM-JJ ici,
    // parce que c'est ce que le reste du code manipule. Le faire en SQL evite
    // une conversion cote JavaScript qui depend du fuseau horaire de la machine
    // - le genre de detail qui decale une date d'un jour la nuit.
    bd.query<LigneMouvement>(`
      SELECT produit_id, site_code, TO_CHAR(date, 'YYYY-MM-DD') AS date, sens, quantite, motif
      FROM mouvements
      ORDER BY date DESC
    `),
  ])

  // Les mouvements sont regroupes par stock AVANT de fabriquer les stocks : sans
  // ce regroupement, il faudrait reparcourir toute la liste des mouvements pour
  // chaque stock, soit dix-huit fois la meme lecture.
  const parStock = new Map<string, Mouvement[]>()
  for (const m of mouvements.rows) {
    const cle = `${m.produit_id}|${m.site_code}`
    const liste = parStock.get(cle) ?? []
    liste.push({
      date: m.date,
      sens: m.sens as Mouvement['sens'],
      quantite: m.quantite,
      motif: m.motif,
    })
    parStock.set(cle, liste)
  }

  return {
    produits: produits.rows.map((p) => ({
      id: p.id,
      designation: p.designation,
      // Les contraintes CHECK du schema garantissent que ces deux colonnes ne
      // contiennent que les valeurs attendues : la base refuse toute autre
      // valeur a l'insertion. La conversion de type est donc sure ici, et elle
      // ne l'est que grace a ces contraintes.
      famille: p.famille as Produit['famille'],
      visuel: p.visuel as Produit['visuel'],
      description: p.description,
      unite: p.unite,
      dimensions: p.dimensions,
      conditionnement: p.conditionnement,
      fournisseur: p.fournisseur,
    })),
    sites: sites.rows,
    stocks: stocks.rows.map((s) => ({
      produitId: s.produit_id,
      siteCode: s.site_code,
      quantite: s.quantite,
      seuil: s.seuil,
      mouvements: parStock.get(`${s.produit_id}|${s.site_code}`) ?? [],
    })),
  }
}
