<script setup lang="ts">
// LES FILTRES.
//
// Le composant ne filtre rien lui-meme et ne connait aucune reference : il
// affiche des champs et previent le parent quand ils changent. C'est la regle
// qui rend un composant reutilisable - il fait une chose, il ne decide pas de
// ce qu'on en fait.
//
// defineModel est la facon Vue 3.4 et plus de faire circuler une valeur dans
// les deux sens : la page tient l'etat des filtres, ce composant le lit et le
// modifie, et personne n'a besoin d'ecrire les evenements a la main.

import type { Famille, Site } from '~~/shared/types/stock'

defineProps<{ sites: Site[]; nombreAffiche: number }>()

const site = defineModel<string>('site', { default: '' })
const famille = defineModel<Famille | ''>('famille', { default: '' })
const recherche = defineModel<string>('recherche', { default: '' })
const aCommanderSeulement = defineModel<boolean>('aCommanderSeulement', { default: false })

const FAMILLES: { valeur: Famille; libelle: string }[] = [
  { valeur: 'emballage', libelle: 'Emballage' },
  { valeur: 'protection', libelle: 'Protection des cultures' },
  { valeur: 'conditionnement', libelle: 'Conditionnement' },
]

function toutEffacer() {
  site.value = ''
  famille.value = ''
  recherche.value = ''
  aCommanderSeulement.value = false
}
</script>

<template>
  <!-- role="search" et un titre : une personne au lecteur d'ecran peut sauter
       directement a cette zone au lieu de parcourir la page champ par champ. -->
  <section role="search" aria-labelledby="titre-filtres" class="rounded-lg border border-ardoise-200 bg-white p-4">
    <h2 id="titre-filtres" class="sr-only">Filtrer les références</h2>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Chaque champ a un <label for> relie a son id. Un placeholder n'est
           PAS une etiquette : il disparait des qu'on tape, et il n'est pas lu
           comme un nom de champ. -->
      <div>
        <label for="filtre-recherche" class="mb-1 block text-sm font-medium">Rechercher</label>
        <input
          id="filtre-recherche"
          v-model="recherche"
          type="search"
          placeholder="cagette, film, filet..."
          class="w-full rounded-md border border-ardoise-200 bg-white px-3 py-2 text-sm"
        >
      </div>

      <div>
        <label for="filtre-site" class="mb-1 block text-sm font-medium">Site</label>
        <select
          id="filtre-site"
          v-model="site"
          class="w-full rounded-md border border-ardoise-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les sites</option>
          <option v-for="s in sites" :key="s.code" :value="s.code">
            {{ s.nom }} ({{ s.departement }})
          </option>
        </select>
      </div>

      <div>
        <label for="filtre-famille" class="mb-1 block text-sm font-medium">Famille</label>
        <select
          id="filtre-famille"
          v-model="famille"
          class="w-full rounded-md border border-ardoise-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Toutes les familles</option>
          <option v-for="f in FAMILLES" :key="f.valeur" :value="f.valeur">{{ f.libelle }}</option>
        </select>
      </div>

      <div class="flex items-end">
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            v-model="aCommanderSeulement"
            type="checkbox"
            class="size-4 rounded border-ardoise-500"
          >
          À commander seulement
        </label>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between border-t border-ardoise-100 pt-3">
      <!-- aria-live : le nombre change sans que la page se recharge. Sans cette
           annonce, une personne au lecteur d'ecran coche une case et n'apprend
           jamais que le tableau s'est vide. -->
      <p aria-live="polite" class="text-sm text-ardoise-500">
        {{ nombreAffiche }} référence{{ nombreAffiche > 1 ? 's' : '' }} affichée{{ nombreAffiche > 1 ? 's' : '' }}
      </p>
      <button
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium text-ardoise-700 underline underline-offset-2 hover:bg-ardoise-50"
        @click="toutEffacer"
      >
        Effacer les filtres
      </button>
    </div>
  </section>
</template>
