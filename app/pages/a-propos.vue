<script setup lang="ts">
// LA PAGE "A PROPOS".
//
// Elle s'adresse a quelqu'un qui n'est pas developpeur : un recruteur, un chef
// de service, quelqu'un qui doit se faire une idee sans lire une ligne de code.
//
// LA REGLE D'ECRITURE DE CETTE PAGE : on part de ce qui se VOIT a l'ecran, et on
// remonte vers l'outil. "Quand vous cochez un filtre, le tableau se met a jour
// sans que la page se recharge" est comprehensible par tout le monde ; "Vue est
// un framework reactif" ne l'est que par ceux qui savent deja. Le nom de l'outil
// vient apres, jamais avant.
//
// Aucun terme technique n'est employe sans etre explique dans la meme phrase, et
// aucune abreviation n'est laissee seule.
//
// Une application interne n'aurait pas cette page. Elle est ici parce que ce
// projet est une demonstration, et la page le dit des sa premiere ligne plutot
// que de laisser croire a une confusion.

const OUTILS = [
  {
    nom: 'Vue 3',
    quoi: "Il tient l'écran à jour tout seul.",
    ici: "Quand vous cochez « À commander seulement », le tableau et le compteur changent sans que la page se recharge. Personne n'a écrit « quand on coche, alors recalculer » : c'est l'outil qui suit les valeurs et redessine ce qui en dépend.",
  },
  {
    nom: 'Nuxt 4',
    quoi: "Il fait tenir l'écran et le serveur dans un seul projet.",
    ici: "Les trois pages et les quatre adresses qui servent les données vivent dans le même dossier. Il n'y a pas deux projets à maintenir en parallèle, ni deux équipes pour les faire se parler.",
  },
  {
    nom: 'TypeScript',
    quoi: "Il décrit la forme des données et refuse le code qui ne la respecte pas.",
    ici: "Un produit doit avoir un nom, une unité et un fournisseur. Si un jour quelqu'un en oublie un, le projet refuse de se construire et nomme le fichier et la ligne. L'erreur est trouvée avant la mise en ligne, pas par la personne qui utilise l'outil.",
  },
  {
    nom: 'Tailwind 4',
    quoi: "Il met en forme, et il tient les couleurs à un seul endroit.",
    ici: "Les six couleurs de l'application sont déclarées une fois. Changer la teinte des alertes, c'est changer une ligne, pas en chercher trente.",
  },
  {
    nom: 'Node.js',
    quoi: "Il fait tourner la partie invisible, celle qui prépare et vérifie les données.",
    ici: "C'est lui qui décide si une ligne est en rupture, qui trie par urgence, et qui refuse une demande de réapprovisionnement mal remplie. Ce travail est fait sur le serveur, pas dans votre navigateur, pour la raison expliquée plus bas.",
  },
  {
    nom: 'Vitest',
    quoi: "Il rejoue automatiquement les règles de l'outil pour vérifier qu'elles tiennent.",
    ici: "Trente-trois contrôles, en moins de deux secondes. Par exemple : au seuil exactement, une ligne doit passer en « À commander ». Si quelqu'un casse cette règle un jour, un contrôle échoue et le dit.",
  },
  {
    nom: 'Git et GitHub',
    quoi: "Ils gardent l'historique de chaque modification, et qui l'a faite.",
    ici: "Chaque changement est accompagné d'un texte qui explique la décision et sa raison, pas seulement la liste des fichiers touchés. Un historique lisible est une documentation qui ne se perd pas.",
  },
  {
    nom: 'Intégration continue',
    quoi: "Un robot relance tous les contrôles à chaque modification.",
    ici: "Il part d'une machine vierge, donc il attrape aussi le « ça marche chez moi ». Une pastille verte ou rouge apparaît à côté de chaque modification, sans que personne ait à penser à lancer quoi que ce soit.",
  },
]

