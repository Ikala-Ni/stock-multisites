<script setup lang="ts">
// LA FICHE ET LE FORMULAIRE DE REAPPROVISIONNEMENT.
//
// C'est ici que la page ECRIT, la ou tout le reste ne fait que lire. Trois
// choses s'y jouent qu'un ecran de consultation n'a pas a gerer :
//
//   1. L'etat de l'envoi. Un bouton qu'on peut cliquer trois fois de suite
//      envoie trois demandes. On desactive pendant l'envoi, et on le dit.
//   2. L'erreur du serveur, affichee telle qu'il l'a formulee. Un "une erreur
//      est survenue" n'aide personne : le serveur sait pourquoi il a refuse.
//   3. Le retour au calme. Apres une demande acceptee, le message reste, sinon
//      on ne sait pas si ca a marche.
//
// LA FICHE PORTE CE QUI SERT A DECIDER, ET RIEN D'AUTRE. Dimensions,
// conditionnement et fournisseur sont la parce qu'on les regarde avant de
// commander ; l'historique parce qu'il dit si le stock est parti d'un coup ou
// s'epuise lentement. La description "a quoi ca sert", elle, n'est PAS ici :
// quelqu'un qui ouvre une fiche de stock sait deja ce qu'est une cagette. Elle
// vit dans le catalogue, qui s'adresse a quelqu'un d'autre.

import type { DemandeReappro, LigneStock, ReponseReappro } from '~~/shared/types/stock'
import { auPluriel, quantiteEcrite } from '~~/shared/pluriel'

const props = defineProps<{ ligne: LigneStock }>()
const emit = defineEmits<{ fermer: [] }>()

// La quantite proposee par defaut : de quoi repasser au-dessus du seuil, avec
// une marge. C'est le genre de detail qui fait qu'un outil interne est utilise
// ou contourne - la personne n'a rien a calculer dans sa tete.
const quantiteProposee = (l: LigneStock) => Math.max(1, l.seuil * 2 - l.quantite)

const quantite = ref(quantiteProposee(props.ligne))
const commentaire = ref('')

const envoiEnCours = ref(false)
const erreur = ref('')
const succes = ref<ReponseReappro | null>(null)

// watch : quand on ouvre une autre fiche sans fermer le panneau, tout se remet
// a zero. Sans ca, le message de succes de la ligne precedente resterait
// affiche au-dessus d'une autre ligne, et on croirait avoir commande.
watch(
  () => props.ligne.id,
  () => {
    quantite.value = quantiteProposee(props.ligne)
    commentaire.value = ''
    erreur.value = ''
    succes.value = null
  }
)

async function envoyer() {
  envoiEnCours.value = true
  erreur.value = ''
  succes.value = null

  try {
    const corps: DemandeReappro = {
      ligneId: props.ligne.id,
      quantite: quantite.value,
      commentaire: commentaire.value || undefined,
    }
    // $fetch est l'appel HTTP fourni par Nuxt. Le <ReponseReappro> dit ce qu'on
    // attend en retour : la suite du code est alors verifiee par TypeScript, et
    // une faute de frappe sur "accepte" devient une erreur a l'ecriture.
    succes.value = await $fetch<ReponseReappro>('/api/reappro', { method: 'POST', body: corps })
  } catch (e: unknown) {
    // L'erreur renvoyee par le serveur porte son statusMessage. On l'affiche.
    const message = (e as { statusMessage?: string })?.statusMessage
    erreur.value = message || "La demande n'a pas pu être envoyée. Réessaie dans un instant."
  } finally {
    // finally : quoi qu'il arrive, le bouton se rallume. S'il etait remis dans
    // le try seulement, une erreur laisserait le formulaire bloque pour de bon.
    envoiEnCours.value = false
  }
}
</script>

