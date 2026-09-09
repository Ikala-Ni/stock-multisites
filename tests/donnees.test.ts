// LES DONNEES DE DEMONSTRATION RESPECTENT LES REGLES DE LA BASE.
//
// POURQUOI CE FICHIER EXISTE.
//
// Le schema SQL porte des garde-fous que TypeScript ne peut pas porter : une
// cle etrangere qui refuse un stock dont le produit n'existe pas, une cle
// primaire sur le couple qui interdit deux lignes pour le meme produit sur le
// meme site, un CHECK qui refuse une quantite negative.
//
// Ces garde-fous ne s'appliquent qu'au mode AVEC base. Sans eux, le mode
// "fichiers" serait moins sur que le mode "base" : on pourrait ajouter un stock
// qui pointe vers un produit inexistant, tout marcherait en local, et le
// remplissage de la base echouerait plus tard sans qu'on comprenne pourquoi.
//
// Ces tests rejouent donc les memes regles sur les donnees TypeScript. Les deux
// modes deviennent aussi surs l'un que l'autre, et une erreur se voit ici -
// en une seconde, sans Docker - au lieu de se voir a l'insertion.
//
// C'est aussi ce qui protege `npm run bd:semer` : il ne peut plus echouer au
// milieu sur une donnee mal formee, parce que le probleme serait deja rouge.

import { describe, expect, it } from 'vitest'
import { PRODUITS } from '~~/server/donnees/catalogue'
import { SITES, STOCKS } from '~~/server/donnees/stocks'

describe('les produits du catalogue', () => {
  it('ont un identifiant unique', () => {
    // PRIMARY KEY (id) dans le schema.
    const ids = PRODUITS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ont tous les champs affiches remplis', () => {
    // NOT NULL dans le schema. Une description vide laisserait une carte muette
    // dans le catalogue, ce qui est precisement ce que cette page doit eviter.
    for (const p of PRODUITS) {
      expect(p.designation.trim(), `designation de ${p.id}`).not.toBe('')
      expect(p.description.trim(), `description de ${p.id}`).not.toBe('')
      expect(p.unite.trim(), `unite de ${p.id}`).not.toBe('')
      expect(p.dimensions.trim(), `dimensions de ${p.id}`).not.toBe('')
      expect(p.conditionnement.trim(), `conditionnement de ${p.id}`).not.toBe('')
      expect(p.fournisseur.trim(), `fournisseur de ${p.id}`).not.toBe('')
    }
  })
})

describe('les sites', () => {
  it('ont un code unique', () => {
    const codes = SITES.map((s) => s.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('les stocks', () => {
  it('pointent tous vers un produit qui existe', () => {
    // FOREIGN KEY (produit_id) REFERENCES produits(id).
    const connus = new Set(PRODUITS.map((p) => p.id))
    const orphelins = STOCKS.filter((s) => !connus.has(s.produitId)).map((s) => s.produitId)
    expect(orphelins).toEqual([])
  })

  it('pointent tous vers un site qui existe', () => {
    // FOREIGN KEY (site_code) REFERENCES sites(code).
    const connus = new Set(SITES.map((s) => s.code))
    const orphelins = STOCKS.filter((s) => !connus.has(s.siteCode)).map((s) => s.siteCode)
    expect(orphelins).toEqual([])
  })

  it('ne comptent qu une ligne par produit et par site', () => {
    // PRIMARY KEY (produit_id, site_code). Deux lignes pour le meme couple
    // feraient apparaitre le produit deux fois dans le tableau, avec deux
    // quantites differentes et aucun moyen de savoir laquelle est la bonne.
    const couples = STOCKS.map((s) => `${s.produitId}|${s.siteCode}`)
    expect(new Set(couples).size).toBe(couples.length)
  })

  it('n ont ni quantite ni seuil negatifs', () => {
    // CHECK (quantite >= 0) et CHECK (seuil >= 0).
    for (const s of STOCKS) {
      expect(s.quantite, `quantite de ${s.produitId} a ${s.siteCode}`).toBeGreaterThanOrEqual(0)
      expect(s.seuil, `seuil de ${s.produitId} a ${s.siteCode}`).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('les mouvements', () => {
  it('portent une quantite strictement positive', () => {
    // CHECK (quantite > 0). La direction est portee par `sens`, jamais par le
    // signe : melanger les deux oblige a se souvenir de la convention a chaque
    // lecture, et un jour quelqu'un fait une somme sans y penser.
    for (const s of STOCKS) {
      for (const m of s.mouvements) {
        expect(m.quantite, `${s.produitId} a ${s.siteCode}, ${m.date}`).toBeGreaterThan(0)
      }
    }
  })

  it('portent une date au format AAAA-MM-JJ', () => {
    // DATE dans le schema. Le format est aussi celui sur lequel le tri des
    // mouvements repose : "2026-09-05" > "2026-08-31" en comparaison de chaines
    // uniquement parce que les champs sont de largeur fixe.
    for (const s of STOCKS) {
      for (const m of s.mouvements) {
        expect(m.date, `${s.produitId} a ${s.siteCode}`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('portent un motif, jamais un champ vide', () => {
    // Savoir qu il est sorti six rouleaux n aide pas ; savoir qu ils sont
    // partis au verger de Boudou permet d appeler quelqu un.
    for (const s of STOCKS) {
      for (const m of s.mouvements) {
        expect(m.motif.trim(), `${s.produitId} a ${s.siteCode}, ${m.date}`).not.toBe('')
      }
    }
  })
})
