// Les regles metier : la jointure, l'etat d'une ligne, la selection, le
// catalogue, la quantite demandee.
//
// Les donnees de ce fichier sont fabriquees pour l'occasion, et c'est
// delibere : verifier le filtrage sur les dix-huit stocks de demonstration
// ferait echouer ces tests le jour ou quelqu'un ajoute une cagette. Un test doit
// echouer quand la REGLE se casse, jamais quand les donnees changent.

import { describe, expect, it } from 'vitest'
import {
  construireCatalogue,
  etatDe,
  filtrerLignes,
  idDeLigne,
  joindre,
  verifierQuantite,
  QUANTITE_MAX,
} from '~~/shared/regles'
import type { Produit, Site, Stock } from '~~/shared/types/stock'

const SITES: Site[] = [
  { code: 'AAA', nom: 'Site A', departement: '82' },
  { code: 'BBB', nom: 'Site B', departement: '47' },
]

function produit(partie: Partial<Produit> = {}): Produit {
  return {
    id: 'CAG',
    designation: 'Cagette bois',
    famille: 'emballage',
    visuel: 'cagette',
    description: 'La caisse en bois la plus courante.',
    unite: 'palette',
    dimensions: '30 x 40 cm',
    conditionnement: '160 par palette',
    fournisseur: 'FRN-0001',
    ...partie,
  }
}

