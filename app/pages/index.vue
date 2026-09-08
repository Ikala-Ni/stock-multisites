<script setup lang="ts">
// L'ECRAN DE SUIVI DU STOCK.
//
// La page tient l'etat des filtres et la reference ouverte, et rien d'autre :
// elle ne dessine ni le tableau, ni la fiche, ni les etiquettes. Chaque
// morceau est un composant qu'on peut ouvrir seul et comprendre seul.
//
// LE POINT CENTRAL, C'EST useFetch AVEC SON "watch".
//
// useFetch appelle l'API et garde le resultat. En lui passant les filtres dans
// une fonction plutot qu'un objet fige, l'appel se refait tout seul des qu'un
// filtre change : il n'y a aucun "quand on clique, alors recharger" a ecrire.
// C'est ce que Vue appelle la reactivite, et c'est ce qui remplace la moitie du
// code qu'on ecrirait a la main en JavaScript nu.

import type { Famille, ReferenceCalculee, Site } from '~~/shared/types/stock'

const site = ref('')
const famille = ref<Famille | ''>('')
const recherche = ref('')
const aCommanderSeulement = ref(false)

// La liste des sites ne bouge pas : on la demande une fois.
const { data: sites } = await useFetch<Site[]>('/api/sites', { default: () => [] })

const {
  data: references,
  status,
  error,
} = await useFetch<ReferenceCalculee[]>('/api/references', {
  // Les parametres passes en fonction : c'est ce "() =>" qui fait que Nuxt
  // surveille les filtres et rappelle l'API quand l'un d'eux change.
  query: computed(() => ({
    site: site.value || undefined,
    famille: famille.value || undefined,
    recherche: recherche.value || undefined,
    aCommanderSeulement: aCommanderSeulement.value ? 'true' : undefined,
  })),
  default: () => [],
})

const enChargement = computed(() => status.value === 'pending')

const selection = ref<ReferenceCalculee | null>(null)

// Le compte de ce qui demande une action, calcule a partir de ce qui est
// affiche. computed et non une variable mise a jour a la main : une valeur qui
// se deduit d'une autre ne se recopie pas, sinon les deux finissent par ne plus
// dire la meme chose.
const nombreAAgir = computed(() => references.value.filter((r) => r.etat !== 'suffisant').length)

// Quand les filtres changent, la reference ouverte peut ne plus etre dans la
// liste. On ferme la fiche : laisser ouverte une fiche absente du tableau est
// le genre de petit mensonge dont on ne se remet pas.
watch(references, (liste) => {
  if (selection.value && !liste.some((r) => r.id === selection.value?.id)) {
    selection.value = null
  }
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Suivi de stock multisites</h1>
      <p class="mt-1 text-ardoise-500">
        Emballages, protection des cultures et conditionnement, repartis sur
        {{ sites.length }} sites.
      </p>
    </header>

    <p
      v-if="nombreAAgir > 0"
      class="mb-6 rounded-lg border border-ambre-700 bg-ambre-50 px-4 py-3 text-sm font-medium text-ambre-700"
    >
      {{ nombreAAgir }} reference{{ nombreAAgir > 1 ? 's' : '' }} a commander ou en rupture dans cette selection.
    </p>

    <BarreDeFiltres
      v-model:site="site"
      v-model:famille="famille"
      v-model:recherche="recherche"
      v-model:a-commander-seulement="aCommanderSeulement"
      :sites="sites"
      :nombre-affiche="references.length"
      class="mb-6"
    />

    <p v-if="error" role="alert" class="mb-6 rounded-lg border border-brique-700 bg-brique-50 p-4 text-sm text-brique-700">
      Le stock n a pas pu etre charge. Verifie que le serveur repond, puis recharge la page.
    </p>

    <main id="contenu" class="grid gap-6" :class="selection ? 'lg:grid-cols-[1fr_22rem]' : ''">
      <TableauReferences
        :references="references"
        :en-chargement="enChargement"
        :id-selectionne="selection?.id ?? null"
        @selectionner="selection = $event"
      />

      <PanneauDetail v-if="selection" :reference="selection" @fermer="selection = null" />
    </main>
  </div>
</template>