const CHOIX = [
  {
    titre: 'Un mot, pas seulement une couleur',
    texte:
      "Chaque état porte un mot écrit et une forme différente : un carré pour « Rupture », un triangle pour « À commander », un rond pour « Suffisant ». Environ un homme sur douze ne distingue pas le rouge du vert. Il lit le mot et voit la forme, donc il sait quoi faire. La couleur ne fait que renforcer.",
  },
  {
    titre: 'Utilisable sans souris',
    texte:
      "Toute l'application se parcourt au clavier, et l'élément sélectionné porte toujours un contour visible. Le premier arrêt est un lien qui saute directement au contenu, pour ne pas retraverser les filtres à chaque fois.",
  },
  {
    titre: 'Les erreurs disent quoi corriger',
    texte:
      "Une demande refusée explique pourquoi : « La quantité doit être un nombre entier supérieur à zéro. » Jamais « une erreur est survenue », qui n'aide personne et oblige à appeler quelqu'un.",
  },
  {
    titre: 'Deux écrans pour deux publics',
    texte:
      "Le suivi du stock est dense, fait pour quelqu'un qui connaît les produits et cherche un chiffre. Le catalogue explique à quoi chaque produit sert, pour quelqu'un qui vient d'arriver. On ne dégrade pas l'écran des habitués pour servir les nouveaux : on donne aux nouveaux leur propre porte d'entrée.",
  },
  {
    titre: 'Le calcul se fait sur le serveur',
    texte:
      "Le tri et le filtrage sont faits avant l'envoi, pas dans votre navigateur. Sur dix-huit lignes cela ne se voit pas ; sur un stock réel de plusieurs milliers de références, c'est la différence entre un écran qui s'ouvre tout de suite et un écran qui rame.",
  },
  {
    titre: "Vérifié deux fois, et ce n'est pas un doublon",
    texte:
      "Le formulaire vous prévient tout de suite si la quantité est mauvaise, ce qui est confortable. Le serveur revérifie, ce qui est la seule vérification qui protège vraiment : tout ce qui se passe dans un navigateur peut être contourné.",
  },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold">À propos de cette démonstration</h1>
      <p class="mt-2 text-ardoise-700">
        Cette application est une démonstration, pas un outil en service. Les données sont
        inventées : aucun site, aucun produit et aucun chiffre ne correspond à une entreprise
        réelle.
      </p>
      <p class="mt-2 text-ardoise-700">
        Elle a été écrite pour répondre à une annonce de développeuse frontend web, avec les
        outils que cette annonce demandait, et sur un sujet proche du métier de l'entreprise.
        Cette page explique ce qu'elle utilise et pourquoi, sans supposer que vous soyez
        développeur.
      </p>
    </header>

    <section class="mb-10">
      <h2 class="mb-1 text-lg font-semibold">Ce que fait l'application</h2>
      <p class="mb-4 text-sm text-ardoise-500">En deux écrans</p>

      <div class="grid gap-4 sm:grid-cols-2">
        <article class="rounded-lg border border-ardoise-200 bg-white p-4">
          <h3 class="mb-1 font-semibold">Suivi du stock</h3>
          <p class="text-sm text-ardoise-700">
            Ce que chaque site détient, avec un état par ligne et les urgences en premier. On y
            demande un réapprovisionnement en deux clics. Il est fait pour quelqu'un qui connaît
            les produits.
          </p>
        </article>

        <article class="rounded-lg border border-ardoise-200 bg-white p-4">
          <h3 class="mb-1 font-semibold">Les produits</h3>
          <p class="text-sm text-ardoise-700">
            Un catalogue qui dit à quoi chaque produit sert, en une phrase et sans jargon. Il est
            fait pour quelqu'un qui vient d'arriver et pour qui « Voile d'hivernage 17 g » ne veut
            rien dire.
          </p>
        </article>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="mb-1 text-lg font-semibold">Les outils, et ce qu'ils font ici</h2>
      <p class="mb-4 text-sm text-ardoise-500">
        Chacun résout un problème précis. Le nom vient après ce qu'il fait.
      </p>

      <dl class="divide-y divide-ardoise-200 rounded-lg border border-ardoise-200 bg-white">
        <div v-for="o in OUTILS" :key="o.nom" class="grid gap-1 p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
          <dt class="font-semibold">{{ o.nom }}</dt>
          <dd>
            <p class="font-medium">{{ o.quoi }}</p>
            <p class="mt-1 text-sm text-ardoise-700">{{ o.ici }}</p>
          </dd>
        </div>
      </dl>
    </section>

    <section class="mb-10">
      <h2 class="mb-1 text-lg font-semibold">Les choix qui se voient à l'usage</h2>
      <p class="mb-4 text-sm text-ardoise-500">
        Ce ne sont pas des détails techniques : chacun change ce que vous pouvez faire avec l'outil.
      </p>

      <div class="grid gap-3">
        <article
          v-for="c in CHOIX"
          :key="c.titre"
          class="rounded-lg border-l-2 border-ardoise-900 bg-white py-3 pl-4 pr-4"
        >
          <h3 class="mb-1 font-semibold">{{ c.titre }}</h3>
          <p class="text-sm text-ardoise-700">{{ c.texte }}</p>
        </article>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="mb-1 text-lg font-semibold">Ce qui est vérifié tout seul</h2>
      <p class="mb-4 text-sm text-ardoise-500">Sans que personne ait à y penser</p>

      <div class="rounded-lg border border-ardoise-200 bg-white p-5">
        <p class="mb-3 text-sm text-ardoise-700">
          Trente-trois contrôles rejouent les règles de l'application, et un contrôle
          supplémentaire vérifie que la forme des données est respectée partout. Les deux se
          relancent automatiquement à chaque modification, sur une machine vierge.
        </p>
        <p class="mb-3 text-sm text-ardoise-700">
          Ces contrôles ont été vus échouer avant d'être livrés : on a cassé une règle
          volontairement pour vérifier qu'ils la rattrapaient. Une série de contrôles qu'on n'a
          jamais vue échouer ne prouve rien.
        </p>
        <p class="text-sm text-ardoise-700">
          Le code est commenté en français, et chaque fichier explique ce qu'il fait et pourquoi
          il est écrit ainsi. L'objectif est qu'une autre personne puisse le reprendre sans avoir
          à joindre celle qui l'a écrit.
        </p>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold">Voir le code</h2>
      <p class="text-sm text-ardoise-700">
        Le projet est public et lisible par tout le monde, y compris son historique de
        modifications :
        <a
          href="https://github.com/Ikala-Ni/stock-multisites"
          class="font-semibold text-ardoise-900 underline underline-offset-2"
          rel="noopener"
        >github.com/Ikala-Ni/stock-multisites</a>
      </p>
    </section>
  </div>
</template>
