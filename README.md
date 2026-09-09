# Suivi de stock multisites

Un outil interne de consultation du stock, en deux ecrans qui ne s'adressent pas
aux memes gens, plus une page qui explique le projet a un lecteur non technique.

**Le suivi du stock** est dense : une ligne par produit et par site, un etat, un
tri par urgence, une demande de reapprovisionnement. Il est fait pour quelqu'un
qui connait les produits et qui cherche un chiffre.

**Les produits** est un catalogue : une silhouette dessinee, une phrase qui dit a
quoi chaque produit sert, ses dimensions, et quels sites en detiennent. Il est
fait pour quelqu'un qui vient d'arriver et pour qui "Voile d'hivernage 17 g" ne
veut rien dire.

On ne degrade pas l'ecran des habitues pour servir les nouveaux : on donne aux
nouveaux leur propre porte d'entree.

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
npm run tester     # la suite de tests
npm run verifier   # verification des types sur tout le projet
```

Node 20 ou plus recent.

## La pile, et pourquoi elle est faite comme ca

| Choix | Pourquoi |
| --- | --- |
| Nuxt 4 | L'API et l'interface vivent dans le meme projet. Un fichier depose dans `server/api` devient une adresse et un fichier dans `app/pages` devient une page, sans serveur separe a lancer ni table de routes a tenir. |
| Vue 3, `script setup` | La forme courante aujourd'hui. Les proprietes et les evenements d'un composant sont declares en TypeScript, donc verifies. |
| TypeScript | Les types sont dans `shared/`, lus par le serveur ET par l'interface. Ajouter un champ signale tous les endroits qui ne le connaissent pas encore. |
| Tailwind 4 | Les couleurs du projet sont declarees une fois dans `app/assets/css/main.css`. Pas de fichier de configuration separe depuis la version 4. |
| Vitest | Les regles metier vivent dans `shared/regles.ts`, sans dependance a HTTP : les verifier est un appel de fonction, pas une requete a un serveur qu'il faut demarrer. |
| Pas de base de donnees | Les donnees sont dans `server/donnees/references.ts`. Voir plus bas : c'est un choix, pas un oubli. |

```
app/
  components/    EtiquetteEtat, VignetteProduit, BarreDeFiltres,
                 TableauReferences, PanneauDetail, HistoriqueMouvements,
                 CarteProduit
  pages/         index.vue (le stock), produits.vue (le catalogue),
                 a-propos.vue (la page pour un lecteur non technique)
server/
  api/           references.get.ts, catalogue.get.ts, sites.get.ts,
                 reappro.post.ts
  donnees/       catalogue.ts (les produits) et stocks.ts (ce que chaque
                 site detient) - deux fichiers, comme deux tables
shared/
  types/         les types partages entre le serveur et l'interface
  regles.ts      les regles metier, hors de toute route HTTP
  pluriel.ts     une regle de langue, ecrite une seule fois
