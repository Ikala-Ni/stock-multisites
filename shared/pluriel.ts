// LE PLURIEL DES UNITES.
//
// Ce fichier existe a cause d'un bug trouve au premier essai : l'API repondait
// "12 rouleaus". Le code faisait `unite + 's'`, ce qui marche pour palette,
// carton, lot et bobine, et rate exactement sur rouleau.
//
// La lecon vaut plus que la correction. La regle du pluriel etait ecrite a
// TROIS endroits - la route POST, le tableau et la fiche - donc corriger a un
// endroit aurait laisse "rouleaus" affiche ailleurs, et personne ne l'aurait vu
// avant qu'un utilisateur le signale. Une regle ecrite trois fois n'est pas
// trois fois plus sure, elle est trois fois plus fragile : elle diverge a la
// premiere correction. Elle vit donc ici, dans shared/, appelee par le serveur
// comme par la page.

/**
 * Le pluriel d'une unite de stock.
 *
 * Les mots en -au, -eau et -eu prennent un x. Le francais a des exceptions -
 * pneu, bleu, landau - et elles ne sont volontairement PAS traitees : aucune
 * n'est une unite de stock, et une liste d'exceptions qu'on ne peut pas
 * verifier donne une fausse impression d'exhaustivite. Le jour ou une unite en
 * fait partie, on l'ajoute ici, avec son cas de test.
 */
export function auPluriel(mot: string, nombre: number): string {
  if (nombre <= 1) return mot
  if (/(eau|au|eu)$/.test(mot)) return `${mot}x`
  if (/[sxz]$/.test(mot)) return mot // un colis, des colis
  return `${mot}s`
}

/** "12 rouleaux", "1 palette". Le nombre et son unite ne se separent jamais. */
export function quantiteEcrite(nombre: number, unite: string): string {
  return `${nombre} ${auPluriel(unite, nombre)}`
}
