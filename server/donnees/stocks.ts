// LES STOCKS : CE QUE CHAQUE SITE DETIENT.
//
// Une ligne par produit et par site. Elle ne porte QUE ce qui depend du site :
// la quantite, le seuil - qui n'est pas le meme partout, un gros site consomme
// plus vite - et les mouvements.
//
// Ce qu'on ne trouve PAS ici : la designation, les dimensions, le fournisseur,
// la description. Tout cela vit dans catalogue.ts, une seule fois. C'est le
// `produitId` qui fait le lien, exactement comme une cle etrangere en base.
//
// Les donnees sont inventees. Les mouvements racontent quand meme quelque chose
// de coherent : la ou le stock est a zero, les sorties recentes l'expliquent.
//
// Le jour ou on branche PostgreSQL, ce fichier et catalogue.ts sont les deux
// seuls a remplacer, et ils deviennent deux tables.

import type { Stock } from '~~/shared/types/stock'
import type { Site } from '~~/shared/types/stock'

export const SITES: Site[] = [
  { code: 'MOI', nom: 'Moissac', departement: '82' },
  { code: 'AGE', nom: 'Agen', departement: '47' },
  { code: 'CAV', nom: 'Cavaillon', departement: '84' },
  { code: 'PER', nom: 'Perpignan', departement: '66' },
  { code: 'ANG', nom: 'Angers', departement: '49' },
]