tests/           22 cas sur les regles, sans demarrer de serveur
```

## Ce que j'ai decide, et pourquoi

**Deux tables, produits et stocks, et pas une seule.** Un produit est ce qu'on
achete : une cagette bois 30 x 40, ses dimensions, son fournisseur, ce a quoi
elle sert. Il existe une fois pour le groupe. Un stock est ce qu'un site en
detient : une quantite, un seuil, des mouvements. Il existe une fois par site.
La premiere version melangeait les deux, et tant qu'on n'affichait qu'un tableau
ca passait. Des qu'il a fallu un catalogue, le defaut est apparu : la description
d'une cagette aurait ete recopiee sur chaque site qui en detient, et le jour ou on
la corrige a Moissac elle reste fausse a Agen. **Une information qui ne depend pas
du site n'a rien a faire dans une ligne de site.** C'est aussi ce qui rend
concrete la phrase sur PostgreSQL plus bas : deux tables et une cle etrangere,
exactement ce qu'on ecrirait en base, et `joindre()` est le JOIN ecrit a la main.

**Deux ecrans plutot qu'un ecran enrichi.** Quelqu'un qui travaille la depuis dix
ans cherche un chiffre et perd du temps a tout ce qui prend de la place ; quelqu'un
arrive lundi ne peut rien faire du tableau. Les deux besoins sont opposes, donc
les servir sur le meme ecran revient a mal servir les deux. Le catalogue a la
place pour une silhouette et une phrase ; le tableau reste dense.

**Les vignettes sont dessinees, pas photographiees.** Trois raisons, dans l'ordre :
ce depot est public et une photo trouvee en ligne pose une question de droits qu'on
n'a aucune raison de se creer ; un carton brun photographie sur fond brun ne se
distingue pas d'un autre carton brun a petite taille, un trait si ; et un dessin
prend la couleur du texte, donc il fonctionne en theme clair comme en sombre.
`VignetteProduit.vue` est la seule porte : le jour ou de vraies photos existent, on
y remplace le SVG par une balise `<img loading="lazy">` avec ses dimensions, et
aucune page n'a a le savoir.

**L'interface est ecrite en francais correct, le code ne l'est pas.** Les
commentaires et les identifiants restent sans accents - c'est une habitude de
code, et un identifiant accentue est une mauvaise idee de toute facon. Mais un
ecran est lu par des gens : "Quantite", "Etat", "Filet paragrele" ou "ce qu il
fait" affiches a l'ecran sont des fautes d'orthographe, pas un choix technique.
La frontiere passe entre ce que la MACHINE lit et ce qu'une PERSONNE lit, et pas
ailleurs.

*Corrige le 9 septembre, en trois passes : 32 textes d'interface, 16 apostrophes
manquantes, puis 35 textes dans les donnees de demonstration - les noms de
produits et leurs descriptions, qui sont les textes les plus lus de
l'application et que les deux premieres passes avaient rates.* Les identifiants
n'ont pas bouge, et la recherche continue de fonctionner parce qu'elle passe par
`aPlat()`, qui enleve les accents avant de comparer : "paragrele" trouve "Filet paragrele" aussi bien
que "paragrele".

**Une page "A propos", pour quelqu'un qui n'est pas developpeur.** Une
application interne n'en aurait pas ; celle-ci est une demonstration, et la page
le dit des sa premiere ligne plutot que de laisser croire a une confusion. Sa
regle d'ecriture : on part de ce qui SE VOIT a l'ecran et on remonte vers
l'outil. "Quand vous cochez un filtre, le tableau se met a jour sans que la page
se recharge" se comprend sans rien savoir ; "Vue est un framework reactif" ne se
comprend que si on sait deja. Le nom de l'outil vient apres, jamais avant.

**Les verifications conditionnent la mise en ligne.** La commande de
construction de Netlify est `npm run verifier && npm run tester && npm run
build` : si un type est faux ou si un test echoue, la construction s'arrete et
la version en ligne reste la derniere bonne. Sans ce `&&`, GitHub verifiait de
son cote et Netlify deployait du sien, sans que rien ne les relie - des tests
rouges et un site casse en ligne pouvaient coexister. Ce n'etait pas une chaine,
c'etaient deux choses declenchees en parallele. La verification de GitHub garde
son role : elle repond sur la pull request, donc AVANT la fusion ; celle-ci est
le dernier verrou, juste avant la mise en ligne.

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

**Les regles metier sont sorties des routes.** Une regle enfermee dans une route
ne peut etre appelee que par un appel HTTP : pour verifier qu'une quantite de 0
est refusee, il faudrait demarrer un serveur, envoyer une requete et lire une
reponse - trois choses qui peuvent echouer pour des raisons etrangeres a la
regle. Dans `shared/regles.ts`, la meme verification est un appel de fonction.
Ce n'est pas un amenagement pour les tests : la route est de la plomberie, et le
metier n'a pas a en dependre.

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
plutot que de laisser le deviner.

**Ce que je cherche a obtenir n'est pas d'ecrire plus vite. C'est que le code
tienne sans l'outil.** Le jour ou l'assistant ne repond pas, ou l'acces est
coupe, ou simplement ou quelqu'un d'autre reprend le projet, il faut pouvoir
ouvrir un fichier et comprendre ce qu'il fait sans rien demander a personne. Un
code qu'on ne peut relire qu'avec l'aide qui l'a ecrit n'est pas un code livre,
c'est une dette.

C'est de la que viennent les regles d'ecriture du projet, et elles se verifient
en ouvrant n'importe quel fichier :

- **Un commentaire dit pourquoi, jamais quoi.** `// on incremente i` ne sert a
  personne, la ligne le dit deja. Ce qui manque six mois plus tard, c'est la
  raison du choix, et elle ne se retrouve pas en relisant.
- **Les noms sont ceux du metier, en francais.** `seuil`, `reference`, `etat`,
  `famille`. Quelqu'un du magasin comprend la moitie du code sans etre
  developpeur, et c'est l'objectif quand on ecrit un outil interne.
