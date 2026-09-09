<script setup lang="ts">
// LA VIGNETTE D'UN PRODUIT.
//
// Une silhouette au trait par type de produit, dessinee ici en SVG plutot que
// photographiee. Trois raisons, dans l'ordre d'importance :
//
//   1. LA LICENCE. Ce depot est public. Une photo trouvee en ligne pose une
//      question de droits qu'on n'a aucune raison de se creer, et une photo
//      prise chez un client n'a rien a faire dans un projet de demonstration.
//      Un dessin qu'on a fait n'appartient qu'a nous.
//   2. LA LISIBILITE A PETITE TAILLE. Un carton brun photographie sur fond brun
//      ne se distingue pas d'un autre carton brun. Un trait, si.
//   3. LE THEME. Le dessin prend la couleur du texte autour de lui, donc il
//      fonctionne en clair comme en sombre. Une photo, non.
//
// Ce composant est la SEULE porte : le jour ou de vraies photos existent, on
// remplace le contenu d'ici par une balise <img loading="lazy"> avec ses
// dimensions, et aucune page n'a a le savoir.
//
// L'IMAGE EST DECORATIVE, ET C'EST DELIBERE. Le SVG porte aria-hidden : la
// designation du produit est ecrite juste a cote, en toutes lettres. Faire lire
// "dessin d'une cagette" a un lecteur d'ecran juste avant "Cagette bois 30 x 40"
// ajoute du bruit et aucune information. Une image qui repete son voisin doit
// se taire.

import type { Visuel } from '~~/shared/types/stock'

withDefaults(defineProps<{ visuel: Visuel; taille?: number }>(), { taille: 72 })
</script>

<template>
  <svg
    :width="taille"
    :height="taille"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0 text-ardoise-500"
  >
    <!-- Cagette : une caisse a claire-voie, vue de trois quarts. -->
    <g v-if="visuel === 'cagette'">
      <path d="M7 16h34v22H7z" />
      <path d="M7 16 12 9h28l1 7" />
      <path d="M14 16v22M24 16v22M34 16v22" />
      <path d="M7 27h34" />
    </g>

    <!-- Barquette : un plateau evase, plus large en haut qu'en bas. -->
    <g v-else-if="visuel === 'barquette'">
      <path d="M5 17h38l-5 20H10z" />
      <path d="M5 17c0-2 8-4 19-4s19 2 19 4" />
      <path d="M13 23l1 8M24 23v8M35 23l-1 8" />
    </g>

    <!-- Plateau plastique : un bac ajoure, empilable. -->
    <g v-else-if="visuel === 'plateau'">
      <path d="M6 18h36v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M6 18l3-6h30l3 6" />
      <path d="M12 24v8M18 24v8M24 24v8M30 24v8M36 24v8" />
    </g>

    <!-- Bobine de film : un rouleau large, vu de trois quarts. -->
    <g v-else-if="visuel === 'bobine-film'">
      <ellipse cx="17" cy="24" rx="7" ry="13" />
      <path d="M17 11h14M17 37h14" />
      <ellipse cx="31" cy="24" rx="7" ry="13" />
      <ellipse cx="31" cy="24" rx="2.5" ry="4.5" />
    </g>

    <!-- Bobine d'etiquettes : un rouleau etroit, avec la bande qui se deroule. -->
    <g v-else-if="visuel === 'bobine-etiquette'">
      <circle cx="20" cy="24" r="13" />
      <circle cx="20" cy="24" r="4" />
      <path d="M32 19h11v9H32" />
      <path d="M36 19v9M40 19v9" />
    </g>

    <!-- Filet : une maille losange tendue, avec ses attaches. -->
    <g v-else-if="visuel === 'filet'">
      <path d="M8 12h32v26H8z" />
      <path d="M8 20l8-8M8 32l20-20M12 38l28-28M24 38l16-16M36 38l4-4" />
      <path d="M8 20l20 18M8 32l6 6M20 12l20 18M32 12l8 7" />
    </g>

    <!-- Voile : un tissu leger pose, qui ondule. -->
    <g v-else-if="visuel === 'voile'">
      <path d="M6 18c6-5 12-5 18 0s12 5 18 0" />
      <path d="M6 26c6-5 12-5 18 0s12 5 18 0" />
      <path d="M6 34c6-5 12-5 18 0s12 5 18 0" />
    </g>

    <!-- Sangle : un feuillard enroule, avec sa boucle. -->
    <g v-else-if="visuel === 'sangle'">
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="5" />
      <path d="M24 10v4M24 34v4M10 24h4M34 24h4" />
    </g>

    <!-- Piece de machine : un engrenage, la seule forme qui dit "rechange". -->
    <g v-else>
      <circle cx="24" cy="24" r="8" />
      <circle cx="24" cy="24" r="3" />
      <path
        d="M24 6v6M24 36v6M6 24h6M36 24h6M11.5 11.5l4.2 4.2M32.3 32.3l4.2 4.2M36.5 11.5l-4.2 4.2M15.7 32.3l-4.2 4.2"
      />
    </g>
  </svg>
</template>
