<script setup lang="ts">
// LE TABLEAU.
//
// C'est un vrai <table> avec de vrais <th scope="col">, et pas une grille de
// <div>. Une grille de div se dessine pareil, mais un lecteur d'ecran n'y
// trouve ni ligne ni colonne : arrive sur la cellule "42", il ne peut plus dire
// de quelle reference ni de quelle colonne elle vient. Le tableau, lui, annonce
// "Quantite, 42, ligne Cagette bois". Des donnees en lignes et colonnes se
// balisent en tableau, c'est tout.

import type { ReferenceCalculee } from '~~/shared/types/stock'
import { auPluriel } from '~~/shared/pluriel'

defineProps<{ references: ReferenceCalculee[]; enChargement: boolean; idSelectionne: string | null }>()

const emit = defineEmits<{ selectionner: [reference: ReferenceCalculee] }>()

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
        Stock par reference et par site, trie par urgence puis par designation
      </caption>
      <thead>
        <tr class="border-b border-ardoise-200 bg-ardoise-50 text-left">
          <th scope="col" class="px-4 py-3 font-semibold">Reference</th>
          <th scope="col" class="px-4 py-3 font-semibold">Site</th>
          <th scope="col" class="px-4 py-3 text-right font-semibold">Quantite</th>
          <th scope="col" class="px-4 py-3 text-right font-semibold">Seuil</th>
          <th scope="col" class="px-4 py-3 font-semibold">Etat</th>
          <th scope="col" class="px-4 py-3 font-semibold">Dernier mouvement</th>
          <th scope="col" class="px-4 py-3"><span class="sr-only">Action</span></th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="enChargement">
          <td colspan="7" class="px-4 py-8 text-center text-ardoise-500">Chargement en cours...</td>
        </tr>

        <tr v-else-if="references.length === 0">
          <td colspan="7" class="px-4 py-8 text-center text-ardoise-500">
            Aucune reference ne correspond a ces filtres.
          </td>
        </tr>

        <tr
          v-for="r in references"
          v-else
          :key="r.id"
          class="border-b border-ardoise-100 last:border-0"
          :class="r.id === idSelectionne ? 'bg-ardoise-100' : 'hover:bg-ardoise-50'"
        >
          <!-- scope="row" : cette cellule nomme sa ligne. C'est elle qui est
               rappelee quand on lit une autre cellule de la meme ligne. -->
          <th scope="row" class="px-4 py-3 text-left font-medium">
            {{ r.designation }}
            <span class="block text-xs font-normal text-ardoise-500">{{ r.id }}</span>
          </th>
          <td class="px-4 py-3">{{ r.siteNom }}</td>
          <td class="px-4 py-3 text-right tabular-nums">
            {{ r.quantite }}
            <span class="text-ardoise-500">{{ auPluriel(r.unite, r.quantite) }}</span>
          </td>
          <td class="px-4 py-3 text-right tabular-nums text-ardoise-500">{{ r.seuil }}</td>
          <td class="px-4 py-3"><EtiquetteEtat :etat="r.etat" /></td>
          <td class="px-4 py-3 text-ardoise-500">
            <!-- <time datetime> : la date lisible pour l'oeil, la date machine
                 pour tout ce qui lira la page autrement. -->
            <time :datetime="r.dernierMouvement">{{ enDateCourte(r.dernierMouvement) }}</time>
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="rounded-md border border-ardoise-200 px-3 py-1.5 text-xs font-semibold hover:bg-ardoise-100"
              @click="emit('selectionner', r)"
            >
              <!-- Le nom de la reference est dans le bouton, cache a l'oeil.
                   Sans lui, un lecteur d'ecran qui liste les boutons de la page
                   annonce sept fois "Ouvrir" et aucun n'est distinguable. -->
              Ouvrir<span class="sr-only"> la fiche de {{ r.designation }}, site de {{ r.siteNom }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
