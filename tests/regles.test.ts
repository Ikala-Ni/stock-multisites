// Les regles metier : l'etat d'une ligne, la selection, la quantite demandee.
//
// Les donnees de ce fichier sont fabriquees pour l'occasion, et c'est
// deliberé : verifier le filtrage sur les dix-huit references de demonstration
// ferait echouer ces tests le jour ou quelqu'un ajoute une cagette. Un test doit
// echouer quand la REGLE se casse, jamais quand les donnees changent.

import { describe, expect, it } from 'vitest'
import { etatDe, filtrerReferences, verifierQuantite, QUANTITE_MAX } from '~~/shared/regles'
import type { Reference, Site } from '~~/shared/types/stock'

const SITES: Site[] = [
  { code: 'AAA', nom: 'Site A', departement: '82' },
  { code: 'BBB', nom: 'Site B', departement: '47' },
]

function reference(partie: Partial<Reference> = {}): Reference {
  return {
    id: 'AAA-TEST',
    designation: 'Cagette bois',
    famille: 'emballage',
    unite: 'palette',
    siteCode: 'AAA',
    quantite: 50,
    seuil: 10,
    dernierMouvement: '2026-09-01',
    ...partie,
  }
}

describe('etatDe', () => {
  it('appelle rupture des que le stock est vide', () => {
    expect(etatDe(0, 10)).toBe('rupture')
  })

  it('appelle a-commander AU seuil, et pas seulement en dessous', () => {
    // La regle voulue : au seuil exactement, on commande deja. Attendre d etre
    // en dessous, c est attendre d etre en retard.
    expect(etatDe(10, 10)).toBe('a-commander')
    expect(etatDe(9, 10)).toBe('a-commander')
  })

  it('appelle suffisant au-dessus du seuil', () => {
    expect(etatDe(11, 10)).toBe('suffisant')
  })

  it('tient meme si le seuil est zero', () => {
    expect(etatDe(0, 0)).toBe('rupture')
    expect(etatDe(1, 0)).toBe('suffisant')
  })
})

describe('filtrerReferences', () => {
  const donnees = [
    reference({ id: 'A1', designation: 'Cagette bois', quantite: 50, seuil: 10 }),
    reference({ id: 'A2', designation: 'Etiquette adhesive', quantite: 3, seuil: 10 }),
    reference({ id: 'B1', designation: 'Filet paragrele', siteCode: 'BBB', famille: 'protection', quantite: 0, seuil: 5 }),
  ]

  it('rend tout quand aucun filtre n est pose', () => {
    expect(filtrerReferences(donnees, SITES)).toHaveLength(3)
  })

  it('remplace le code du site par son nom', () => {
    const [premiere] = filtrerReferences(donnees, SITES, { site: 'AAA' })
    expect(premiere?.siteNom).toBe('Site A')
  })

  it('rend le code quand le site est introuvable, plutot que rien', () => {
    const orpheline = [reference({ siteCode: 'ZZZ' })]
    expect(filtrerReferences(orpheline, SITES)[0]?.siteNom).toBe('ZZZ')
  })

  it('filtre par site et par famille', () => {
    expect(filtrerReferences(donnees, SITES, { site: 'BBB' })).toHaveLength(1)
    expect(filtrerReferences(donnees, SITES, { famille: 'protection' })).toHaveLength(1)
  })

  it('cherche sans tenir compte des accents ni de la casse', () => {
    expect(filtrerReferences(donnees, SITES, { recherche: 'ETIQUETTE' })).toHaveLength(1)
    expect(filtrerReferences(donnees, SITES, { recherche: 'étiquette' })).toHaveLength(1)
  })

  it('ecarte le stock suffisant quand on ne veut que ce qui est a commander', () => {
    const retenues = filtrerReferences(donnees, SITES, { aCommanderSeulement: true })
    expect(retenues.map((r) => r.id)).toEqual(['B1', 'A2'])
  })

  it('met le plus urgent en premier, puis classe par designation', () => {
    // C est la seule question que se pose quelqu un qui ouvre l ecran le matin :
    // qu est-ce qui manque. La rupture passe donc avant tout le reste.
    expect(filtrerReferences(donnees, SITES).map((r) => r.etat)).toEqual([
      'rupture',
      'a-commander',
      'suffisant',
    ])
  })

  it('ne modifie pas les donnees qu on lui donne', () => {
    const original = [reference()]
    const copie = structuredClone(original)
    filtrerReferences(original, SITES, { aCommanderSeulement: true })
    expect(original).toEqual(copie)
  })
})

describe('verifierQuantite', () => {
  it('accepte une quantite normale', () => {
    expect(verifierQuantite(12, 'palettes')).toBeNull()
  })

  it('refuse zero, le negatif et le decimal', () => {
    expect(verifierQuantite(0, 'palettes')?.statut).toBe(400)
    expect(verifierQuantite(-3, 'palettes')?.statut).toBe(400)
    expect(verifierQuantite(2.5, 'palettes')?.statut).toBe(400)
  })

  it('refuse ce qui n est pas un nombre, y compris le vide', () => {
    // Le corps d une requete vient du reseau : le type annonce ce qu on espere
    // recevoir, il ne garantit pas ce qui arrive.
    expect(verifierQuantite('douze', 'palettes')?.statut).toBe(400)
    expect(verifierQuantite(undefined, 'palettes')?.statut).toBe(400)
    expect(verifierQuantite(null, 'palettes')?.statut).toBe(400)
  })

  it('accepte le maximum et refuse ce qui le depasse', () => {
    expect(verifierQuantite(QUANTITE_MAX, 'palettes')).toBeNull()
    expect(verifierQuantite(QUANTITE_MAX + 1, 'palettes')?.statut).toBe(400)
  })

  it('nomme l unite au pluriel dans le refus', () => {
    expect(verifierQuantite(999, 'rouleaux')?.raison).toContain('rouleaux')
  })
})
