// REMPLIR LA BASE, DEPUIS LES FICHIERS TYPESCRIPT.
//
//   npm run bd:semer
//
// POURQUOI UN SCRIPT PLUTOT QU'UN FICHIER SQL ECRIT A LA MAIN.
//
// Un `02-donnees.sql` aurait marche, et Docker l'aurait execute tout seul au
// premier demarrage. Mais il aurait recopie les dix-huit produits et leurs
// descriptions a cote des memes dix-huit produits en TypeScript. Deux copies des
// memes donnees divergent a la premiere correction : on corrige une faute dans
// la description d'une cagette, on oublie l'autre fichier, et l'application dit
// deux choses differentes selon qu'une base tourne ou non.
//
// Les fichiers TypeScript restent la SOURCE, la base en est remplie. C'est la
// meme regle que partout ailleurs dans ce projet : une information vit a un seul
// endroit.
//
// Le script est REJOUABLE : il vide les tables avant d'inserer. On peut donc le
// relancer apres avoir corrige une donnee, sans recreer le conteneur.

import 'dotenv/config'
import { Pool } from 'pg'
import { PRODUITS } from '../server/donnees/catalogue'
import { SITES, STOCKS } from '../server/donnees/stocks'

const url = process.env.DATABASE_URL
if (!url) {
  console.error(
    'DATABASE_URL est absente. Copie .env.exemple en .env, puis lance la base :\n' +
      '  docker compose up -d'
  )
  process.exit(1)
}

const bd = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 })

async function semer() {
  // Une TRANSACTION : soit tout entre, soit rien. Sans elle, une erreur au
  // milieu laisserait la base a moitie remplie - des produits sans leurs stocks,
  // et un ecran qui affiche un catalogue dont rien n'est en stock nulle part.
  const client = await bd.connect()
  try {
    await client.query('BEGIN')

    // L'ordre compte a l'envers de l'insertion : on efface les mouvements avant
    // les stocks, et les stocks avant les produits, parce que chacun pointe vers
    // le precedent. CASCADE le ferait aussi, mais l'ecrire rend l'ordre visible.
    await client.query('DELETE FROM mouvements')
    await client.query('DELETE FROM stocks')
    await client.query('DELETE FROM produits')
    await client.query('DELETE FROM sites')

    for (const s of SITES) {
      // Les valeurs passent par $1, $2, $3 et jamais par une chaine assemblee.
      // C'est ce qui empeche qu'une donnee contenant une apostrophe - et il y en
      // a, "Voile d'hivernage" - casse la requete ou pire, en modifie le sens.
      await client.query('INSERT INTO sites (code, nom, departement) VALUES ($1, $2, $3)', [
        s.code,
        s.nom,
        s.departement,
      ])
    }

    for (const p of PRODUITS) {
      await client.query(
        `INSERT INTO produits
           (id, designation, famille, visuel, description, unite, dimensions, conditionnement, fournisseur)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          p.id,
          p.designation,
          p.famille,
          p.visuel,
          p.description,
          p.unite,
          p.dimensions,
          p.conditionnement,
          p.fournisseur,
        ]
      )
    }

    let mouvements = 0
    for (const s of STOCKS) {
      await client.query(
        'INSERT INTO stocks (produit_id, site_code, quantite, seuil) VALUES ($1, $2, $3, $4)',
        [s.produitId, s.siteCode, s.quantite, s.seuil]
      )
      for (const m of s.mouvements) {
        await client.query(
          `INSERT INTO mouvements (produit_id, site_code, date, sens, quantite, motif)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [s.produitId, s.siteCode, m.date, m.sens, m.quantite, m.motif]
        )
        mouvements++
      }
    }

    await client.query('COMMIT')

    console.log(
      `Base remplie : ${SITES.length} sites, ${PRODUITS.length} produits, ` +
        `${STOCKS.length} stocks, ${mouvements} mouvements.`
    )
  } catch (erreur) {
    await client.query('ROLLBACK')
    throw erreur
  } finally {
    client.release()
  }
}

semer()
  .catch((erreur) => {
    console.error('Le remplissage a echoue, la base est restee dans son etat precedent.')
    console.error(erreur instanceof Error ? erreur.message : erreur)
    process.exitCode = 1
  })
  .finally(() => bd.end())
