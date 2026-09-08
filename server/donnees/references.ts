// LES DONNEES DE DEMONSTRATION.
//
// Elles sont inventees de bout en bout : aucun site, aucune reference et aucun
// chiffre ne correspond a une entreprise reelle. Elles vivent dans un fichier
// TypeScript plutot que dans une base de donnees parce que ce projet montre le
// front et l'API ; brancher PostgreSQL ne changerait rien a ce que la page
// affiche, et rajouterait une installation a faire avant de pouvoir lancer le
// projet. Le jour ou on branche une vraie base, c'est ce fichier-ci qu'on
// remplace, et rien d'autre : les routes d'API et la page ne le savent pas.

import type { Reference, Site } from '~~/shared/types/stock'

export const SITES: Site[] = [
  { code: 'MOI', nom: 'Moissac', departement: '82' },
  { code: 'AGE', nom: 'Agen', departement: '47' },
  { code: 'CAV', nom: 'Cavaillon', departement: '84' },
  { code: 'PER', nom: 'Perpignan', departement: '66' },
  { code: 'ANG', nom: 'Angers', departement: '49' },
]

export const REFERENCES: Reference[] = [
  // Moissac
  { id: 'MOI-CAG-30', designation: 'Cagette bois 30 x 40', famille: 'emballage', unite: 'palette', siteCode: 'MOI', quantite: 42, seuil: 20, dernierMouvement: '2026-09-05' },
  { id: 'MOI-BAR-500', designation: 'Barquette carton 500 g', famille: 'emballage', unite: 'carton', siteCode: 'MOI', quantite: 8, seuil: 25, dernierMouvement: '2026-09-07' },
  { id: 'MOI-FIL-PG', designation: 'Filet paragrele 8 m', famille: 'protection', unite: 'rouleau', siteCode: 'MOI', quantite: 0, seuil: 6, dernierMouvement: '2026-08-28' },
  { id: 'MOI-CER-AUT', designation: 'Cercleuse automatique, pieces d usure', famille: 'conditionnement', unite: 'lot', siteCode: 'MOI', quantite: 15, seuil: 5, dernierMouvement: '2026-09-01' },

  // Agen
  { id: 'AGE-CAG-30', designation: 'Cagette bois 30 x 40', famille: 'emballage', unite: 'palette', siteCode: 'AGE', quantite: 17, seuil: 20, dernierMouvement: '2026-09-06' },
  { id: 'AGE-VOI-HIV', designation: 'Voile d hivernage 17 g', famille: 'protection', unite: 'rouleau', siteCode: 'AGE', quantite: 34, seuil: 10, dernierMouvement: '2026-08-30' },
  { id: 'AGE-FET-ETI', designation: 'Film etirable 23 microns', famille: 'emballage', unite: 'carton', siteCode: 'AGE', quantite: 61, seuil: 30, dernierMouvement: '2026-09-04' },

  // Cavaillon
  { id: 'CAV-PLA-60', designation: 'Plateau plastique 60 x 40', famille: 'emballage', unite: 'palette', siteCode: 'CAV', quantite: 5, seuil: 12, dernierMouvement: '2026-09-07' },
  { id: 'CAV-FIL-OMB', designation: 'Filet d ombrage 40 pour cent', famille: 'protection', unite: 'rouleau', siteCode: 'CAV', quantite: 22, seuil: 8, dernierMouvement: '2026-08-22' },
  { id: 'CAV-OPE-CAL', designation: 'Calibreuse, courroies de rechange', famille: 'conditionnement', unite: 'lot', siteCode: 'CAV', quantite: 3, seuil: 4, dernierMouvement: '2026-09-02' },
  { id: 'CAV-ETI-ADH', designation: 'Etiquette adhesive 40 x 25', famille: 'emballage', unite: 'bobine', siteCode: 'CAV', quantite: 128, seuil: 40, dernierMouvement: '2026-09-08' },

  // Perpignan
  { id: 'PER-BAR-250', designation: 'Barquette carton 250 g', famille: 'emballage', unite: 'carton', siteCode: 'PER', quantite: 0, seuil: 18, dernierMouvement: '2026-09-03' },
  { id: 'PER-FIL-ANT', designation: 'Filet anti insectes 50 mailles', famille: 'protection', unite: 'rouleau', siteCode: 'PER', quantite: 9, seuil: 9, dernierMouvement: '2026-08-19' },
  { id: 'PER-SAN-POL', designation: 'Sangle polyester 16 mm', famille: 'conditionnement', unite: 'bobine', siteCode: 'PER', quantite: 47, seuil: 15, dernierMouvement: '2026-09-05' },

  // Angers
  { id: 'ANG-CAG-40', designation: 'Cagette bois 40 x 60', famille: 'emballage', unite: 'palette', siteCode: 'ANG', quantite: 88, seuil: 25, dernierMouvement: '2026-09-06' },
  { id: 'ANG-VOI-HIV', designation: 'Voile d hivernage 30 g', famille: 'protection', unite: 'rouleau', siteCode: 'ANG', quantite: 11, seuil: 12, dernierMouvement: '2026-09-07' },
  { id: 'ANG-OPE-ENS', designation: 'Ensacheuse, machoires de soudure', famille: 'conditionnement', unite: 'lot', siteCode: 'ANG', quantite: 6, seuil: 3, dernierMouvement: '2026-08-25' },
  { id: 'ANG-FET-ETI', designation: 'Film etirable 17 microns', famille: 'emballage', unite: 'carton', siteCode: 'ANG', quantite: 24, seuil: 30, dernierMouvement: '2026-09-08' },
]
