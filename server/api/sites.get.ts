// GET /api/sites
//
// La liste des sites, pour remplir le menu du filtre. Elle est servie par
// l'API et non ecrite en dur dans la page : le jour ou un site ouvre, il
// apparait dans le menu sans qu'on touche au front.
import { lireDonnees } from '~~/server/depot'

export default defineEventHandler(async () => (await lireDonnees()).sites)