export const STOCKS: Stock[] = [
  // --- Moissac -------------------------------------------------------------
  {
    produitId: 'CAG-30',
    siteCode: 'MOI',
    quantite: 42,
    seuil: 20,
    mouvements: [
      { date: '2026-09-05', sens: 'sortie', quantite: 8, motif: 'Atelier conditionnement' },
      { date: '2026-08-31', sens: 'entree', quantite: 30, motif: 'Livraison FRN-2210' },
      { date: '2026-08-24', sens: 'sortie', quantite: 12, motif: 'Transfert vers Agen' },
    ],
  },
  {
    produitId: 'BAR-500',
    siteCode: 'MOI',
    quantite: 8,
    seuil: 25,
    mouvements: [
      { date: '2026-09-07', sens: 'sortie', quantite: 14, motif: 'Commande client Sud-Ouest' },
      { date: '2026-09-02', sens: 'sortie', quantite: 9, motif: 'Atelier conditionnement' },
      { date: '2026-08-20', sens: 'entree', quantite: 24, motif: 'Livraison FRN-3108' },
    ],
  },
  {
    produitId: 'FIL-PG',
    siteCode: 'MOI',
    quantite: 0,
    seuil: 6,
    mouvements: [
      { date: '2026-08-28', sens: 'sortie', quantite: 4, motif: 'Verger de Boudou' },
      { date: '2026-08-11', sens: 'sortie', quantite: 6, motif: 'Verger de Durfort' },
      { date: '2026-07-30', sens: 'entree', quantite: 10, motif: 'Livraison FRN-7301' },
    ],
  },
  {
    produitId: 'CER-AUT',
    siteCode: 'MOI',
    quantite: 15,
    seuil: 5,
    mouvements: [
      { date: '2026-09-01', sens: 'sortie', quantite: 1, motif: 'Maintenance ligne 2' },
      { date: '2026-07-15', sens: 'entree', quantite: 12, motif: 'Livraison FRN-9004' },
    ],
  },

  // --- Agen ----------------------------------------------------------------
  {
    produitId: 'CAG-30',
    siteCode: 'AGE',
    quantite: 17,
    seuil: 20,
    mouvements: [
      { date: '2026-09-06', sens: 'sortie', quantite: 11, motif: 'Atelier conditionnement' },
      { date: '2026-08-24', sens: 'entree', quantite: 12, motif: 'Transfert depuis Moissac' },
    ],
  },
  {
    produitId: 'VOI-17',
    siteCode: 'AGE',
    quantite: 34,
    seuil: 10,
    mouvements: [
      { date: '2026-08-30', sens: 'entree', quantite: 20, motif: 'Livraison FRN-7502' },
      { date: '2026-04-12', sens: 'sortie', quantite: 6, motif: 'Fin de campagne gel' },
    ],
  },
  {
    produitId: 'FET-23',
    siteCode: 'AGE',
    quantite: 61,
    seuil: 30,
    mouvements: [
      { date: '2026-09-04', sens: 'sortie', quantite: 7, motif: 'Expédition palettes' },
      { date: '2026-08-18', sens: 'entree', quantite: 48, motif: 'Livraison FRN-5011' },
    ],
  },

  // --- Cavaillon -----------------------------------------------------------
  {
    produitId: 'PLA-60',
    siteCode: 'CAV',
    quantite: 5,
    seuil: 12,
    mouvements: [
      { date: '2026-09-07', sens: 'sortie', quantite: 9, motif: 'Tournée melons' },
      { date: '2026-08-29', sens: 'sortie', quantite: 6, motif: 'Tournée melons' },
      { date: '2026-08-12', sens: 'entree', quantite: 18, motif: 'Retour de tournée' },
    ],
  },
  {
    produitId: 'FIL-OMB',
    siteCode: 'CAV',
    quantite: 22,
    seuil: 8,
    mouvements: [
      { date: '2026-08-22', sens: 'sortie', quantite: 5, motif: 'Serres du Luberon' },
      { date: '2026-06-03', sens: 'entree', quantite: 25, motif: 'Livraison FRN-7318' },
    ],
  },
  {
    produitId: 'CAL-COU',
    siteCode: 'CAV',
    quantite: 3,
    seuil: 4,
    mouvements: [
      { date: '2026-09-02', sens: 'sortie', quantite: 1, motif: 'Maintenance calibreuse 1' },
      { date: '2026-05-20', sens: 'entree', quantite: 6, motif: 'Livraison FRN-9017' },
    ],
  },
  {
    produitId: 'ETI-ADH',
    siteCode: 'CAV',
    quantite: 128,
    seuil: 40,
    mouvements: [
      { date: '2026-09-08', sens: 'sortie', quantite: 6, motif: 'Imprimante ligne 1' },
      { date: '2026-09-01', sens: 'entree', quantite: 100, motif: 'Livraison FRN-6120' },
    ],
  },

  // --- Perpignan -----------------------------------------------------------
  {
    produitId: 'BAR-250',
    siteCode: 'PER',
    quantite: 0,
    seuil: 18,
    mouvements: [
      { date: '2026-09-03', sens: 'sortie', quantite: 12, motif: 'Campagne fraises' },
      { date: '2026-08-27', sens: 'sortie', quantite: 15, motif: 'Campagne fraises' },
      { date: '2026-08-10', sens: 'entree', quantite: 27, motif: 'Livraison FRN-3105' },
    ],
  },
  {
    produitId: 'FIL-ANT',
    siteCode: 'PER',
    quantite: 9,
    seuil: 9,
    mouvements: [
      { date: '2026-08-19', sens: 'sortie', quantite: 6, motif: 'Serres de Saint-Estève' },
      { date: '2026-05-14', sens: 'entree', quantite: 15, motif: 'Livraison FRN-7340' },
    ],
  },
  {
    produitId: 'SAN-POL',
    siteCode: 'PER',
    quantite: 47,
    seuil: 15,
    mouvements: [
      { date: '2026-09-05', sens: 'sortie', quantite: 3, motif: 'Cercleuse ligne 3' },
      { date: '2026-08-01', sens: 'entree', quantite: 40, motif: 'Livraison FRN-8210' },
    ],
  },

  // --- Angers --------------------------------------------------------------
  {
    produitId: 'CAG-40',
    siteCode: 'ANG',
    quantite: 88,
    seuil: 25,
    mouvements: [
      { date: '2026-09-06', sens: 'entree', quantite: 60, motif: 'Livraison FRN-2214' },
      { date: '2026-08-28', sens: 'sortie', quantite: 14, motif: 'Atelier conditionnement' },
    ],
  },
  {
    produitId: 'VOI-30',
    siteCode: 'ANG',
    quantite: 11,
    seuil: 12,
    mouvements: [
      { date: '2026-09-07', sens: 'sortie', quantite: 4, motif: 'Préparation campagne gel' },
      { date: '2026-03-18', sens: 'entree', quantite: 15, motif: 'Livraison FRN-7509' },
    ],
  },
  {
    produitId: 'ENS-MAC',
    siteCode: 'ANG',
    quantite: 6,
    seuil: 3,
    mouvements: [
      { date: '2026-08-25', sens: 'sortie', quantite: 2, motif: 'Maintenance ensacheuse' },
      { date: '2026-06-11', sens: 'entree', quantite: 8, motif: 'Livraison FRN-9026' },
    ],
  },
  {
    produitId: 'FET-17',
    siteCode: 'ANG',
    quantite: 24,
    seuil: 30,
    mouvements: [
      { date: '2026-09-08', sens: 'sortie', quantite: 5, motif: 'Expédition palettes' },
      { date: '2026-08-14', sens: 'entree', quantite: 29, motif: 'Livraison FRN-5008' },
    ],
  },
]
