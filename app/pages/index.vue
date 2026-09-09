<script setup lang="ts">
// L'ECRAN DE SUIVI DU STOCK.
//
// La page tient l'etat des filtres et la ligne ouverte, et rien d'autre : elle
// ne dessine ni le tableau, ni la fiche, ni les etiquettes. Chaque morceau est
// un composant qu'on peut ouvrir seul et comprendre seul.
//
// LE POINT CENTRAL, C'EST useFetch AVEC SA REQUETE EN COMPUTED.
//
// useFetch appelle l'API et garde le resultat. En lui passant les filtres dans
// une fonction plutot qu'un objet fige, l'appel se refait tout seul des qu'un
// filtre change : il n'y a aucun "quand on clique, alors recharger" a ecrire.
// C'est ce que Vue appelle la reactivite, et c'est ce qui remplace la moitie du
// code qu'on ecrirait a la main en JavaScript nu.

import type { Famille, LigneStock, Site } from '~~/shared/types/stock'

// La recherche peut arriver depuis le catalogue, par l'adresse : cliquer "Voir
// le stock" sur une carte produit ouvre cet ecran deja filtre sur ce produit.
// C'est ce qui relie les deux pages au lieu d'en faire deux ilots.
const route = useRoute()

const site = ref('')
const famille = ref<Famille | ''>('')
const recherche = ref(typeof route.query.recherche === 'string' ? route.query.recherche : '')
const aCommanderSeulement = ref(false)

// La liste des sites ne bouge pas : on la demande une fois.
const { data: sites } = await useFetch<Site[]>('/api/sites', { default: () => [] })

const {
  data: lignes,
  status,
  error,
} = await useFetch<LigneStock[]>('/api/references', {
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

const selection = ref<LigneStock | null>(null)

// Le compte de ce qui demande une action, calcule a partir de ce qui est
// affiche. computed et non une variable mise a jour a la main : une valeur qui
// se deduit d'une autre ne se recopie pas, sinon les deux finissent par ne plus
// dire la meme chose.
const nombreAAgir = computed(() => lignes.value.filter((l) => l.etat !== 'suffisant').length)

// Quand les filtres changent, la ligne ouverte peut ne plus etre dans la liste.
// On ferme la fiche : laisser ouverte une fiche absente du tableau est le genre
// de petit mensonge dont on ne se remet pas.
watch(lignes, (liste) => {
  if (selection.value && !liste.some((l) => l.id === selection.value?.id)) {
    selection.value = null
  }
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Suivi de stock multisites</h1>
      <p class="mt-1 text-ardoise-500">
        Emballages, protection des cultures et conditionnement, répartis sur
        {{ sites.length }} sites.
      </p>
    </header>

    <p
      v-if="nombreAAgir > 0"
      class="mb-6 rounded-lg border border-ambre-700 bg-ambre-50 px-4 py-3 text-sm font-medium text-ambre-700"
    >
      {{ nombreAAgir }} ligne{{ nombreAAgir > 1 ? 's' : '' }} à commander ou en rupture dans cette sélection.
    </p>

    <BarreDeFiltres
      v-model:site="site"
      v-model:famille="famille"
      v-model:recherche="recherche"
      v-model:a-commander-seulement="aCommanderSeulement"
      :sites="sites"
      :nombre-affiche="lignes.length"
      class="mb-6"
    />

    <p v-if="error" role="alert" class="mb-6 rounded-lg border border-brique-700 bg-brique-50 p-4 text-sm text-brique-700">
      Le stock n'a pas pu être chargé. Vérifiez que le serveur répond, puis rechargez la page.
    </p>

    <main id="contenu" class="grid gap-6" :class="selection ? 'lg:grid-cols-[1fr_24rem]' : ''">
      <TableauReferences
        :lignes="lignes"
        :en-chargement="enChargement"
        :id-selectionne="selection?.id ?? null"
        @selectionner="selection = $event"
      />

      <PanneauDetail v-if="selection" :ligne="selection" @fermer="selection = null" />
    </main>
  </div>
</template>
