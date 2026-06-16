# Security Policy

## Supported versions

| Version                      | Supported |
| ---------------------------- | --------- |
| Latest `main` release (v1.x) | ✅        |
| Older tagged versions        | ❌        |

## How to report a vulnerability

Se trovi una vulnerabilità di sicurezza, **non aprire una issue pubblica**.

Usa invece **GitHub Security Advisories** (privato, solo tu e il maintainer vedete il report):

🔗 https://github.com/savez/fidality-card/security/advisories/new

In alternativa, contattami via GitHub messaging come [@savez](https://github.com/savez).

### Cosa includere nel report

- Descrizione della vulnerabilità
- Steps per riprodurre (PoC se possibile)
- Versione/commit affetto
- Impatto stimato

### Tempi di risposta

Best-effort, progetto personale OSS:

- **Acknowledgement**: entro 72 ore
- **Patch o mitigazione**: entro 14 giorni per gravità alta, best-effort per le altre

## Security tooling attivo

Il repo ha protezioni continuative:

- **[Socket Security](https://socket.dev)** scansiona automaticamente le dependency su ogni PR (alerts su supply-chain risk, malware, behavior changes)
- **CI workflow** esegue lint + test su ogni PR
- **commitlint** valida i messaggi commit (conventional commits)
- **Husky hooks** lato dev: lint-staged + commitlint + tests pre-push
- **GitHub Dependabot** (default) per security advisories sulle dipendenze
- **Branch protection** su `main`: PR obbligatorio + status checks verdi prima del merge

## Disclosure policy

Una volta confermato e fixato il bug:

1. Pubblicherò una GitHub Security Advisory pubblica con i dettagli (CVE se applicabile)
2. Crediterò il reporter (se lo desidera)
3. Aggiornerò CHANGELOG.md con riferimento all'advisory

## Out of scope

Questo è un progetto **personale e self-hosted**:

- I dati delle card vivono **solo in IndexedDB sul device dell'utente**, mai inviati a server custom
- Non c'è un backend del maintainer da bucare
- Vulnerabilità del browser/SO dell'utente sono fuori scope (forka e patcha la tua istanza)
- L'istanza pubblica `fidality-card.onrender.com` serve solo asset statici — niente endpoint server-side da exploitare

## License

Rilasciato sotto licenza MIT (vedi [LICENSE](LICENSE)). Nessuna garanzia, "AS IS".