- **Une regle vit a un seul endroit.** Le calcul de l'etat, la regle du pluriel,
  l'apparence d'une etiquette.
- **Rien n'est abrege.** `quantite` et pas `qte`. Trois caracteres gagnes ne
  valent pas une hesitation a la relecture.

Le reste suit : je decide de ce qu'on construit et de son decoupage, et je decide
de ce qui n'entre pas - les six choix ci-dessus sont les miens, y compris celui
de ne pas mettre de base de donnees alors que l'annonce cite PostgreSQL. Ensuite
je verifie, parce qu'une consigne donnee a un modele n'est pas une garantie. Le
premier essai de l'API repondait "12 rouleaus" : la regle du pluriel etait ecrite
a trois endroits, elle est maintenant dans `shared/pluriel.ts` et appelee
partout. Une regle ecrite trois fois n'est pas trois fois plus sure, elle est
trois fois plus fragile.

## Ce que fait chaque fichier

| Fichier | Ce qu'il fait |
| --- | --- |
| `shared/types/stock.ts` | La forme des donnees. Lu par le serveur ET par l'interface, donc les deux parlent de la meme chose. |
| `shared/regles.ts` | Les regles metier : l'etat d'une ligne, la selection, la quantite acceptable. Aucune dependance a HTTP, donc verifiables sans serveur. |
| `shared/pluriel.ts` | Le pluriel des unites. Une regle de langue, ecrite une seule fois. |
| `tests/` | La suite de tests. Chaque cas correspond a une regle voulue ou a un bug rencontre. |
| `server/donnees/catalogue.ts` | Les produits : designation, description, dimensions, fournisseur. Tout ce qui ne depend pas du site. |
| `server/donnees/stocks.ts` | Les cinq sites, et ce que chacun detient : quantite, seuil, mouvements. Tout ce qui depend du site. |
| `server/api/references.get.ts` | Lit les filtres dans l'adresse et appelle la regle. De la plomberie, rien de plus. |
| `server/api/catalogue.get.ts` | Rend les produits une fois chacun, avec la repartition par site. Ce n'est pas le meme objet que references.get.ts. |
| `server/api/sites.get.ts` | Rend la liste des sites, pour remplir le menu du filtre. |
| `server/api/reappro.post.ts` | Recoit une demande de reapprovisionnement, demande a la regle si elle est acceptable, rend un numero ou un refus motive. |
| `app/pages/index.vue` | L'ecran de stock. Il tient les filtres et la ligne ouverte, et rien d'autre. |
| `app/pages/produits.vue` | Le catalogue. Son existence en tant que fichier suffit a creer l'adresse /produits. |
| `app/pages/a-propos.vue` | Ce que l'application utilise et pourquoi, ecrit pour quelqu'un qui n'est pas developpeur. |
| `app/components/BarreDeFiltres.vue` | Les quatre champs de filtre et le compteur de resultats. Ne filtre rien lui-meme. |
| `app/components/TableauReferences.vue` | Le tableau. Affiche, et previent la page quand on ouvre une ligne. |
| `app/components/PanneauDetail.vue` | La fiche et le formulaire. Le seul endroit qui ecrit au lieu de lire. |
| `app/components/HistoriqueMouvements.vue` | Les derniers mouvements d'une ligne. Le signe et le mot portent le sens, pas la couleur. |
| `app/components/VignetteProduit.vue` | La silhouette d'un produit, dessinee en SVG. La seule porte a changer le jour ou de vraies photos existent. |
| `app/components/CarteProduit.vue` | Une carte du catalogue : vignette, description, caracteristiques, repartition. |
| `app/components/EtiquetteEtat.vue` | La pastille d'etat : un mot, une forme, une couleur. Utilisee par le tableau et par la fiche. |
| `app/assets/css/main.css` | Les couleurs du projet et le contour de focus, declares une fois. |
| `nuxt.config.ts` | Les quelques choix qui ne se devinent pas des dossiers. |

## La suite de tests

`npm run tester` : 33 cas, moins d'une seconde et demie, aucun serveur a demarrer.