function stock(partie: Partial<Stock> = {}): Stock {
  return {
    produitId: 'CAG',
    siteCode: 'AAA',
    quantite: 50,
    seuil: 10,
    mouvements: [],
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

describe('joindre', () => {
  const produits = [produit(), produit({ id: 'FIL', designation: 'Filet', famille: 'protection', visuel: 'filet' })]

  it('rattache chaque stock a son produit', () => {
    const [ligne] = joindre([stock()], produits, SITES)
    expect(ligne?.produit.designation).toBe('Cagette bois')
    expect(ligne?.id).toBe(idDeLigne('CAG', 'AAA'))
  })

  it('remplace le code du site par son nom', () => {
    expect(joindre([stock()], produits, SITES)[0]?.siteNom).toBe('Site A')
  })

  it('rend le code quand le site est introuvable, plutot que rien', () => {
    expect(joindre([stock({ siteCode: 'ZZZ' })], produits, SITES)[0]?.siteNom).toBe('ZZZ')
  })

  it('ECARTE un stock dont le produit n existe pas', () => {
    // Une ligne sans designation n est pas affichable, et l inventer serait pire
    // que de ne rien montrer. En base, la cle etrangere rendrait le cas
    // impossible ; ici rien ne l empeche, donc on le traite.
    expect(joindre([stock({ produitId: 'FANTOME' })], produits, SITES)).toHaveLength(0)
  })

  it('prend la date du mouvement le plus recent, sans supposer un ordre', () => {
    const desordre = stock({
      mouvements: [
        { date: '2026-08-01', sens: 'entree', quantite: 10, motif: 'Livraison' },
        { date: '2026-09-05', sens: 'sortie', quantite: 3, motif: 'Atelier' },
        { date: '2026-08-20', sens: 'sortie', quantite: 2, motif: 'Atelier' },
      ],
    })
    expect(joindre([desordre], produits, SITES)[0]?.dernierMouvement).toBe('2026-09-05')
  })

  it('rend les mouvements du plus recent au plus ancien', () => {
    const desordre = stock({
      mouvements: [
        { date: '2026-08-01', sens: 'entree', quantite: 10, motif: 'Livraison' },
        { date: '2026-09-05', sens: 'sortie', quantite: 3, motif: 'Atelier' },
      ],
    })
    const dates = joindre([desordre], produits, SITES)[0]?.mouvements.map((m) => m.date)
    expect(dates).toEqual(['2026-09-05', '2026-08-01'])
  })

  it('rend null quand le stock n a jamais bouge, pas une date inventee', () => {
    expect(joindre([stock({ mouvements: [] })], produits, SITES)[0]?.dernierMouvement).toBeNull()
  })
})

describe('filtrerLignes', () => {
  const produits = [
    produit({ id: 'CAG', designation: 'Cagette bois' }),
    produit({ id: 'ETI', designation: 'Etiquette adhesive' }),
    produit({ id: 'FIL', designation: 'Filet paragrele', famille: 'protection', visuel: 'filet' }),
  ]
  const stocks = [
    stock({ produitId: 'CAG', quantite: 50, seuil: 10 }),
    stock({ produitId: 'ETI', quantite: 3, seuil: 10 }),
    stock({ produitId: 'FIL', siteCode: 'BBB', quantite: 0, seuil: 5 }),
  ]
  const lignes = joindre(stocks, produits, SITES)

  it('rend tout quand aucun filtre n est pose', () => {
    expect(filtrerLignes(lignes)).toHaveLength(3)
  })

  it('filtre par site et par famille', () => {
    expect(filtrerLignes(lignes, { site: 'BBB' })).toHaveLength(1)
    expect(filtrerLignes(lignes, { famille: 'protection' })).toHaveLength(1)
  })

  it('cherche sans tenir compte des accents ni de la casse', () => {
    expect(filtrerLignes(lignes, { recherche: 'ETIQUETTE' })).toHaveLength(1)
    expect(filtrerLignes(lignes, { recherche: 'étiquette' })).toHaveLength(1)
  })

  it('ecarte le stock suffisant quand on ne veut que ce qui est a commander', () => {
    const retenues = filtrerLignes(lignes, { aCommanderSeulement: true })
    expect(retenues.map((l) => l.produit.id)).toEqual(['FIL', 'ETI'])
  })

  it('met le plus urgent en premier, puis classe par designation', () => {
    // C est la seule question que se pose quelqu un qui ouvre l ecran le matin :
    // qu est-ce qui manque. La rupture passe donc avant tout le reste.
    expect(filtrerLignes(lignes).map((l) => l.etat)).toEqual(['rupture', 'a-commander', 'suffisant'])
  })

  it('ne modifie pas les lignes qu on lui donne', () => {
    const copie = structuredClone(lignes)
    filtrerLignes(lignes, { aCommanderSeulement: true })
    expect(lignes).toEqual(copie)
  })
})

describe('construireCatalogue', () => {
  const produits = [
    produit({ id: 'CAG', designation: 'Cagette bois' }),
    produit({ id: 'FIL', designation: 'Filet paragrele', famille: 'protection', visuel: 'filet' }),
    produit({ id: 'ORP', designation: 'Anneau orphelin' }),
  ]
  const stocks = [
    stock({ produitId: 'CAG', siteCode: 'AAA', quantite: 50, seuil: 10 }),
    stock({ produitId: 'CAG', siteCode: 'BBB', quantite: 4, seuil: 10 }),
    stock({ produitId: 'FIL', siteCode: 'AAA', quantite: 0, seuil: 5 }),
  ]

  it('rend un produit une seule fois, meme detenu par plusieurs sites', () => {
    const fiches = construireCatalogue(produits, stocks, SITES)
    expect(fiches.filter((f) => f.produit.id === 'CAG')).toHaveLength(1)
  })

  it('additionne le stock de tous les sites', () => {
    const cagette = construireCatalogue(produits, stocks, SITES).find((f) => f.produit.id === 'CAG')
    expect(cagette?.stockTotal).toBe(54)
    expect(cagette?.presences).toHaveLength(2)
  })

  it('retient le pire etat rencontre, pas la moyenne', () => {
    // 50 sur un site et 4 sur l autre : le total va bien, un site va mal. C est
    // le site qui va mal qu il faut signaler.
    const cagette = construireCatalogue(produits, stocks, SITES).find((f) => f.produit.id === 'CAG')
    expect(cagette?.etatLePlusCritique).toBe('a-commander')
  })

  it('garde un produit que PERSONNE ne detient, en rupture', () => {
    // Le catalogue sert a decouvrir ce qui existe. Masquer un produit absent de
    // tous les sites ferait croire qu il n existe pas, alors qu il reste
    // commandable.
    const orphelin = construireCatalogue(produits, stocks, SITES).find((f) => f.produit.id === 'ORP')
    expect(orphelin).toBeDefined()
    expect(orphelin?.stockTotal).toBe(0)
    expect(orphelin?.presences).toHaveLength(0)
    expect(orphelin?.etatLePlusCritique).toBe('rupture')
  })

  it('classe par designation et non par urgence', () => {
    // Ici on cherche un produit qu on a en tete, on ne surveille pas un stock :
    // un tri par urgence deplacerait les cartes d un jour a l autre.
    expect(construireCatalogue(produits, stocks, SITES).map((f) => f.produit.designation)).toEqual([
      'Anneau orphelin',
      'Cagette bois',
      'Filet paragrele',
    ])
  })

  it('met le site le plus critique en premier dans la repartition', () => {
    const cagette = construireCatalogue(produits, stocks, SITES).find((f) => f.produit.id === 'CAG')
    expect(cagette?.presences[0]?.siteNom).toBe('Site B')
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
