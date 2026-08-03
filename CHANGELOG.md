# Changelog

## [2.7.1](https://github.com/savez/fidality-card/compare/v2.7.0...v2.7.1) (2026-08-03)


### 📝 Documentation

* AGENTS.md con regole di sviluppo (locale, no-tracking, PWA, KISS/YAGNI, workflow landing+LinkedIn) ([2393fa6](https://github.com/savez/fidality-card/commit/2393fa6d04b6540dea54ac377d23ec1f80ef2b4b))
* AGENTS.md main solo per il codice + regola 'landing mai su main' ([094ab53](https://github.com/savez/fidality-card/commit/094ab5323179a7947b8f176956df673fb4087b86))

## [2.7.0](https://github.com/savez/fidality-card/compare/v2.6.0...v2.7.0) (2026-08-03)


### ✨ Features

* **balance:** helper cents/formato/predicati saldo ([5d5a718](https://github.com/savez/fidality-card/commit/5d5a7189223824deb8c28766b20ea97faa02da47))
* **cards:** chip di filtro per stato saldo ([b1bc284](https://github.com/savez/fidality-card/commit/b1bc284f302138632b48805070e519f5bd1825ae))
* **db:** persistenza balanceCents con rimozione chiave su null ([a8b6f02](https://github.com/savez/fidality-card/commit/a8b6f0264ddbac705ec33d2bcd287921fec347f6))
* **detail:** saldo in evidenza e Registra spesa (MVP) ([e5bb50c](https://github.com/savez/fidality-card/commit/e5bb50c698f675a54c8980a4cc2c1b255aa1d4d2))
* **edit:** switch e campo per il saldo della card ([707607d](https://github.com/savez/fidality-card/commit/707607d009b6b765b5151ce2d40e40cca72895d7))
* **store:** filtro card per stato saldo ([1d2bb67](https://github.com/savez/fidality-card/commit/1d2bb676b33151d1278bcebc1aaf01dcc3d04eff))
* **tile:** pill saldo, barra di consumo e badge esaurita ([591f4ba](https://github.com/savez/fidality-card/commit/591f4ba8170b18d6b7aa468b065ca97b5db82793))

## [2.6.0](https://github.com/savez/fidality-card/compare/v2.5.0...v2.6.0) (2026-07-30)


### ✨ Features

* pagina Statistiche (podio carta più usata) + storico GPS nella nav ([#44](https://github.com/savez/fidality-card/issues/44)) ([0905ebb](https://github.com/savez/fidality-card/commit/0905ebbd3a9c7316e49ad973db23e34f2e48a3e9))

## [2.5.0](https://github.com/savez/fidality-card/compare/v2.4.0...v2.5.0) (2026-07-29)


### ✨ Features

* **support:** aggiungi badge 'Offrimi una birra' (Buy Me a Coffee) ([#41](https://github.com/savez/fidality-card/issues/41)) ([0e0cc50](https://github.com/savez/fidality-card/commit/0e0cc50865c166d08d6f05d3533b6b62e311f8d9))

## [2.4.0](https://github.com/savez/fidality-card/compare/v2.3.0...v2.4.0) (2026-07-26)


### ✨ Features

* **logs:** storico posizioni GPS in Impostazioni ([#39](https://github.com/savez/fidality-card/issues/39)) ([33c7de7](https://github.com/savez/fidality-card/commit/33c7de7c2d36fffdcc15f5da386bee129a15d9aa))

## [2.3.0](https://github.com/savez/fidality-card/compare/v2.2.0...v2.3.0) (2026-07-25)


### ✨ Features

* **pwa:** aggiungi componente banner installazione PWA ([cc004c0](https://github.com/savez/fidality-card/commit/cc004c03c98f80bdd63e21b2fdf81d23a17f541c))
* **pwa:** aggiungi composable per eleggibilità popup installazione ([71413ed](https://github.com/savez/fidality-card/commit/71413ed4d01d957fcf78ed364167d870497cafea))
* **pwa:** integra il banner di installazione nell'app ([c0856db](https://github.com/savez/fidality-card/commit/c0856dbedf748a643e14b20f18a4f30223aa2583))


### 🐛 Bug Fixes

* **test:** escludi .claude/ dalla raccolta test di vitest ([6699ffb](https://github.com/savez/fidality-card/commit/6699ffb539d92a95edaf2844f846c19e5e7fcf39))

## [2.2.0](https://github.com/savez/fidality-card/compare/v2.1.0...v2.2.0) (2026-07-09)


### ✨ Features

* **logs:** tracciamento aperture card con log GPS opzionale ([#35](https://github.com/savez/fidality-card/issues/35)) ([8f5b665](https://github.com/savez/fidality-card/commit/8f5b66514aeb787dae949180d4f7c2463866837b))

## [2.1.0](https://github.com/savez/fidality-card/compare/v2.0.0...v2.1.0) (2026-07-09)


### ✨ Features

* **ui:** aggiungi credito GitHub nel modale versione ([#33](https://github.com/savez/fidality-card/issues/33)) ([7e2bd39](https://github.com/savez/fidality-card/commit/7e2bd391f9e12074e700d4ea7babf6bfb2d555fb))

## [2.0.0](https://github.com/savez/fidality-card/compare/v1.6.3...v2.0.0) (2026-06-22)


### ✨ Features

* **ui:** app bar pulita e bottom-nav con azione Nuova in risalto ([98f2cdb](https://github.com/savez/fidality-card/commit/98f2cdb4d2ae9df2e8a8f0535d78268bd9cba194))
* **ui:** dettaglio ridisegnato + barcode a tutto schermo ([df075b3](https://github.com/savez/fidality-card/commit/df075b33cdfcbf31717ff88275c2df5b730f4bca))
* **ui:** restyle frontend - direzione Pocket (v2.0.0) ([fcccfd5](https://github.com/savez/fidality-card/commit/fcccfd5600465fc8996bf9d41b5533fe2644e37c))
* **ui:** tema Pocket - palette indaco, tipografia, token ([2b22cf2](https://github.com/savez/fidality-card/commit/2b22cf24eff01e7dcef13c612240edf5573551bf))
* **ui:** tessere e home ridisegnate ([aa8ebb6](https://github.com/savez/fidality-card/commit/aa8ebb6f2c96e3330470b6d453c784750cab214e))


### 🐛 Bug Fixes

* **ui:** "Nuova" come FAB centrale rialzato ([b1ad566](https://github.com/savez/fidality-card/commit/b1ad566f8b569b6b8974526dfd1e480adb78ce39))


### 📝 Documentation

* streamline README ([#30](https://github.com/savez/fidality-card/issues/30)) ([c7e0ebf](https://github.com/savez/fidality-card/commit/c7e0ebf70be758344b915155c45e42be1b0806e7))
* update README with recent features ([#28](https://github.com/savez/fidality-card/issues/28)) ([ba4c26b](https://github.com/savez/fidality-card/commit/ba4c26b1b24a0a86e140e7c42ef9fe9757cb22d2))

## [1.6.3](https://github.com/savez/fidality-card/compare/v1.6.2...v1.6.3) (2026-06-22)


### 🐛 Bug Fixes

* **share:** condivisione come text/plain, fallback download, tasto solo dove supportato ([#26](https://github.com/savez/fidality-card/issues/26)) ([039c2fa](https://github.com/savez/fidality-card/commit/039c2fab1e168af265a0c352c52169954e8bdda1))

## [1.6.2](https://github.com/savez/fidality-card/compare/v1.6.1...v1.6.2) (2026-06-22)


### 🐛 Bug Fixes

* **cards:** il clear della ricerca non svuota più la lista ([b1a2c8a](https://github.com/savez/fidality-card/commit/b1a2c8a69f158050f474c01d0e8725698f3da64f))
* **cards:** la freccia indietro dal dettaglio torna alla lista in un click ([8fde885](https://github.com/savez/fidality-card/commit/8fde885169543dfa8da6173131fc0e095a6c40f7))
* **pwa:** aggiornamento automatico del service worker ([5d73eb7](https://github.com/savez/fidality-card/commit/5d73eb7f246a104fa2f6aa83ae9f5c11ad255ff6))
* tema, ricerca, indietro dettaglio e auto-update PWA ([626239b](https://github.com/savez/fidality-card/commit/626239b00735039689ea705529107f70f6e13839))
* **theme:** applica il tema salvato all'avvio dell'app ([58505d0](https://github.com/savez/fidality-card/commit/58505d06046805c74eb9ffd393a66c0fe42b1e78))

## [1.6.1](https://github.com/savez/fidality-card/compare/v1.6.0...v1.6.1) (2026-06-22)


### 🐛 Bug Fixes

* **share:** chiama navigator.share durante la user activation ([#21](https://github.com/savez/fidality-card/issues/21)) ([04bb71f](https://github.com/savez/fidality-card/commit/04bb71f8f585c9856386fe215fc92ef633ab9d1c))

## [1.6.0](https://github.com/savez/fidality-card/compare/v1.5.0...v1.6.0) (2026-06-22)


### ✨ Features

* **share:** condividi l'intero vault via Web Share API ([#19](https://github.com/savez/fidality-card/issues/19)) ([d57b1a1](https://github.com/savez/fidality-card/commit/d57b1a1ebb864a8a4d5db876d289fdf51ddd3bc0))

## [1.5.0](https://github.com/savez/fidality-card/compare/v1.4.0...v1.5.0) (2026-06-22)


### ✨ Features

* **brands:** aggiungi nuovi brand con icone dedicate ([fdb4cce](https://github.com/savez/fidality-card/commit/fdb4ccec316cc73c3d0cd7a3b5a51fc3cc259fd1))
* **scan:** migliora lettura barcode densi e deduci il tipo automaticamente ([0e4f757](https://github.com/savez/fidality-card/commit/0e4f757c10955246f86a577c2ead648c870f5d6b))
* scanner barcode densi, tipo auto-dedotto e nuovi brand ([c23e917](https://github.com/savez/fidality-card/commit/c23e9179423222427fde4eefbb1a1df073b8e73d))

## [1.4.0](https://github.com/savez/fidality-card/compare/v1.3.1...v1.4.0) (2026-06-19)


### ✨ Features

* **ui:** impostazioni solo nel footer e tema nelle impostazioni ([#14](https://github.com/savez/fidality-card/issues/14)) ([1543d96](https://github.com/savez/fidality-card/commit/1543d9642d70db5ce70cce6a7bd778bcaffcb4e4))

## [1.3.1](https://github.com/savez/fidality-card/compare/v1.3.0...v1.3.1) (2026-06-16)


### 📝 Documentation

* **landing:** add Website badge and clarify Pages vs Render ([#11](https://github.com/savez/fidality-card/issues/11)) ([323fed6](https://github.com/savez/fidality-card/commit/323fed612f08e15687f738f5409b18b905ebd305))

## [1.3.0](https://github.com/savez/fidality-card/compare/v1.2.0...v1.3.0) (2026-06-16)


### ✨ Features

* pin cards + alphabetical sort + simplified home + SECURITY.md ([#9](https://github.com/savez/fidality-card/issues/9)) ([417b4d2](https://github.com/savez/fidality-card/commit/417b4d2e65a911edd5de624fba82488688edb263))

## [1.2.0](https://github.com/savez/fidality-card/compare/v1.1.0...v1.2.0) (2026-06-15)


### ✨ Features

* **ui:** app bar version pill with dialog + tabbed icon picker ([#7](https://github.com/savez/fidality-card/issues/7)) ([13c275e](https://github.com/savez/fidality-card/commit/13c275e363015923c1176135bbb55714692f7520))

## [1.1.0](https://github.com/savez/fidality-card/compare/v1.0.0...v1.1.0) (2026-06-15)


### ✨ Features

* **brands:** add SportSpecialist and Manga (arrampicata) ([2ae4ad7](https://github.com/savez/fidality-card/commit/2ae4ad7070ad24e1e7a48948d607a704fc321ab9))
* **cards:** add Iperal to brand library, extend search to brand name ([acd15f8](https://github.com/savez/fidality-card/commit/acd15f8503de79877fbece8bdc2d9e786b33e4f0))
* v1.0 polish — live demo, badges, brand catalog expansion ([30eff67](https://github.com/savez/fidality-card/commit/30eff67fcccf84602cf6bbf672c3d57592e00adb))


### 🐛 Bug Fixes

* **cards:** white background and bigger barcode for checkout scanning ([#4](https://github.com/savez/fidality-card/issues/4)) ([b36793f](https://github.com/savez/fidality-card/commit/b36793f4c66e78db5c703f9620182d7da569ae28))


### 📝 Documentation

* add live demo link and richer status badges ([46813fb](https://github.com/savez/fidality-card/commit/46813fbfbf639afd76a49379694a46ce71e54d6e))
* **readme:** add hero banner image at top of README ([8a61bd6](https://github.com/savez/fidality-card/commit/8a61bd64fc3ce6dcc7564f023d9526d1839b4c6e))
* **release:** expand README with comprehensive release-please flow explanation ([a99ea94](https://github.com/savez/fidality-card/commit/a99ea94bdf8d811580037c786356ce38585ea6d1))
