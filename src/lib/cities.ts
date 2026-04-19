// Liste officielle des villes et villages de l'île Maurice
// Utilisée pour l'autocomplétion et la standardisation des noms de ville

export const VILLES_MAURICE: string[] = [
  // Grandes villes / centres urbains
  'Port-Louis',
  'Beau-Bassin',
  'Rose-Hill',
  'Quatre-Bornes',
  'Vacoas',
  'Phoenix',
  'Curepipe',
  'Ebène',
  // Nord
  'Grand-Baie',
  'Pereybere',
  'Calodyne',
  'Grand-Gaube',
  'Goodlands',
  'Triolet',
  'Rivière-du-Rempart',
  'Pamplemousses',
  'Terre-Rouge',
  'Pointe-aux-Canonniers',
  'Trou-aux-Biches',
  'Mon-Choisy',
  'Cap-Malheureux',
  'Petit-Raffray',
  'Mapou',
  // Est
  'Flacq',
  'Centre-de-Flacq',
  "Trou-d'Eau-Douce",
  'Bel-Air',
  'Rivière-Sèche',
  'Lalmatie',
  'Saint-Julien',
  'Poste-Lafayette',
  'Quatre-Cocos',
  // Sud-Est
  'Mahébourg',
  'Rivière-des-Anguilles',
  'Rose-Belle',
  'Nouvelle-France',
  'Plaine-Magnien',
  'Blue-Bay',
  'Pointe-d\'Esny',
  // Sud
  'Souillac',
  'Chemin-Grenier',
  'Bel-Ombre',
  'Baie-du-Cap',
  'Surinam',
  // Ouest
  'Black-River',
  'Rivière-Noire',
  'Tamarin',
  'Flic-en-Flac',
  'Albion',
  'Bambous',
  'Cascavelle',
  'La-Gaulette',
  'Le-Morne',
  'Chamarel',
  'Petite-Rivière',
  // Centre / Plaines-Wilhems
  'Moka',
  'Floréal',
  'Saint-Pierre',
  'Beau-Vallon',
  'Le-Hochet',
  'Verdun',
  'Réduit',
  'Palma',
  'Quartier-Militaire',
  'Sodnac',
  // Port-Louis et environs
  'Plaine-Verte',
  'Roche-Bois',
  'Pointe-aux-Sables',
  'Abercrombie',
  'Baie-du-Tombeau',
  'Pailles',
  'Arsenal',
  // Rodrigues
  'Port-Mathurin',
  'La-Ferme',
]

