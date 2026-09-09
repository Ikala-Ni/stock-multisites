<script setup lang="ts">
// LE TABLEAU.
//
// C'est un vrai <table> avec de vrais <th scope="col">, et pas une grille de
// <div>. Une grille de div se dessine pareil, mais un lecteur d'ecran n'y
// trouve ni ligne ni colonne : arrive sur la cellule "42", il ne peut plus dire
// de quelle reference ni de quelle colonne elle vient. Le tableau, lui, annonce
// "Quantite, 42, ligne Cagette bois". Des donnees en lignes et colonnes se
// balisent en tableau, c'est tout.
//
// PAS DE VIGNETTE ICI, ET C'EST UNE DECISION.
//
// Une image par ligne doublerait la hauteur des lignes, donc on verrait deux
// fois moins de stock d'un coup d'oeil - sur un ecran dont toute la raison
// d'etre est de reperer vite ce qui manque. Les gens qui l'ouvrent manipulent
// ces produits tous les jours et savent a quoi ressemble une cagette. Les
// vignettes vivent dans le catalogue, qui s'adresse a quelqu'un d'autre.

import type { LigneStock } from '~~/shared/types/stock'
import { auPluriel } from '~~/shared/pluriel'

defineProps<{ lignes: LigneStock[]; enChargement: boolean; idSelectionne: string | null }>()

const emit = defineEmits<{ selectionner: [ligne: LigneStock] }>()

/** 2026-09-05 devient 05/09/2026. */
function enDateCourte(iso: string): string {
  const [a, m, j] = iso.split('-')
  return `${j}/${m}/${a}`
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-ardoise-200 bg-white">
    <table class="w-full border-collapse text-sm">
      <caption class="sr-only">
        Stock par produit et par site, trié par urgence puis par désignation
      </caption>
      <thead>
        <tr class="border-b border-ardoise-200 bg-ardoise-50 text-left">
          <th scope="col" class="px-4 py-3 font-semibold">Produit</th>
          <th scope="col" class="px-4 py-3 font-semibold">Site</th>
          <th scope="col" class="px-4 py-3 text-right font-semibold">Quantité</th>
          <th scope="col" class="px-4 py-3 text-right font-semibold">Seuil</th>
          <th scope="col" class="px-4 py-3 font-semibold">État</th>
          <th scope="col" class="px-4 py-3 font-semibold">Dernier mouvement</th>
          <th scope="col" class="px-4 py-3"><span class="sr-only">Action</span></th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="enChargement">
          <td colspan="7" class="px-4 py-8 text-center text-ardoise-500">Chargement en cours...</td>
        </tr>

        <tr v-else-if="lignes.length === 0">
          <td colspan="7" class="px-4 py-8 text-center text-ardoise-500">
            Aucun produit ne correspond à ces filtres.
          </td>
        </tr>

        <tr
          v-for="l in lignes"
          v-else
          :key="l.id"
          class="border-b border-ardoise-100 last:border-0"
          :class="l.id === idSelectionne ? 'bg-ardoise-100' : 'hover:bg-ardoise-50'"
        >
          <!-- scope="row" : cette cellule nomme sa ligne. C'est elle qui est
               rappelee quand on lit une autre cellule de la meme ligne. -->
          <th scope="row" class="px-4 py-3 text-left font-medium">
            {{ l.produit.designation }}
            <span class="block text-xs font-normal text-ardoise-500">{{ l.produit.id }}</span>
          </th>
          <td class="px-4 py-3">{{ l.siteNom }}</td>
          <td class="px-4 py-3 text-right tabular-nums">
            {{ l.quantite }}
            <span class="text-ardoise-500">{{ auPluriel(l.produit.unite, l.quantite) }}</span>
          </td>
          <td class="px-4 py-3 text-right tabular-nums text-ardoise-500">{{ l.seuil }}</td>
          <td class="px-4 py-3"><EtiquetteEtat :etat="l.etat" /></td>
          <td class="px-4 py-3 text-ardoise-500">
            <!-- <time datetime> : la date lisible pour l'oeil, la date machine
                 pour tout ce qui lira la page autrement. Un stock qui n'a jamais
                 bouge n'a pas de date, et on l'ecrit plutot que d'afficher un
                 tiret muet. -->
            <time v-if="l.dernierMouvement" :datetime="l.dernierMouvement">
              {{ enDateCourte(l.dernierMouvement) }}
            </time>
            <span v-else>Aucun mouvement</span>
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="rounded-md border border-ardoise-200 px-3 py-1.5 text-xs font-semibold hover:bg-ardoise-100"
              @click="emit('selectionner', l)"
            >
              <!-- Le nom du produit est dans le bouton, cache a l'oeil. Sans lui,
                   un lecteur d'ecran qui liste les boutons de la page annonce
                   sept fois "Ouvrir" et aucun n'est distinguable. -->
              Ouvrir<span class="sr-only"> la fiche de {{ l.produit.designation }}, site de {{ l.siteNom }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
