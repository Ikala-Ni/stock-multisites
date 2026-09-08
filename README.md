# Suivi de stock multisites

Un outil interne de consultation du stock : des references d'emballage, de
protection des cultures et de conditionnement, reparties sur plusieurs sites,
avec un etat par ligne et une demande de reapprovisionnement.

**Pourquoi ce depot existe.** Je l'ai ecrit en septembre 2026 pour repondre a une
annonce de developpeuse frontend web, dans une pile que je ne connaissais pas
avant de commencer : Nuxt 4, Vue 3, TypeScript et Tailwind CSS. L'annonce
demandait exactement ces outils, une consommation d'API REST et des notions de
backend. Plutot que d'ecrire que j'apprends vite, j'ai prefere le montrer sur le
sujet et avec les outils demandes.

Les donnees sont inventees. Aucun site, aucune reference et aucun chiffre ne
correspond a une entreprise reelle.

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm run verifier   # verification des types sur tout le projet
```

Node 20 ou plus recent.

## La pile, et pourquoi elle est faite comme ca

| Choix | Pourquoi |
| --- | --- |
| Nuxt 4 | L'API et l'interface vivent dans le meme projet. Un fichier depose dans `server/api` devient une route, sans serveur separe a lancer. |
| Vue 3, `script setup` | La forme courante aujourd'hui. Les proprietes et les evenements d'un composant sont declares en TypeScript, donc verifies. |
| TypeScript | Les types sont dans `shared/`, lus par le serveur ET par l'interface. Ajouter un champ signale tous les endroits qui ne le connaissent pas encore. |
| Tailwind 4 | Les couleurs du projet sont declarees une fois dans `app/assets/css/main.css`. Pas de fichier de configuration separe depuis la version 4. |
| Pas de base de donnees | Les donnees sont dans `server/donnees/references.ts`. Voir plus bas : c'est un choix, pas un oubli. |

```
app/
  components/    EtiquetteEtat, BarreDeFiltres, TableauReferences, PanneauDetail
  pages/         index.vue - l'ecran, qui ne fait que tenir l'etat
server/
  api/           references.get.ts, sites.get.ts, reappro.post.ts
  donnees/       les donnees de demonstration
shared/
  types/         les types partages entre le serveur et l'interface
  pluriel.ts     une regle de langue, ecrite une seule fois
```

## Ce que j'ai decide, et pourquoi

**Le filtrage se fait sur le serveur, pas dans le navigateur.** Sur dix-huit
lignes, personne ne verrait la difference. Mais un stock reel se compte en
milliers de references, et filtrer cote page voudrait dire telecharger toute la
table a chaque ouverture. La regle que je me donne : la page demande ce qu'elle
affiche, elle ne trie pas ce qu'elle n'affichera pas.

**L'etat d'une ligne est calcule, jamais stocke.** `rupture`, `a-commander` ou
`suffisant` se deduisent de la quantite et du seuil. S'il etait enregistre, il
faudrait le recalculer a chaque mouvement, et le jour ou on oublie, l'ecran
affiche "suffisant" sur une ligne vide. Une valeur qui se deduit d'une autre ne
se stocke pas.

**Trois etats et pas un booleen.** Entre "il en reste assez" et "il n'y en a
plus", il y a le moment ou il faut commander, et c'est le seul qui soit utile a
quelqu'un dont c'est le travail.

**Le formulaire est verifie deux fois, et ce n'est pas une repetition.** La
verification du navigateur previent tout de suite, sans aller-retour ; celle du
serveur est la seule qui protege, parce que tout ce qui tourne dans un
navigateur peut etre contourne. L'une sert au confort, l'autre sert de regle.

**La couleur ne porte jamais le sens toute seule.** Chaque etat a un mot ecrit,
une forme differente - carre, triangle, cercle - et un texte pour les lecteurs
d'ecran. Une personne sur douze environ ne distingue pas le rouge du vert, et un
ecran de stock se lit vite, souvent debout, parfois au soleil. Le mot survit a
tout ca. Le reste suit la meme regle : un vrai `<table>` avec des en-tetes de
ligne et de colonne, un `<label>` par champ, un lien d'evitement, et le nombre de
resultats annonce quand il change.

**Pas de base de donnees, pour l'instant.** Brancher PostgreSQL ne changerait
rien a ce que la page affiche, et ajouterait une installation avant de pouvoir
lancer le projet. Le jour ou on la branche, c'est `server/donnees/references.ts`
qu'on remplace, et rien d'autre : les routes et l'interface ne savent pas d'ou
viennent les donnees.

## Comment je travaille avec l'IA

Cette application a ete ecrite avec l'aide de Claude Code. Je le dis en premier
plutot que de laisser le deviner, parce que c'est ma facon de travailler depuis
un an et que ce qui compte est la maniere.

Je decide de ce qu'on construit et de son decoupage, et je decide de ce qui
n'entre pas : les six choix ci-dessus sont les miens, y compris celui de ne pas
mettre de base de donnees alors que l'annonce cite PostgreSQL. Ensuite je
verifie, parce qu'une consigne donnee a un modele n'est pas une garantie. Le
premier essai de l'API repondait "12 rouleaus" : la regle du pluriel etait ecrite
a trois endroits, elle est maintenant dans `shared/pluriel.ts` et appelee
partout. Une regle ecrite trois fois n'est pas trois fois plus sure, elle est
trois fois plus fragile.

Ce que je cherche n'est pas d'ecrire moins de code. C'est d'aller plus vite sur
ce que je connais deja, et d'apprendre plus vite ce que je ne connais pas
encore.

## Ce qu'il n'y a pas dedans

Une demande de reapprovisionnement est validee puis renvoyee avec un numero,
mais rien n'est enregistre de facon durable. Il n'y a ni comptes, ni droits, ni
historique des mouvements, ni tests automatises. Ce sont les etapes suivantes,
et elles demandent une base de donnees.

---

Mercia Randrianome
