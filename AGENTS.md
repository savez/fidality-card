<!-- pane-agent-context:start -->

## Pane

The developer is using Pane for this repository. Pane can manage saved repositories and create user-visible panes with terminal-backed tools for planning, discussion, implementation, and review work.

Start with `runpane doctor --json` before taking Pane actions. Use it to understand wrapper/runtime details, daemon reachability, and the next safe commands.

In a Pane repository checkout, if `runpane` is not on PATH, use the built local wrapper with Node 22: `PATH=/opt/homebrew/opt/node@22/bin:$PATH node packages/runpane/dist/cli.js doctor --json`.

Use `runpane agent-context --json` for full Pane CLI context. Use `runpane agent-context --command "panels wait" --json` or another command name for detailed schema only when needed.

Default to context-safe validation: after creating panes or sending terminal input, run `runpane panels wait` or `runpane panels screen` before reporting success. Prefer `runpane panels submit` for normal text plus Enter; use `runpane panels input` only for exact bytes such as Ctrl-C or escape sequences.

Common commands:

- `runpane doctor --json`
- `runpane agent-context --json`
- `runpane repos list --json`
- `runpane repos add --path <repo> --yes --json`
- `runpane agents doctor --agent codex --repo active --json`
- `runpane panes create --repo active --name <name> --agent codex --prompt "<task>" --wait-ready --yes --json`
- `runpane panels list --pane <pane-id> --json`
- `runpane panels screen --panel <panel-id> --limit 80 --json`
- `runpane panels wait --panel <panel-id> --for ready --timeout-ms 30000 --json`
- `runpane panels submit --panel <panel-id> --text "<answer>" --yes --json`
- `runpane panels input --panel <panel-id> --input-file <path|-> --yes --json`

WSL note: if `runpane doctor --json` cannot find `/tmp/pane-daemon.../daemon.sock` or `runpane` resolves to a broken Windows shim, Pane may be running on Windows. Try `powershell.exe -NoProfile -Command 'Set-Location $env:TEMP; runpane doctor --json'`, then create panes through the same PowerShell form using the saved WSL repo name or id. Use `runpane agents doctor --agent codex --repo <selector> --json` to diagnose the repo environment Pane will actually use.

<!-- pane-agent-context:end -->

## Regole di sviluppo

Questo progetto è una PWA per fidelity card. Ogni contributo deve rispettare questi vincoli — sono la sua identità, non preferenze negoziabili.

### Vincoli di prodotto (non negoziabili)

- **Sempre locale.** Tutti i dati (card, log, saldi) vivono sul dispositivo, in IndexedDB. Nessun backend custom, nessuna persistenza remota.
- **Zero tracciabilità.** Niente analytics, niente telemetria, niente chiamate di rete per tracciare l'utente. Le funzioni che raccolgono dati (es. cronologia aperture, posizione) sono opt-in, reversibili e restano on-device.
- **Leggera e sempre PWA.** Nessuna dipendenza nativa o API non-web: tutto deve funzionare come PWA installabile e offline. Prima di aggiungere una dipendenza, valuta il peso sul bundle; preferisci ciò che c'è già.

### Regole di programmazione

- **KISS** — la soluzione più semplice che risolve il problema. Niente astrazioni speculative.
- **YAGNI** — implementa solo ciò che serve ora. Le estensioni future si aggiungono quando servono davvero.
- **TDD e test** — logica testabile in moduli puri, con test in `tests/*.spec.js` (Vitest). La suite deve restare verde prima di ogni commit.
- **Soldi in centesimi interi**, mai float. In generale, attenzione ai fallback falsy (`x || default`) su valori dove `0`/`''` sono legittimi.
- **Commit convenzionali** (`feat:`, `fix:`, `chore:`…) — le release sono automatizzate da release-please su push a `main`.

### Branch e deploy

- **`main`** è il branch del **codice** dell'app (questo `AGENTS.md` vale per il codice).
- **`landing`** è un branch **separato** che ospita la landing page (Astro) e ha un proprio `AGENTS.md`.
- **`landing` non va MAI unito a `main`** (e viceversa): sono due linee distinte. Le feature entrano su `main`; la landing si aggiorna sul suo branch, con PR **verso `landing`**.

### Alla consegna di una funzionalità

Il codice va su `main`. L'annuncio della novità (aggiornamento landing + post LinkedIn) segue le regole del branch `landing` — vedi l'`AGENTS.md` di quel branch.
