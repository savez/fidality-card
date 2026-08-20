// Novità raccontate all'utente nel modale "Novità": una voce per ogni versione
// che vale la pena annunciare, dalla più recente. Le patch senza impatto
// visibile non si elencano — in quel caso il modale non compare e si aggiorna
// solo il flag di "ultima versione vista".
//
// Come si scrive una voce:
// - nella stessa PR della feature, con il numero di versione che release-please
//   assegnerà. Finché il bump non esce, package.json resta alla versione vecchia
//   e la voce non è visibile a nessuno: si "arma" da sola con la release.
// - al presente, in seconda persona, dal lato di chi usa l'app. Mai nomi di
//   componenti, di file o di commit.
// - `icon` è opzionale (set mdi): mettila solo se aiuta a riconoscere la
//   funzione a colpo d'occhio.

export const releaseNotes = [
  {
    version: '2.10.0',
    title: 'La carta giusta appena entri in negozio',
    highlights: [
      {
        text: 'Attiva "Apri la carta del posto dove sei" nelle impostazioni: all\'avvio dell\'app, se sei in un negozio di cui hai la carta, te la propone.',
        icon: 'mdi-map-marker-radius',
      },
      {
        text: 'Confermi una volta e nei posti che conosci la carta si apre da sola, senza chiederti niente.',
        icon: 'mdi-map-marker-check',
      },
      {
        text: 'A casa o in ufficio puoi dire "non chiedere qui" e non ti disturba più. Tutto resta sul telefono.',
        icon: 'mdi-map-marker-off',
      },
    ],
  },
  {
    version: '2.9.0',
    title: 'Scopri cosa cambia a ogni aggiornamento',
    highlights: [
      {
        text: "Dopo ogni aggiornamento l'app ti racconta una volta sola cosa c'è di nuovo.",
        icon: 'mdi-party-popper',
      },
      {
        text: 'Tocca il numero di versione in alto a destra per rileggere le novità quando vuoi.',
        icon: 'mdi-gesture-tap',
      },
    ],
  },
  {
    version: '2.8.0',
    title: 'Le tue carte a un tocco dalla home',
    highlights: [
      {
        text: "Aggiungi in home un'icona che apre subito la carta che usi più spesso: cambia da sola quando cambiano le tue abitudini.",
        icon: 'mdi-trophy',
      },
      {
        text: 'Preferisci decidere tu? Scegli una carta fissa e tienila sempre a portata di icona.',
        icon: 'mdi-pin',
      },
    ],
  },
  {
    version: '2.7.0',
    title: 'Tieni il conto di quanto resta',
    highlights: [
      {
        text: 'Segna il saldo di una carta prepagata e registra le spese man mano che la usi.',
        icon: 'mdi-wallet',
      },
      {
        text: 'La lista mostra quanto resta e segnala le carte esaurite, così filtri in un tocco.',
        icon: 'mdi-filter-variant',
      },
    ],
  },
]
