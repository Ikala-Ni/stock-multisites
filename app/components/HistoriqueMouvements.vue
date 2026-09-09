<script setup lang="ts">
// L'HISTORIQUE DES MOUVEMENTS.
//
// C'est ce qui repond a la vraie question qu'on se pose devant une rupture :
// est-ce que ca vient de partir d'un coup, ou est-ce que ca s'epuise depuis
// trois semaines. Une quantite seule ne le dit pas, et c'est pourtant elle qui
// decide si on commande en urgence ou si on attend la prochaine livraison.
//
// LE SENS N'EST PAS PORTE PAR LA COULEUR. Une entree affiche "+" et une sortie
// affiche "-", et le mot "Entree" ou "Sortie" est lu par les lecteurs d'ecran.
// Meme regle que les etats de stock : le signe et le mot d'abord, la teinte en
// renfort. Un tableau de mouvements imprime en noir et blanc doit rester lisible.
//
// Le motif est la colonne la plus utile et la plus facile a oublier : savoir
// qu'il est sorti six rouleaux n'aide pas, savoir qu'ils sont partis au verger
// de Boudou permet d'appeler quelqu'un.

import type { Mouvement } from '~~/shared/types/stock'

defineProps<{ mouvements: Mouvement[]; unite: string }>()

function enDateCourte(iso: string): string {
  const [a, m, j] = iso.split('-')
  return `${j}/${m}/${a}`
}
</script>

<template>
  <div>
    <h3 class="mb-2 font-semibold">Derniers mouvements</h3>

    <p v-if="!mouvements.length" class="text-sm text-ardoise-500">
      Ce stock n a jamais bouge depuis son enregistrement.
    </p>

    <table v-else class="w-full border-collapse text-sm">
      <caption class="sr-only">Mouvements du plus recent au plus ancien</caption>
      <thead>
        <tr class="border-b border-ardoise-100 text-left text-xs text-ardoise-500">
          <th scope="col" class="pb-1 font-medium">Date</th>
          <th scope="col" class="pb-1 font-medium">Sens</th>
          <th scope="col" class="pb-1 text-right font-medium">Quantite</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(m, i) in mouvements" :key="`${m.date}-${i}`">
          <tr>
            <td class="pt-2 align-top tabular-nums text-ardoise-500">
              <time :datetime="m.date">{{ enDateCourte(m.date) }}</time>
            </td>
            <td class="pt-2 align-top">
              <span :class="m.sens === 'entree' ? 'text-vert-700' : 'text-ardoise-900'">
                {{ m.sens === 'entree' ? 'Entree' : 'Sortie' }}
              </span>
            </td>
            <td
              class="pt-2 text-right align-top font-semibold tabular-nums"
              :class="m.sens === 'entree' ? 'text-vert-700' : 'text-ardoise-900'"
            >
              {{ m.sens === 'entree' ? '+' : '-' }}{{ m.quantite }}
              <span class="font-normal text-ardoise-500">{{ unite }}</span>
            </td>
          </tr>
          <!-- Le motif sur sa propre ligne plutot qu'en quatrieme colonne : le
               panneau fait 22 rem de large, une colonne de plus rendrait les
               quatre illisibles. colspan="3" le laisse courir sur la largeur. -->
          <tr>
            <td colspan="3" class="pb-2 text-xs text-ardoise-500">{{ m.motif }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
