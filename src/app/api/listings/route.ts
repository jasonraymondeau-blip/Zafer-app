import { NextRequest, NextResponse } from 'next/server'
import { getListings } from '@/lib/listings'

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  const data = await getListings({
    categorie:        sp.get('categorie')        || undefined,
    sous_categorie:   sp.get('sous_categorie')   || undefined,
    q:                sp.get('q')                || undefined,
    prix_min:         sp.get('prix_min')         ? Number(sp.get('prix_min'))    : undefined,
    prix_max:         sp.get('prix_max')         ? Number(sp.get('prix_max'))    : undefined,
    km_min:           sp.get('km_min')           ? Number(sp.get('km_min'))      : undefined,
    km_max:           sp.get('km_max')           ? Number(sp.get('km_max'))      : undefined,
    boite_vitesse:    sp.get('boite_vitesse')    || undefined,
    carburant:        sp.get('carburant')        || undefined,
    annee_min:        sp.get('annee_min')        ? Number(sp.get('annee_min'))  : undefined,
    annee_max:        sp.get('annee_max')        ? Number(sp.get('annee_max'))  : undefined,
    location_type:    sp.get('location_type')    || undefined,
    vehicule_type:    sp.get('vehicule_type')    || undefined,
    type_bien:        sp.get('type_bien')        || undefined,
    surface_min:      sp.get('surface_min')      ? Number(sp.get('surface_min')) : undefined,
    surface_max:      sp.get('surface_max')      ? Number(sp.get('surface_max')) : undefined,
    etat:                  sp.get('etat')                  || undefined,
    piece:                 sp.get('piece')                 || undefined,
    type_electromenager:   sp.get('type_electromenager')   || undefined,
    meuble:                sp.get('meuble')                || undefined,
    nb_chambres:           sp.get('nb_chambres')           || undefined,
    ville:                 sp.get('ville')                 || undefined,
    type_transaction:      sp.get('type_transaction')      || undefined,
    lat:                   sp.get('lat')                   ? Number(sp.get('lat'))  : undefined,
    lng:                   sp.get('lng')                   ? Number(sp.get('lng'))  : undefined,
    limit:            sp.get('limit')            ? Number(sp.get('limit'))       : 20,
    offset:           sp.get('offset')           ? Number(sp.get('offset'))      : 0,
  })

  return NextResponse.json(data)
}