<template>
  <aside aria-labelledby="titre-fiche" class="rounded-lg border border-ardoise-200 bg-white p-5">
    <div class="mb-4 flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <VignetteProduit :visuel="ligne.produit.visuel" :taille="44" />
        <div>
          <h2 id="titre-fiche" class="text-lg font-semibold leading-tight">
            {{ ligne.produit.designation }}
          </h2>
          <p class="text-sm text-ardoise-500">{{ ligne.produit.id }} | site de {{ ligne.siteNom }}</p>
        </div>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md border border-ardoise-200 px-2.5 py-1 text-sm hover:bg-ardoise-50"
        @click="emit('fermer')"
      >
        Fermer<span class="sr-only"> la fiche</span>
      </button>
    </div>

    <!-- <dl> : une liste de paires terme et valeur. C'est le balisage juste pour
         des caracteristiques, et il dit au lecteur d'ecran que "42 palettes"
         est la valeur de "En stock". -->
    <dl class="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      <div>
        <dt class="text-ardoise-500">En stock</dt>
        <dd class="font-semibold tabular-nums">{{ quantiteEcrite(ligne.quantite, ligne.produit.unite) }}</dd>
      </div>
      <div>
        <dt class="text-ardoise-500">Seuil d'alerte</dt>
        <dd class="font-semibold tabular-nums">{{ ligne.seuil }}</dd>
      </div>
      <div>
        <dt class="text-ardoise-500">État</dt>
        <dd class="mt-0.5"><EtiquetteEtat :etat="ligne.etat" /></dd>
      </div>
      <div>
        <dt class="text-ardoise-500">Famille</dt>
        <dd class="font-semibold capitalize">{{ ligne.produit.famille }}</dd>
      </div>
    </dl>

    <dl class="mb-5 grid gap-y-2 border-t border-ardoise-100 pt-4 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="text-ardoise-500">Dimensions</dt>
        <dd class="text-right font-medium">{{ ligne.produit.dimensions }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ardoise-500">Conditionnement</dt>
        <dd class="text-right font-medium">{{ ligne.produit.conditionnement }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ardoise-500">Fournisseur</dt>
        <dd class="text-right font-medium tabular-nums">{{ ligne.produit.fournisseur }}</dd>
      </div>
    </dl>

    <div class="mb-5 border-t border-ardoise-100 pt-4">
      <HistoriqueMouvements :mouvements="ligne.mouvements" :unite="ligne.produit.unite" />
    </div>

    <form class="border-t border-ardoise-100 pt-4" @submit.prevent="envoyer">
      <h3 class="mb-3 font-semibold">Demander un réapprovisionnement</h3>

      <div class="mb-3">
        <label for="champ-quantite" class="mb-1 block text-sm font-medium">
          Quantité en {{ auPluriel(ligne.produit.unite, 2) }}
        </label>
        <input
          id="champ-quantite"
          v-model.number="quantite"
          type="number"
          min="1"
          max="500"
          required
          class="w-32 rounded-md border border-ardoise-200 px-3 py-2 text-sm tabular-nums"
        >
      </div>

      <div class="mb-4">
        <label for="champ-commentaire" class="mb-1 block text-sm font-medium">
          Commentaire <span class="font-normal text-ardoise-500">(facultatif)</span>
        </label>
        <textarea
          id="champ-commentaire"
          v-model="commentaire"
          rows="2"
          class="w-full rounded-md border border-ardoise-200 px-3 py-2 text-sm"
          placeholder="Urgence, date souhaitée, transfert depuis un autre site..."
        />
      </div>

      <button
        type="submit"
        :disabled="envoiEnCours"
        class="rounded-md bg-ardoise-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ardoise-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ envoiEnCours ? 'Envoi en cours...' : 'Envoyer la demande' }}
      </button>

      <!-- role="status" pour le succes, role="alert" pour l'erreur : les deux
           sont annonces sans que la personne ait a aller les chercher, et
           "alert" interrompt la lecture en cours parce qu'il y a quelque chose
           a corriger. -->
      <p v-if="succes" role="status" class="mt-4 rounded-md border border-vert-700 bg-vert-50 p-3 text-sm text-vert-700">
        {{ succes.message }}
        <span class="mt-1 block font-semibold">Numéro de demande : {{ succes.numero }}</span>
      </p>

      <p v-if="erreur" role="alert" class="mt-4 rounded-md border border-brique-700 bg-brique-50 p-3 text-sm text-brique-700">
        {{ erreur }}
      </p>
    </form>
  </aside>
</template>
