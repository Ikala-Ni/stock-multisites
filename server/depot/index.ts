// LE DEPOT : LA SEULE PORTE VERS LES DONNEES.
//
// Les routes ne savent plus d'ou viennent les produits et les stocks. Elles
// demandent au depot, et c'est lui qui sait s'il faut interroger PostgreSQL ou
// relire les fichiers TypeScript.
//
// POURQUOI LES DEUX SOURCES COEXISTENT, ET POURQUOI CE N'EST PAS UNE HESITATION.
//
// Trois situations, trois besoins :
//
//   1. Sur ma machine, avec Docker demarre : je veux la vraie base, avec ses
//      contraintes, ses jointures et son SQL.
//   2. Sur la machine de quelqu'un qui vient de cloner le depot : il doit
//      pouvoir lancer `npm run dev` et voir l'ecran, sans installer Docker ni
//      lire un mode d'emploi. Un projet qu'on ne peut pas demarrer en une
//      commande est un projet que personne n'ouvre.
//   3. En ligne chez Netlify : il n'y a aucune base a joindre, et il n'y en aura
//      pas - une base de demonstration hebergee coute de l'argent tous les mois
//      pour montrer des donnees inventees.
//
// Le choix se fait sur la seule presence de DATABASE_URL. Pas de variable
// "MODE=base" ni de drapeau a poser : la question n'est pas "que veux-tu ?",
// elle est "y a-t-il une base ?", et l'adresse de connexion y repond deja.
//
// CE QUE CETTE STRUCTURE PROUVE. Le README annoncait que brancher une base
// serait un remplacement et non une reecriture. Les routes, les regles, les
// pages et les composants n'ont pas change d'une ligne : ils recoivent les memes
// objets qu'avant.

import { PRODUITS } from '~~/server/donnees/catalogue'
import { SITES, STOCKS } from '~~/server/donnees/stocks'
import { lireDepuisLaBase, baseJoignable } from './postgres'
import type { Produit, Site, Stock } from '~~/shared/types/stock'

export interface Donnees {
  produits: Produit[]
  sites: Site[]
  stocks: Stock[]
  /** D'ou vient ce que vous lisez. Affiche par /api/source. */
  source: 'postgresql' | 'fichiers'
}

/** Les donnees ecrites en TypeScript, le repli qui marche toujours. */
function depuisLesFichiers(): Donnees {
  return { produits: PRODUITS, sites: SITES, stocks: STOCKS, source: 'fichiers' }
}

/**
 * Les donnees, d'ou qu'elles viennent.
 *
 * En cas de panne de la base, on REPLIE sur les fichiers plutot que de renvoyer
 * une erreur. C'est un choix discutable et il merite d'etre defendu : sur une
 * application de gestion reelle, replier serait dangereux - montrer un stock
 * perime sans le dire ferait prendre de mauvaises decisions, et mieux vaut un
 * ecran en panne qu'un ecran qui ment. Ici les deux sources portent les memes
 * donnees inventees, et l'enjeu est qu'une demonstration ne tombe pas devant
 * quelqu'un a cause d'un conteneur arrete.
 *
 * La difference est ecrite a l'ecran : /api/source dit toujours laquelle des
 * deux a repondu, donc le repli n'est jamais silencieux.
 */
export async function lireDonnees(): Promise<Donnees> {
  if (!process.env.DATABASE_URL) return depuisLesFichiers()

  try {
    const { produits, sites, stocks } = await lireDepuisLaBase()
    return { produits, sites, stocks, source: 'postgresql' }
  } catch (erreur) {
    // On ecrit la vraie cause dans la console du serveur : "impossible de lire
    // la base" sans le message d'origine oblige a deviner entre un conteneur
    // arrete, un mot de passe faux et une table absente.
    console.warn(
      '[depot] PostgreSQL est configure mais illisible, repli sur les fichiers.',
      erreur instanceof Error ? erreur.message : erreur
    )
    return depuisLesFichiers()
  }
}

export { baseJoignable }
