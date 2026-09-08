// Le pluriel des unites.
//
// Ce fichier de test existe a cause d'un vrai bug : l'API a repondu
// "12 rouleaus" au premier essai. Chaque cas ci-dessous est un cas rencontre ou
// redoute, pas un exercice - c'est la difference entre une suite de tests qui
// protege et une suite qui fait joli dans un depot.

import { describe, expect, it } from 'vitest'
import { auPluriel, quantiteEcrite } from '~~/shared/pluriel'

describe('auPluriel', () => {
  it('ne met pas au pluriel en dessous de deux', () => {
    expect(auPluriel('palette', 1)).toBe('palette')
    expect(auPluriel('palette', 0)).toBe('palette')
  })

  it('ajoute un s au cas ordinaire', () => {
    expect(auPluriel('palette', 3)).toBe('palettes')
    expect(auPluriel('carton', 12)).toBe('cartons')
    expect(auPluriel('lot', 2)).toBe('lots')
    expect(auPluriel('bobine', 40)).toBe('bobines')
  })

  it('ajoute un x aux mots en -eau, et c est LE bug d origine', () => {
    expect(auPluriel('rouleau', 12)).toBe('rouleaux')
    expect(auPluriel('rouleau', 12)).not.toBe('rouleaus')
  })

  it('ne double pas la marque du pluriel sur un mot deja en s, x ou z', () => {
    expect(auPluriel('colis', 4)).toBe('colis')
  })
})

describe('quantiteEcrite', () => {
  it('ne separe jamais le nombre de son unite', () => {
    expect(quantiteEcrite(12, 'rouleau')).toBe('12 rouleaux')
    expect(quantiteEcrite(1, 'palette')).toBe('1 palette')
  })
})
