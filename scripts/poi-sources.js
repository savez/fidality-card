// Selettori OpenStreetMap per brand. Solo build-time: questo file non finisce
// nel bundle.
//
// `match` è una regex Overpass, case-insensitive, applicata ai tag `brand` e
// `operator`. È volutamente ancorata: senza ancore "Coop" pesca ogni
// "Cooperativa" d'Italia e "Manga" ogni fumetteria.
//
// `nameIn` elenca coppie tag=valore su cui cercare anche per `name`, per i
// negozi mappati senza il tag `brand`. Vanno tenute strette e poche: la regex
// su `name` è veloce solo se il filtro che la precede è selettivo (`shop=sports`
// sì, `amenity` no — quello manda la query in timeout sull'Italia intera).
//
// `skip` marca i brand per cui un catalogo di punti vendita non ha senso: le
// carte degli operatori ferroviari si usano a bordo o in stazione, non "in un
// negozio". Per loro resta l'apprendimento dai log (livello 3).
export const POI_SOURCES = {
  esselunga: { match: '^Esselunga', nameIn: ['shop=supermarket'] },
  conad: { match: '^(Conad|Spesa Facile)', nameIn: ['shop=supermarket', 'shop=convenience'] },
  coop: {
    match: '^(Coop($| )|Ipercoop|Coop Alleanza|Coop Lombardia)',
    nameIn: ['shop=supermarket', 'shop=convenience'],
  },
  pam: { match: '^Pam($| )', nameIn: ['shop=supermarket'] },
  lidl: { match: '^Lidl', nameIn: ['shop=supermarket'] },
  eurospin: { match: '^Eurospin', nameIn: ['shop=supermarket'] },
  iperal: { match: '^Iperal', nameIn: ['shop=supermarket'] },
  carrefour: { match: '^Carrefour', nameIn: ['shop=supermarket', 'shop=convenience'] },
  ikea: { match: '^IKEA', nameIn: ['shop=furniture'] },
  decathlon: { match: '^Decathlon', nameIn: ['shop=sports'] },
  sportspecialist: { match: '^Sport ?Specialist', nameIn: ['shop=sports'] },
  manga: { match: '^Manga($| )', nameIn: ['shop=sports'] },
  mediaworld: { match: '^Media ?World', nameIn: ['shop=electronics'] },
  unieuro: { match: '^Unieuro', nameIn: ['shop=electronics'] },
  trony: { match: '^Trony', nameIn: ['shop=electronics'] },
  obi: { match: '^OBI($| )', nameIn: ['shop=doityourself'] },
  leroy_merlin: { match: '^Leroy Merlin', nameIn: ['shop=doityourself'] },
  mondadori: { match: '^Mondadori', nameIn: ['shop=books'] },
  feltrinelli: { match: '^(La )?Feltrinelli', nameIn: ['shop=books'] },
  q8: { match: '^Q8($| )', nameIn: ['amenity=fuel'] },
  eni: { match: '^(Eni($| )|Agip($| ))', nameIn: ['amenity=fuel'] },
  trenitalia: { skip: 'carta di un operatore ferroviario: nessun punto vendita da mappare' },
  italo: { skip: 'carta di un operatore ferroviario: nessun punto vendita da mappare' },
  rinascente: { match: '^(La )?Rinascente', nameIn: ['shop=department_store'] },
  cienne: { match: '^Cienne', nameIn: ['shop=clothes'] },
  barberinos: { match: '^Barberino', nameIn: ['shop=hairdresser'] },
  agribrianza: { match: '^Agribrianza', nameIn: ['shop=garden_centre'] },
  // Niente scialuppa su `name`: amenity=restaurant/fast_food conta centinaia di
  // migliaia di oggetti in Italia e la regex va in timeout. Il tag `brand` su
  // Autogrill è ben popolato, basta quello.
  autogrill: { match: '^Autogrill' },
  cisalfa: { match: '^Cisalfa', nameIn: ['shop=sports'] },
  sephora: { match: '^Sephora', nameIn: ['shop=cosmetics', 'shop=perfumery'] },
  stroili: { match: '^Stroili', nameIn: ['shop=jewelry'] },
}
