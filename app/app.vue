<script setup lang="ts">
// La coquille de l'application. NuxtPage affiche la page qui correspond a
// l'adresse courante ; ici il n'y en a qu'une, mais la structure est deja la.
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
    <NuxtPage />
  </div>
</template>
