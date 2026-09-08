// POST /api/reappro
//
// La demande de reapprovisionnement. Elle n'enregistre rien de durable : ce
// projet est une demonstration, et une base de donnees ne changerait pas ce
// qu'il montre. En revanche elle VALIDE, et c'est le point interessant.
//
// POURQUOI VALIDER COTE SERVEUR ALORS QUE LE FORMULAIRE VALIDE DEJA.
//
// Le formulaire de la page empeche d'envoyer une quantite negative. Cette
// verification est utile : elle previent la personne tout de suite, sans
// aller-retour. Mais elle ne PROTEGE rien, parce qu'elle s'execute dans le
// navigateur, et que tout ce qui s'execute dans le navigateur peut etre
// contourne. La seule verification qui protege est celle qui tourne ici.
//
// Les deux ne font donc pas le meme travail : celle du formulaire sert au
// confort, celle-ci sert de regle. Les ecrire toutes les deux n'est pas une
// repetition.

import { REFERENCES, SITES } from '~~/server/donnees/references'
import { quantiteEcrite } from '~~/shared/pluriel'
import type { DemandeReappro, ReponseReappro } from '~~/shared/types/stock'

const QUANTITE_MAX = 500

export default defineEventHandler(async (event): Promise<ReponseReappro> => {
  // readBody rend ce que le navigateur a envoye. On ne lui fait pas confiance :
  // le type annonce ce qu'on ESPERE recevoir, il ne garantit pas ce qui arrive.
  // TypeScript verifie le code, pas le reseau.
  const corps = await readBody<Partial<DemandeReappro>>(event)

  const reference = REFERENCES.find((r) => r.id === corps?.referenceId)
  if (!reference) {
    // 404 et non 400 : la demande est bien formee, c'est la reference qui
    // n'existe pas. Le code de statut fait partie de la reponse, il n'est pas
    // decoratif : c'est ce qui permet a un autre programme de comprendre sans
    // lire le message francais.
    throw createError({ statusCode: 404, statusMessage: 'Reference inconnue' })
  }

  const quantite = Number(corps?.quantite)
  if (!Number.isInteger(quantite) || quantite <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La quantite doit etre un nombre entier superieur a zero.',
    })
  }
  if (quantite > QUANTITE_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: `La quantite demandee depasse le maximum de ${quantiteEcrite(QUANTITE_MAX, reference.unite)}.`,
    })
  }

  const nomDuSite = SITES.find((s) => s.code === reference.siteCode)?.nom ?? reference.siteCode

  const numero = `RA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${reference.id}`

  return {
    accepte: true,
    numero,
    // Le NOM du site, pas son code : "site de MOI" est lisible par la DSI et par
    // personne d'autre. Un message rendu a l'utilisateur parle sa langue.
    message: `Demande enregistree pour ${quantiteEcrite(quantite, reference.unite)} de ${reference.designation}, site de ${nomDuSite}.`,
  }
})
