<script setup lang="ts">
// UNE CARTE DU CATALOGUE.
//
// Elle s'adresse a quelqu'un qui ne connait pas encore les produits : la
// vignette et la phrase de description sont la pour ca, et elles ne servent a
// personne d'autre. C'est pourquoi elles ne sont PAS dans le tableau de stock,
// qui s'adresse a des gens qui manipulent ces objets tous les jours.
//
// LA CARTE ENTIERE N'EST PAS UN LIEN, ET C'EST VOULU. Un bloc cliquable qui
// contient du texte, un etat et une liste de sites oblige un lecteur d'ecran a
// tout annoncer comme un seul intitule de lien, interminable. Le lien est pose
// sur le seul endroit ou il a du sens - "Voir le stock" - et il porte le nom du
// produit pour rester comprehensible hors de son contexte.

import type { FicheCatalogue } from '~~/shared/types/stock'
import { auPluriel } from '~~/shared/pluriel'

defineProps<{ fiche: FicheCatalogue }>()

const LIBELLE_FAMILLE = {
  emballage: 'Emballage',
  protection: 'Protection des cultures',
  conditionnement: 'Conditionnement',
} as const
</script>

<template>
  <article class="flex flex-col rounded-lg border border-ardoise-200 bg-white p-5">
    <div class="mb-3 flex items-start gap-4">
      <VignetteProduit :visuel="fiche.produit.visuel" :taille="64" />
      <div class="min-w-0">
        <h3 class="font-semibold leading-tight">{{ fiche.produit.designation }}</h3>
        <p class="mt-0.5 text-xs text-ardoise-500">
          {{ LIBELLE_FAMILLE[fiche.produit.famille] }} | {{ fiche.produit.id }}
        </p>
      </div>
    </div>

    <p class="mb-4 text-sm leading-relaxed text-ardoise-700">{{ fiche.produit.description }}</p>

    <dl class="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-ardoise-100 pt-3 text-xs">
      <div>
        <dt class="text-ardoise-500">Dimensions</dt>
        <dd class="font-medium">{{ fiche.produit.dimensions }}</dd>
      </div>
      <div>
        <dt class="text-ardoise-500">Conditionnement</dt>
        <dd class="font-medium">{{ fiche.produit.conditionnement }}</dd>
      </div>
    </dl>

    <!-- mt-auto : le bas de carte se colle en bas quelle que soit la longueur de
         la description, donc toutes les cartes d'une rangee alignent leur pied.
         Sans ca, une description longue decale tout ce qui la suit. -->
    <div class="mt-auto border-t border-ardoise-100 pt-3">
      <div class="mb-2 flex items-baseline justify-between gap-3">
        <p class="text-sm font-semibold tabular-nums">
          {{ fiche.stockTotal }} {{ auPluriel(fiche.produit.unite, fiche.stockTotal) }}
          <span class="font-normal text-ardoise-500">au total</span>
        </p>
        <EtiquetteEtat :etat="fiche.etatLePlusCritique" />
      </div>

      <p v-if="!fiche.presences.length" class="text-sm text-ardoise-500">
        Aucun site n en detient. Le produit reste commandable.
      </p>

      <ul v-else class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ardoise-700">
        <li v-for="p in fiche.presences" :key="p.siteCode">
          {{ p.siteNom }}
          <span class="tabular-nums text-ardoise-500">{{ p.quantite }}</span>
        </li>
      </ul>

      <NuxtLink
        :to="{ path: '/', query: { recherche: fiche.produit.designation } }"
        class="mt-3 inline-block text-sm font-semibold text-ardoise-900 underline underline-offset-2 hover:text-ardoise-700"
      >
        Voir le stock<span class="sr-only"> de {{ fiche.produit.designation }}</span>
      </NuxtLink>
    </div>
  </article>
</template>
