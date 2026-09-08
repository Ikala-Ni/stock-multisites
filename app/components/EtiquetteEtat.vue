<script setup lang="ts">
// L'ETIQUETTE D'ETAT : LE COMPOSANT LE PLUS IMPORTANT DE L'ECRAN.
//
// C'est lui qui dit s'il faut agir. Trois choix s'y jouent, et ils tiennent
// tous a la meme regle : LA COULEUR NE PORTE JAMAIS LE SENS TOUTE SEULE.
//
//   1. Un MOT ecrit. "Rupture", "A commander", "Suffisant". Une personne qui ne
//      distingue pas le rouge du vert - c'est environ un homme sur douze - lit
//      le mot et sait quoi faire. La couleur ne fait que renforcer.
//   2. Une FORME differente par etat : carre plein, triangle, cercle. Deux
//      reperes colores qui coexistent doivent avoir deux silhouettes, sinon on
//      les separe seulement a la teinte, et en niveaux de gris ils se
//      confondent - c'est aussi ce qui arrive quand on imprime l'ecran.
//   3. Un texte pour les lecteurs d'ecran, avec title sur le SVG : sans lui,
//      la forme n'est qu'un dessin muet.
//
// Ce n'est pas de l'ornement. Un ecran de stock se lit vite, souvent debout,
// parfois sur un telephone en plein soleil. Le mot survit a tout ca.

import type { EtatStock } from '~~/shared/types/stock'

const props = defineProps<{ etat: EtatStock }>()

// Un objet plutot qu'une suite de "si" : ajouter un quatrieme etat demande
// alors une ligne ici et rien d'autre, et TypeScript refuse de compiler tant
// que le nouvel etat n'a pas sa ligne - c'est le Record<EtatStock, ...> qui
// l'exige.
const APPARENCE: Record<EtatStock, { mot: string; classes: string; forme: 'carre' | 'triangle' | 'cercle' }> = {
  rupture: {
    mot: 'Rupture',
    classes: 'bg-brique-50 text-brique-700 border-brique-700',
    forme: 'carre',
  },
  'a-commander': {
    mot: 'A commander',
    classes: 'bg-ambre-50 text-ambre-700 border-ambre-700',
    forme: 'triangle',
  },
  suffisant: {
    mot: 'Suffisant',
    classes: 'bg-vert-50 text-vert-700 border-vert-700',
    forme: 'cercle',
  },
}

const apparence = computed(() => APPARENCE[props.etat])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
    :class="apparence.classes"
  >
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" class="shrink-0">
      <rect v-if="apparence.forme === 'carre'" x="0" y="0" width="10" height="10" fill="currentColor" />
      <polygon v-else-if="apparence.forme === 'triangle'" points="5,0 10,10 0,10" fill="currentColor" />
      <circle v-else cx="5" cy="5" r="5" fill="currentColor" />
    </svg>
    {{ apparence.mot }}
  </span>
</template>
