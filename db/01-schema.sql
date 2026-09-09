-- LE SCHEMA : QUATRE TABLES.
--
-- Il reprend exactement le modele des fichiers TypeScript, et c'est le but : le
-- README promettait que brancher une base serait un remplacement et non une
-- reecriture. Ce fichier est la preuve, ou son dementi.
--
-- Ce que le passage en base change vraiment, et que TypeScript ne pouvait pas
-- faire : les MOUVEMENTS deviennent une table. En TypeScript ils sont un tableau
-- range dans un stock, ce qui va tant qu'on les lit tous ensemble. En base, un
-- tableau imbrique interdit de repondre a "toutes les sorties du mois, tous
-- sites confondus" sans parcourir chaque stock. Une liste qui grandit sans
-- limite est une table.
--
-- Docker execute les fichiers de ce dossier dans l'ordre alphabetique, au tout
-- premier demarrage du conteneur et jamais ensuite. D'ou le "01-" : le schema
-- avant les donnees.

-- Les sites du groupe.
CREATE TABLE sites (
  code         TEXT PRIMARY KEY,
  nom          TEXT NOT NULL,
  departement  TEXT NOT NULL
);

-- Ce qu'on achete, independamment de qui en detient.
CREATE TABLE produits (
  id               TEXT PRIMARY KEY,
  designation      TEXT NOT NULL,
  famille          TEXT NOT NULL,
  visuel           TEXT NOT NULL,
  description      TEXT NOT NULL,
  unite            TEXT NOT NULL,
  dimensions       TEXT NOT NULL,
  conditionnement  TEXT NOT NULL,
  fournisseur      TEXT NOT NULL,

  -- L'union de chaines TypeScript devient une contrainte. Sans elle, rien
  -- n'empecherait d'inserer famille = 'embalage' avec une faute de frappe, et la
  -- ligne disparaitrait silencieusement de tous les filtres. TypeScript protege
  -- le code, la contrainte protege la donnee : ce ne sont pas les memes gardes,
  -- et la donnee survit au code.
  CONSTRAINT famille_connue CHECK (famille IN ('emballage', 'protection', 'conditionnement')),
  CONSTRAINT visuel_connu CHECK (visuel IN (
    'cagette', 'barquette', 'plateau', 'bobine-film', 'bobine-etiquette',
    'filet', 'voile', 'sangle', 'piece-machine'
  ))
);

-- Ce qu'un site detient d'un produit.
CREATE TABLE stocks (
  produit_id  TEXT NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  site_code   TEXT NOT NULL REFERENCES sites(code) ON DELETE CASCADE,
  quantite    INTEGER NOT NULL,
  seuil       INTEGER NOT NULL,

  -- La cle est le COUPLE : un site ne detient qu'une ligne par produit. Ecrite
  -- ici, la regle devient impossible a enfreindre, meme par une insertion faite
  -- a la main dans un terminal un vendredi soir.
  PRIMARY KEY (produit_id, site_code),

  CONSTRAINT quantite_positive CHECK (quantite >= 0),
  CONSTRAINT seuil_positif CHECK (seuil >= 0)
);

-- Les entrees et les sorties.
CREATE TABLE mouvements (
  id          SERIAL PRIMARY KEY,
  produit_id  TEXT NOT NULL,
  site_code   TEXT NOT NULL,
  date        DATE NOT NULL,
  sens        TEXT NOT NULL,
  quantite    INTEGER NOT NULL,
  motif       TEXT NOT NULL,

  -- La cle etrangere pointe vers le COUPLE, pas vers le produit seul : un
  -- mouvement appartient a un stock, donc a un produit SUR UN SITE. ON DELETE
  -- CASCADE efface les mouvements avec le stock qu'ils decrivent, plutot que de
  -- laisser des lignes orphelines que plus rien ne relie a personne.
  FOREIGN KEY (produit_id, site_code) REFERENCES stocks(produit_id, site_code) ON DELETE CASCADE,

  -- La quantite est TOUJOURS positive : c'est `sens` qui porte la direction.
  -- Melanger les deux - un nombre negatif pour une sortie - oblige a se souvenir
  -- de la convention a chaque requete, et un jour quelqu'un fait une somme sans
  -- y penser.
  CONSTRAINT sens_connu CHECK (sens IN ('entree', 'sortie')),
  CONSTRAINT quantite_positive CHECK (quantite > 0)
);

-- Le seul index ajoute a la main, et il a une raison precise : la fiche d'un
-- stock demande ses mouvements les plus recents, ce qui filtre sur le couple et
-- trie sur la date. Les cles primaires en fabriquent deja pour le reste ; en
-- ajouter d'autres "au cas ou" ralentirait les ecritures sans rien accelerer.
CREATE INDEX mouvements_par_stock ON mouvements (produit_id, site_code, date DESC);