// Coordonnées GPS des principales villes de l'île Maurice
// Utilisées pour afficher la carte quand l'annonce n'a pas de coordonnées précises
export const COORDS_VILLES: Record<string, { lat: number; lng: number }> = {
  'Port-Louis':              { lat: -20.1619, lng: 57.4989 },
  'Beau-Bassin':             { lat: -20.2325, lng: 57.4766 },
  'Rose-Hill':               { lat: -20.2364, lng: 57.4641 },
  'Quatre-Bornes':           { lat: -20.2668, lng: 57.4799 },
  'Vacoas':                  { lat: -20.2977, lng: 57.4784 },
  'Phoenix':                 { lat: -20.2830, lng: 57.4960 },
  'Curepipe':                { lat: -20.3174, lng: 57.5259 },
  'Ebène':                   { lat: -20.2480, lng: 57.4875 },
  'Grand-Baie':              { lat: -20.0129, lng: 57.5841 },
  'Pereybere':               { lat: -19.9905, lng: 57.5952 },
  'Calodyne':                { lat: -19.9748, lng: 57.6162 },
  'Grand-Gaube':             { lat: -19.9563, lng: 57.6604 },
  'Goodlands':               { lat: -19.9837, lng: 57.6393 },
  'Triolet':                 { lat: -20.0525, lng: 57.5381 },
  'Rivière-du-Rempart':      { lat: -20.1017, lng: 57.6636 },
  'Pamplemousses':           { lat: -20.1006, lng: 57.5748 },
  'Terre-Rouge':             { lat: -20.1467, lng: 57.5359 },
  'Pointe-aux-Canonniers':   { lat: -19.9632, lng: 57.5836 },
  'Trou-aux-Biches':         { lat: -20.0314, lng: 57.5374 },
  'Mon-Choisy':              { lat: -20.0197, lng: 57.5558 },
  'Cap-Malheureux':          { lat: -19.9842, lng: 57.6110 },
  'Flacq':                   { lat: -20.2037, lng: 57.7149 },
  'Centre-de-Flacq':         { lat: -20.1941, lng: 57.7060 },
  "Trou-d'Eau-Douce":        { lat: -20.1997, lng: 57.7870 },
  'Mahébourg':               { lat: -20.4063, lng: 57.7042 },
  'Blue-Bay':                { lat: -20.4472, lng: 57.7194 },
  'Souillac':                { lat: -20.5202, lng: 57.5179 },
  'Black-River':             { lat: -20.3636, lng: 57.3686 },
  'Rivière-Noire':           { lat: -20.3636, lng: 57.3686 },
  'Tamarin':                 { lat: -20.3247, lng: 57.3736 },
  'Flic-en-Flac':            { lat: -20.2939, lng: 57.3636 },
  'Albion':                  { lat: -20.2156, lng: 57.3825 },
  'Moka':                    { lat: -20.2285, lng: 57.5443 },
  'Floréal':                 { lat: -20.2980, lng: 57.5049 },
  'Saint-Pierre':            { lat: -20.2956, lng: 57.5563 },
  'Beau-Vallon':             { lat: -20.2650, lng: 57.5700 },
  'Le-Hochet':               { lat: -20.1550, lng: 57.5480 },
  'Verdun':                  { lat: -20.2200, lng: 57.5550 },
  'Réduit':                  { lat: -20.2320, lng: 57.5020 },
  'Palma':                   { lat: -20.2750, lng: 57.5620 },
  'Quartier-Militaire':      { lat: -20.2500, lng: 57.5850 },
  'Sodnac':                  { lat: -20.2680, lng: 57.4820 },
  'Bel-Ombre':               { lat: -20.5018, lng: 57.4014 },
  'Le-Morne':                { lat: -20.4648, lng: 57.3204 },
  'Chamarel':                { lat: -20.4300, lng: 57.3681 },
  'La-Gaulette':             { lat: -20.4980, lng: 57.3500 },
  'Bambous':                 { lat: -20.2500, lng: 57.4200 },
  'Cascavelle':              { lat: -20.2800, lng: 57.4100 },
  'Petite-Rivière':          { lat: -20.3400, lng: 57.4600 },
  'Petit-Raffray':           { lat: -20.0500, lng: 57.6300 },
  'Mapou':                   { lat: -20.0800, lng: 57.6500 },
  'Bel-Air':                 { lat: -20.2200, lng: 57.7600 },
  'Rivière-Sèche':           { lat: -20.2950, lng: 57.6650 },
  'Lalmatie':                { lat: -20.2250, lng: 57.6900 },
  'Saint-Julien':            { lat: -20.2650, lng: 57.6400 },
  'Poste-Lafayette':         { lat: -20.1350, lng: 57.7750 },
  'Quatre-Cocos':            { lat: -20.2050, lng: 57.7700 },
  'Rivière-des-Anguilles':   { lat: -20.4750, lng: 57.5400 },
  'Rose-Belle':              { lat: -20.4050, lng: 57.6050 },
  'Nouvelle-France':         { lat: -20.3850, lng: 57.6200 },
  'Plaine-Magnien':          { lat: -20.4200, lng: 57.6900 },
  "Pointe-d'Esny":           { lat: -20.4550, lng: 57.7300 },
  'Chemin-Grenier':          { lat: -20.4650, lng: 57.4650 },
  'Baie-du-Cap':             { lat: -20.4980, lng: 57.3850 },
  'Surinam':                 { lat: -20.3700, lng: 57.5600 },
  'Plaine-Verte':            { lat: -20.1550, lng: 57.4980 },
  'Roche-Bois':              { lat: -20.1450, lng: 57.5100 },
  'Pointe-aux-Sables':       { lat: -20.1800, lng: 57.4500 },
  'Abercrombie':             { lat: -20.1700, lng: 57.4700 },
  'Baie-du-Tombeau':         { lat: -20.1050, lng: 57.4900 },
  'Pailles':                 { lat: -20.1950, lng: 57.5150 },
  'Arsenal':                 { lat: -20.1300, lng: 57.5600 },
  'Port-Mathurin':           { lat: -19.6795, lng: 63.4233 },
  'La-Ferme':                { lat: -19.7300, lng: 63.3900 },
}

// Retourne les coordonnées d'une ville par son nom (insensible à la casse et aux variantes)
export function getCoordsVille(ville: string | null | undefined): { lat: number; lng: number } | null {
  if (!ville) return null
  // Recherche exacte d'abord
  if (COORDS_VILLES[ville]) return COORDS_VILLES[ville]
  // Recherche normalisée (insensible accents/tirets/casse)
  const nv = normaliseVille(ville)
  const entry = Object.entries(COORDS_VILLES).find(([k]) => normaliseVille(k) === nv)
  return entry ? entry[1] : null
}

// Normalise une chaîne pour la comparaison : minuscules, sans accents, sans tirets/espaces
export function normaliseVille(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[-'\s]+/g, '')          // supprime tirets, apostrophes, espaces
}

// Retourne les villes correspondant à la saisie (max 6 suggestions)
export function suggererVilles(saisie: string, max = 6): string[] {
  if (saisie.trim().length < 2) return []
  const nq = normaliseVille(saisie)

  return VILLES_MAURICE.filter((ville) => {
    const nc = normaliseVille(ville)
    // Correspondance exacte par sous-chaîne
    if (nc.includes(nq)) return true
    // Correspondance par préfixe (tolère les fautes de frappe à partir du 4e caractère)
    const prefLen = Math.min(nq.length, 4)
    return nc.startsWith(nq.slice(0, prefLen))
  }).slice(0, max)
}
