// LE CATALOGUE : LES PRODUITS.
//
// Ce qu'on achete, independamment de qui en detient. Un produit existe une fois
// pour le groupe : sa description, ses dimensions et son fournisseur ne changent
// pas selon le site, donc ils ne sont ecrits qu'ici.
//
// Les donnees sont inventees de bout en bout : aucun produit, aucun fournisseur
// et aucun chiffre ne correspond a une entreprise reelle.
//
// La `description` merite un mot. Elle n'a aucune utilite pour quelqu'un qui
// travaille la depuis dix ans, et c'est normal : elle est ecrite pour la
// personne arrivee lundi, qui lit "Voile d'hivernage 17 g" et n'a aucun moyen de
// deviner ce que c'est ni quand on s'en sert. Une phrase, sans jargon, qui dit a
// quoi ca sert.

import type { Produit } from '~~/shared/types/stock'

export const PRODUITS: Produit[] = [
  {
    id: 'CAG-30',
    designation: 'Cagette bois 30 x 40',
    famille: 'emballage',
    visuel: 'cagette',
    description:
      "La caisse en bois la plus courante du site. Elle part chez les producteurs de fruits et revient vide pour être réutilisée.",
    unite: 'palette',
    dimensions: '30 x 40 x 12 cm',
    conditionnement: '160 cagettes par palette',
    fournisseur: 'FRN-2210',
  },
  {
    id: 'CAG-40',
    designation: 'Cagette bois 40 x 60',
    famille: 'emballage',
    visuel: 'cagette',
    description:
      "Le grand format, pour les légumes lourds et les melons. Même bois que la 30 x 40, deux fois le volume.",
    unite: 'palette',
    dimensions: '40 x 60 x 15 cm',
    conditionnement: '90 cagettes par palette',
    fournisseur: 'FRN-2214',
  },
  {
    id: 'BAR-250',
    designation: 'Barquette carton 250 g',
    famille: 'emballage',
    visuel: 'barquette',
    description:
      "La petite barquette de vente au détail, celle qu'on trouve en rayon avec des fraises ou des tomates cerises dedans.",
    unite: 'carton',
    dimensions: '14 x 11 x 5 cm',
    conditionnement: '900 barquettes par carton',
    fournisseur: 'FRN-3105',
  },
  {
    id: 'BAR-500',
    designation: 'Barquette carton 500 g',
    famille: 'emballage',
    visuel: 'barquette',
    description:
      "Le format au-dessus de la 250 g, même carton et même usage. C'est le poids du contenu qui change, pas la matière.",
    unite: 'carton',
    dimensions: '18 x 13 x 6 cm',
    conditionnement: '600 barquettes par carton',
    fournisseur: 'FRN-3108',
  },
  {
    id: 'PLA-60',
    designation: 'Plateau plastique 60 x 40',
    famille: 'emballage',
    visuel: 'plateau',
    description:
      "Le bac plastique réutilisable qui circule entre les sites. Il se lave, s'empile vide et sert des années, contrairement au carton.",
    unite: 'palette',
    dimensions: '60 x 40 x 17 cm',
    conditionnement: '72 plateaux par palette',
    fournisseur: 'FRN-4402',
  },
  {
    id: 'FET-23',
    designation: 'Film étirable 23 microns',
    famille: 'emballage',
    visuel: 'bobine-film',
    description:
      "Le film transparent qu'on enroule autour d'une palette pour que rien ne bouge pendant le transport. Le chiffre est son épaisseur.",
    unite: 'carton',
    dimensions: 'largeur 50 cm, 300 m par bobine',
    conditionnement: '6 bobines par carton',
    fournisseur: 'FRN-5011',
  },
  {
    id: 'FET-17',
    designation: 'Film étirable 17 microns',
    famille: 'emballage',
    visuel: 'bobine-film',
    description:
      "Le même film, plus fin. On l'utilise pour les palettes légères : moins de matière, mais il tient moins bien une charge lourde.",
    unite: 'carton',
    dimensions: 'largeur 50 cm, 300 m par bobine',
    conditionnement: '6 bobines par carton',
    fournisseur: 'FRN-5008',
  },
  {
    id: 'ETI-ADH',
    designation: 'Étiquette adhésive 40 x 25',
    famille: 'emballage',
    visuel: 'bobine-etiquette',
    description:
      "L'étiquette blanche qu'on imprime au moment du conditionnement : origine, poids, date. Elle arrive en bobine pour l'imprimante.",
    unite: 'bobine',
    dimensions: '40 x 25 mm, 2000 par bobine',
    conditionnement: '1 bobine',
    fournisseur: 'FRN-6120',
  },
  {
    id: 'SAC-KR2',
    designation: 'Sac kraft 2 kg',
    famille: 'emballage',
    visuel: 'barquette',
    description:
      "Le sac papier à fond plat pour la vente en vrac, pommes de terre ou oignons. Référence gardée au catalogue, mais plus aucun site n'en détient depuis la fin de campagne.",
    unite: 'carton',
    dimensions: '22 x 12 x 34 cm',
    conditionnement: '500 sacs par carton',
    fournisseur: 'FRN-3402',
  },
  {
    id: 'FIL-PG',
    designation: 'Filet paragrêle 8 m',
    famille: 'protection',
    visuel: 'filet',
    description:
      "Le filet qu'on tend au-dessus des vergers pour que la grêle n'abîme pas les fruits. On le pose au printemps et il reste la saison.",
    unite: 'rouleau',
    dimensions: 'largeur 8 m, 100 m par rouleau',
    conditionnement: '1 rouleau',
    fournisseur: 'FRN-7301',
  },
  {
    id: 'FIL-OMB',
    designation: "Filet d'ombrage 40 %",
    famille: 'protection',
    visuel: 'filet',
    description:
      "Un filet qui laisse passer 60 % de la lumière et arrête le reste. Il évite que le soleil brûle les cultures en plein été.",
    unite: 'rouleau',
    dimensions: 'largeur 4 m, 100 m par rouleau',
    conditionnement: '1 rouleau',
    fournisseur: 'FRN-7318',
  },
  {
    id: 'FIL-ANT',
    designation: 'Filet anti-insectes 50 mailles',
    famille: 'protection',
    visuel: 'filet',
    description:
      "Un filet à mailles très serrées qui empêche les insectes d'atteindre la culture. Plus le nombre de mailles est élevé, plus c'est fin.",
    unite: 'rouleau',
    dimensions: 'largeur 3 m, 100 m par rouleau',
    conditionnement: '1 rouleau',
    fournisseur: 'FRN-7340',
  },
  {
    id: 'VOI-17',
    designation: "Voile d'hivernage 17 g",
    famille: 'protection',
    visuel: 'voile',
    description:
      "Un voile blanc très léger qu'on pose sur les cultures avant une nuit de gel. Le chiffre est son poids au mètre carré : plus il est élevé, plus il protège.",
    unite: 'rouleau',
    dimensions: 'largeur 6 m, 100 m par rouleau',
    conditionnement: '1 rouleau',
    fournisseur: 'FRN-7502',
  },
  {
    id: 'VOI-30',
    designation: "Voile d'hivernage 30 g",
    famille: 'protection',
    visuel: 'voile',
    description:
      "Le voile épais, pour les gelées sévères. Il protège mieux mais laisse passer moins de lumière, donc on ne le laisse pas des semaines.",
    unite: 'rouleau',
    dimensions: 'largeur 6 m, 50 m par rouleau',
    conditionnement: '1 rouleau',
    fournisseur: 'FRN-7509',
  },
  {
    id: 'SAN-POL',
    designation: 'Sangle polyester 16 mm',
    famille: 'conditionnement',
    visuel: 'sangle',
    description:
      "Le feuillard qu'on serre autour d'une palette pour la bloquer, avec une cercleuse. Le polyester remplace l'acier : il ne coupe pas les mains.",
    unite: 'bobine',
    dimensions: 'largeur 16 mm, 1200 m par bobine',
    conditionnement: '1 bobine',
    fournisseur: 'FRN-8210',
  },
  {
    id: 'CER-AUT',
    designation: "Cercleuse automatique, pièces d'usure",
    famille: 'conditionnement',
    visuel: 'piece-machine',
    description:
      "Le lot de pièces qui s'usent sur la machine à cercler : galets, lame, résistance de soudure. On le garde en stock pour ne pas arrêter la ligne.",
    unite: 'lot',
    dimensions: 'lot de 8 pièces',
    conditionnement: '1 lot',
    fournisseur: 'FRN-9004',
  },
  {
    id: 'CAL-COU',
    designation: 'Calibreuse, courroies de rechange',
    famille: 'conditionnement',
    visuel: 'piece-machine',
    description:
      "Les courroies de la machine qui trie les fruits par taille. Elles se remplacent une à deux fois par saison selon les heures de marche.",
    unite: 'lot',
    dimensions: 'jeu de 4 courroies',
    conditionnement: '1 lot',
    fournisseur: 'FRN-9017',
  },
  {
    id: 'ENS-MAC',
    designation: 'Ensacheuse, mâchoires de soudure',
    famille: 'conditionnement',
    visuel: 'piece-machine',
    description:
      "Les mâchoires chauffantes qui ferment les sachets. Quand la soudure ne tient plus, c'est presque toujours elles qu'il faut changer.",
    unite: 'lot',
    dimensions: 'paire',
    conditionnement: '1 lot',
    fournisseur: 'FRN-9026',
  },
]
