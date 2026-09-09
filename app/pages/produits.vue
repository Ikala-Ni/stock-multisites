<script setup lang="ts">
// LA PAGE "LES PRODUITS" : le catalogue.
//
// POURQUOI UN DEUXIEME ECRAN PLUTOT QUE D'ENRICHIR LE PREMIER.
//
// Deux publics, deux besoins opposes. Quelqu'un qui travaille la depuis dix ans
// ouvre le tableau de stock : il connait les produits, il cherche un chiffre, et
// tout ce qui prend de la place lui fait perdre du temps. Quelqu'un arrive lundi
// ne peut rien faire de ce tableau : "Voile d'hivernage 17 g" ne lui dit rien,
// et il ne saura pas s'il faut s'inquieter d'en avoir onze.
//
// On ne degrade pas l'ecran des habitues pour servir les nouveaux : on donne aux
// nouveaux leur propre porte d'entree. Ici il y a de la place pour une
// silhouette, une phrase qui dit a quoi ca sert, les dimensions, et ou en
// trouver. Le tableau, lui, reste dense.
//
// Ce fichier suffit a creer l'adresse /produits : c'est le routage par fichiers
// de Nuxt, il n'y a aucune table de routes a tenir a jour.

import type { Famille, FicheCatalogue } from '~~/shared/types/stock'

const recherche = ref('')
const famille = ref<Famille | ''>('')

const { data: fiches, status } = await useFetch<FicheCatalogue[]>('/api/catalogue', {
  query: computed(() => ({
    recherche: recherche.value || undefined,
    famille: famille.value || undefined,
  })),
  default: () => [],
})

const enChargement = computed(() => status.value === 'pending')

const FAMILLES: { valeur: Famille; libelle: string }[] = [
  { valeur: 'emballage', libelle: 'Emballage' },
  { valeur: 'protection', libelle: 'Protection des cultures' },
  { valeur: 'conditionnement', libelle: 'Conditionnement' },
]
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Les produits</h1>
      <p class="mt-1 max-w-2xl text-ardoise-500">
        Ce que le groupe achete, a quoi chaque produit sert, et quels sites en detiennent.
        Cette page est faite pour prendre ses reperes ; le suivi quotidien se fait sur l ecran
        de stock.
      </p>
    </header>

    <section role="search" aria-labelledby="titre-recherche" class="mb-6 rounded-lg border border-ardoise-200 bg-white p-4">
      <h2 id="titre-recherche" class="sr-only">Chercher un produit</h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="recherche-produit" class="mb-1 block text-sm font-medium">Rechercher</label>
          <input
            id="recherche-produit"
            v-model="recherche"
            type="search"
            placeholder="cagette, film, gel, palette..."
            class="w-full rounded-md border border-ardoise-200 bg-white px-3 py-2 text-sm"
          >
          <!-- La recherche porte aussi sur la description, et on le dit : taper
               "gel" trouve le voile d hivernage, dont le nom ne contient pas le
               mot. Une recherche qui trouve plus que prevu inquiete tant qu on
               n a pas explique pourquoi. -->
          <span class="mt-1 block text-xs text-ardoise-500">
            Cherche dans le nom et dans la description.
          </span>
        </div>

        <div>
          <label for="famille-produit" class="mb-1 block text-sm font-medium">Famille</label>
          <select
            id="famille-produit"
            v-model="famille"
            class="w-full rounded-md border border-ardoise-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Toutes les familles</option>
            <option v-for="f in FAMILLES" :key="f.valeur" :value="f.valeur">{{ f.libelle }}</option>
          </select>
        </div>
      </div>

      <p aria-live="polite" class="mt-4 border-t border-ardoise-100 pt-3 text-sm text-ardoise-500">
        {{ fiches.length }} produit{{ fiches.length > 1 ? 's' : '' }} affiche{{ fiches.length > 1 ? 's' : '' }}
      </p>
    </section>

    <main id="contenu">
      <p v-if="enChargement" class="py-12 text-center text-ardoise-500">Chargement en cours...</p>

      <p v-else-if="!fiches.length" class="py-12 text-center text-ardoise-500">
        Aucun produit ne correspond a cette recherche.
      </p>

      <!-- auto-fill avec une largeur minimale : le nombre de colonnes suit la
           place disponible, sans point de rupture ecrit a la main. -->
      <div v-else class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(20rem,1fr))]">
        <CarteProduit v-for="f in fiches" :key="f.produit.id" :fiche="f" />
      </div>
    </main>
  </div>
</template>