Ce qui est verifie : le calcul de l'etat, y compris **au seuil exactement** - la
regle veut qu'on commande deja, attendre d'etre en dessous c'est attendre d'etre
en retard ; la jointure des deux tables, y compris le stock dont le produit
n'existe pas, qui est **ecarte** plutot qu'affiche sans nom ; la date du dernier
mouvement, calculee **sans supposer que la liste est triee** ; la selection par
site, par famille et par recherche, avec ou sans accents ; l'ordre d'affichage,
l'urgence d'abord ; le repli sur le code quand un site est introuvable ; la
construction du catalogue, dont le produit que **personne ne detient**, qui reste
au catalogue parce qu'il reste commandable ; et le refus d'une quantite nulle,
negative, decimale, non numerique ou trop grande.

Deux principes derriere ces cas :

**Les donnees des tests sont fabriquees pour l'occasion**, pas reprises du
fichier de demonstration. Un test doit echouer quand la REGLE se casse, jamais
parce que quelqu'un a ajoute une cagette.

**Chaque cas correspond a une regle voulue ou a un bug rencontre.** Le cas
`auPluriel('rouleau', 12)` est la parce que l'API a vraiment repondu
"12 rouleaus" au premier essai. C'est la difference entre une suite qui protege
et une suite qui fait joli dans un depot.

La suite a ete verifiee en la faisant echouer : remplacer `quantite <= seuil` par
`quantite < seuil` dans `etatDe` fait tomber le cas du seuil exact, et lui seul.
Une suite qu'on n'a jamais vue echouer ne prouve rien.

## Comment on modifie, sans rien demander a personne

C'est le vrai test d'un code lisible : savoir ou poser la main.

**Changer la regle du seuil.** Un fichier, une fonction : `shared/regles.ts`,
fonction `etatDe`. Trois lignes, et tout l'ecran suit - le tri, les pastilles, le
compteur du haut. `npm run tester` dit tout de suite si le changement casse autre
chose que ce qu'on visait.

**Ajouter un quatrieme etat**, par exemple `bientot-perime`. On l'ajoute au type
`EtatStock` dans `shared/types/stock.ts`, et **le projet refuse de compiler tant
que les deux endroits qui doivent le connaitre ne l'ont pas** : la table
`APPARENCE` de `EtiquetteEtat.vue` et l'ordre de tri `RANG` de
`shared/regles.ts`. Les deux sont ecrits en `Record<EtatStock, ...>` exactement
pour ca. `npm run verifier` les nomme, avec leur fichier et leur ligne.

**Ajouter une colonne au tableau.** Le champ dans `shared/types/stock.ts` - sur
`Produit` si l'information ne depend pas du site, sur `Stock` si elle en depend,
et c'est la seule question a se poser. Puis la valeur dans le fichier de donnees
correspondant, et un `<th>` et un `<td>` dans `TableauReferences.vue`. TypeScript
signale les deux premiers oublis.

**Ajouter un produit au catalogue.** Une entree dans `server/donnees/catalogue.ts`,
et c'est tout : il apparait aussitot dans le catalogue, meme si aucun site n'en
detient. Pour qu'il apparaisse aussi dans le tableau de stock, il faut qu'un site
en detienne, donc une entree dans `server/donnees/stocks.ts`. Les deux fichiers
sont separes parce que les deux faits le sont.

**Remplacer les silhouettes par de vraies photos.** Un seul composant :
`app/components/VignetteProduit.vue`. Ni les pages ni les cartes ne savent
comment une vignette est dessinee.

**Ajouter une famille de produits.** La valeur dans le type `Famille`
(`shared/types/stock.ts`), puis le libelle dans la liste `FAMILLES` de
`BarreDeFiltres.vue`. Attention : TypeScript ne force pas le second, c'est une
liste d'affichage. C'est le seul endroit du projet ou un oubli passe en silence.

**Brancher une vraie base de donnees.** Deux fichiers, `catalogue.ts` et
`stocks.ts`, qui deviennent deux tables reliees par `produitId`. `joindre()` dans
`shared/regles.ts` disparait au profit d'un JOIN, et rien d'autre ne bouge : ni
les routes, ni les pages, ni les composants ne savent d'ou viennent les donnees.

## Ce qu'il n'y a pas dedans

Une demande de reapprovisionnement est validee puis renvoyee avec un numero,
mais rien n'est enregistre de facon durable. Il n'y a ni comptes, ni droits, ni
historique des mouvements. Ce sont les etapes suivantes, et elles demandent une
base de donnees.

Les tests couvrent les regles metier, pas l'affichage : il n'y a pas de test de
composant ni de parcours de bout en bout. C'est assume pour cette taille de
projet - ce sont les regles qui se cassent en silence, une page qui ne s'affiche
plus se voit tout de suite.

---

Mercia Randrianome
