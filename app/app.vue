<script setup lang="ts">
// La coquille de l'application : le lien d'evitement, la navigation, et la page
// courante. NuxtPage affiche celle qui correspond a l'adresse.
//
// La navigation est ici et non dans chaque page : ecrite deux fois, elle
// divergerait a la premiere page ajoutee, et il y aurait un ecran d'ou on ne
// pourrait plus revenir.

const liens = [
  { chemin: '/', libelle: 'Suivi du stock' },
  { chemin: '/produits', libelle: 'Les produits' },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Le lien d'evitement : premier element focusable de la page, invisible
         tant qu'on ne tabule pas dessus. Sans lui, une personne au clavier
         retraverse l'en-tete et les quatre filtres a chaque rechargement avant
         d'atteindre le tableau. -->
    <a
      href="#contenu"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ardoise-900 focus:px-4 focus:py-2 focus:text-white"
    >
      Aller au contenu
    </a>

    <header class="border-b border-ardoise-200 bg-white">
      <nav aria-label="Navigation principale" class="mx-auto flex max-w-7xl gap-1 px-4">
        <!-- NuxtLink pose aria-current="page" sur le lien actif tout seul. C'est
             ce qui dit a un lecteur d'ecran ou on se trouve ; le trait dore en
             dessous ne le dit qu'a ceux qui voient. Les deux vont ensemble, et
             c'est la meme regle que les pastilles d'etat : jamais la couleur
             seule. -->
        <NuxtLink
          v-for="l in liens"
          :key="l.chemin"
          :to="l.chemin"
          class="border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-ardoise-500 hover:text-ardoise-900"
          active-class="!border-ardoise-900 !text-ardoise-900"
        >
          {{ l.libelle }}
        </NuxtLink>
      </nav>
    </header>

    <NuxtPage />
  </div>
</template>
