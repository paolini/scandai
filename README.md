
## Production Server

Code is deployed here: [https://scandai.develop.matb.it](https://scandai.develop.matb.it)

Il testo usato nel questionario si trova nel file [/lib/questionary.ts](https://github.com/paolini/scandai/blob/develop/lib/questionary.ts).
Lo puoi modificare direttamente su github, premendo sul link precedente.

Le modifiche vengono inviate tramite un "commit" che richiede un breve messaggio descrittivo. La "continuous integration" di github provvederà a compilare il nuovo codice e produrre una nuova immagine. Il server in produzione si accorgerà della presenza di una nuova immagine e si aggiornerà automaticamente. Per verificare che la compilazione sia andata a buon fine 
basta aprire la pagina [actions](https://github.com/paolini/scandai/actions) su github. 
Se si modifica il testo del questionario è opportuno incrementare il numero 
di versione, nello stesso file. Questo numero viene visualizzato in alto a destra sul questionario e quindi è utile per verificare che effettivamente 
il server si sia aggiornato.

## Dipendenze e verifiche

La versione 2.2.5 aggiorna Next.js, Better Auth, bcrypt, Nodemailer e le Action,
rimuove le librerie inutilizzate e genera i tipi GraphQL direttamente dallo
schema locale con `npm run codegen` (`codegen.mjs`).

Verifiche:

```sh
npm ci --legacy-peer-deps
npm run codegen
npx tsc --noEmit
npm test
npm audit --omit=dev
npm run build
```

Il test completo del login richiede un MongoDB temporaneo locale. Il database
si deve chiamare `scandai_dependency_test`; senza la variabile seguente il test
MongoDB viene saltato. La CI avvia un servizio MongoDB dedicato e lo esegue.

```sh
SCANDAI_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/scandai_dependency_test npm test
```

Better Auth richiede ora `accountId = userId` negli account password. La
migrazione `20261017180000-normalize-credential-account-ids.js` aggiorna gli
account precedenti conservando il valore originale per il rollback. Lo script
`start.sh` applica le migrazioni prima di avviare il container.

Al 17 ottobre 2026, `npm audit --omit=dev` non segnala vulnerabilità e il
lockfile non contiene pacchetti deprecati. L'audit completo segnala ancora
cinque pacchetti della stessa catena di sviluppo:
`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`.
La causa è [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
per cui non esiste ancora una versione correttiva di `braces`. La catena serve
al lint, non al runtime dell'applicazione; resta da aggiornare quando sarà
pubblicata una correzione compatibile.

## Test nel browser

`npm run test:e2e` usa Playwright per compilare il questionario come uno studente,
attraverso le API reali, e verifica le risposte salvate in MongoDB. Copre il
questionario completo in italiano, il breve in inglese e friulano, le risposte
obbligatorie, la navigazione indietro, le lingue aggiunte, tutti i tipi di risposta
e il blocco dei questionari chiusi nell'interfaccia studente. Verifica anche che
le due domande aggregate restino escluse dalla somministrazione e dal salvataggio.

I test dei report verificano che la selezione delle classi e tutti i filtri
rimangano applicati dopo il ricaricamento e nell'esportazione PDF. Riaprono
l'URL inviato alla stampa usando API e database reali e generano il PDF con
Chromium, sostituendo soltanto il servizio esterno Browserless.
Verificano inoltre che il menu delle scuole sia ordinato per compilazioni
effettive in base ai filtri attivi, mantenendo disponibili le scuole con zero risultati.

La stampa del questionario è verificata in italiano, inglese e friulano, nelle
versioni completa e breve. I test controllano anche la lingua scelta dal report
e l'assenza dei pulsanti radio dalla tabella delle età nel PDF. I PDF di prova
vengono salvati in `test-results/e2e`.

Per eseguirlo localmente:

```sh
npx playwright install chromium
docker run --detach --rm --name scandai-e2e-mongo -p 127.0.0.1:27018:27017 mongo:8
SCANDAI_E2E_MONGODB_URI=mongodb://127.0.0.1:27018/scandai_questionnaire_test npm run test:e2e
docker stop scandai-e2e-mongo
```

Il test accetta soltanto un MongoDB locale con database
`scandai_questionnaire_test`, crea dati sintetici e li elimina alla fine.
Compila l'applicazione in `.next-e2e`, avvia il server standalone sulla porta
3199 e lo arresta a fine esecuzione. Non riutilizza un server esistente e non
usa le credenziali dell'applicazione. Si possono impostare `SCANDAI_E2E_PORT`
e `SCANDAI_E2E_BROWSER_CHANNEL=chrome` per scegliere un'altra porta o Chrome già
installato. Screenshot e trace dei fallimenti finiscono in `test-results/e2e`.

La Action esegue questi test prima di pubblicare l'immagine Docker e notificare
WUD: un fallimento interrompe il deploy.

## backup

Il backup può essere fatto dal super-admin tramite interfaccia web. Oppure da riga di comando sul server. Per il restore si dà un comando del tipo:
```bash
    docker exec -i ${MONGODB_CONTAINER_NAME} mongorestore --archive --drop < ${BACKUP_FILENAME}
```

## puppeteer

Per la stampa in PDF viene utilizzato il servizio `browserless-chrome`. Può essere avviato in docker come descritto in `docker-compose.yml`. Bisogna quindi configurare le variabili `BROWSERLESS_URL`, `BROWSERLESS_SCANDAI_URL` e opzionalmente `BROWSERLESS_WAITFOR` (attesa in millisecondi per il caricamento della pagina, default 5000) ad esempio:
```
BROWSERLESS_URL=http://localhost:3002
BROWSERLESS_SCANDAI_URL=http://192.168.1.2:3000
BROWSERLESS_WAITFOR=5000
```
nel proprio `.env` o nella configurazione di produzione. 

Nello sviluppo in locale non si potrà però utilizzare l'indirizzo localhost per l'applicazione scandai perché puppeteer richiede un indirizzo assoluto.

## Development

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

Le dichiarazioni di graphql sono nel file `schema.graphql`.
Se modifichi quel file devi poi dare il comando:
```
npm run codegen
```
che rigenera il file `generated/graphql.ts`.

To build for production:

```
npm run build
```

set these variables in the environment:

```
    MONGODB_URI=mongodb://localhost:27017/scandai
    NEXTAUTH_URL=http://localhost:3000/api/auth 
    NEXTAUTH_SECRET=secret
    GOOGLE_CLIENT_ID=client_id
    GOOGLE_CLIENT_SECRET=client_secret
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=your_secret_password
    SITE_TITLE="Fotografia linguistica"
    SITE_VARIANT="(sviluppo)"
    BROWSERLESS_URL=http://browserless
    BROWSERLESS_SCANDAI_URL=http://scandai
```

## links

http://scandai.lavplu.eu/

https://lavplu.eu/

## Learn More

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

# Panoramica AI-friendly del progetto scandai

## Descrizione Generale

**scandai** è un'applicazione web, sviluppata principalmente con Next.js e TypeScript, progettata per la raccolta e l'analisi di dati linguistici tramite questionari. L'obiettivo è facilitare la compilazione, la gestione e la visualizzazione di questionari multilingue, con particolare attenzione a contesti scolastici e di ricerca linguistica.

## Struttura del Progetto

- **Frontend**: Utilizza Next.js per la generazione di pagine dinamiche e React per la gestione dei componenti UI.
- **Componenti**: La cartella `components/` contiene moduli riutilizzabili per la visualizzazione di domande, risposte, header, input, loading, ecc.
- **Gestione Questionari**: Il file principale `lib/questionary.ts` definisce la struttura dei questionari, le domande, le lingue supportate, le competenze linguistiche e le funzioni di estrazione dati.
- **Localizzazione**: Supporto multilingue (italiano, friulano, inglese) per domande, risposte e interfaccia.
- **Database**: Presenza di una cartella `database/` che suggerisce l'uso di un database locale, probabilmente MongoDB, per la persistenza dei dati.
- **Configurazione**: File come `docker-compose.yml`, `Dockerfile` e `entrypoint.sh` permettono il deploy in ambienti containerizzati.
- **Stili e Risorse**: Cartelle dedicate a stili (`styles/`), risorse pubbliche (`public/`), e localizzazione (`locales/`).

## Funzionalità Principali

- **Compilazione Questionari**: Gli utenti possono compilare questionari linguistici, scegliendo tra versioni "complete" e "brevi".
- **Gestione Multilingua**: Tutte le domande e le interfacce sono disponibili in più lingue.
- **Analisi e Report**: Il sistema genera report aggregati e tabelle di competenze linguistiche autovalutate.
- **Estendibilità**: La struttura modulare consente di aggiungere facilmente nuove domande, lingue o competenze.

## Tecnologie Utilizzate

- **Next.js**: Framework React per applicazioni server-side rendering e statiche.
- **TypeScript**: Tipizzazione statica per maggiore robustezza e manutenibilità.
- **Docker**: Containerizzazione per ambienti di sviluppo e produzione.
- **MongoDB** (presunto): Database NoSQL per la memorizzazione delle risposte.

## Stampa del report

La stampa del report avviene tramite la generazione di una pagina web che riassume i risultati del questionario, presentando grafici, tabelle e dati aggregati. Per ottenere una versione PDF del report, viene utilizzato il servizio `browserless-chrome` in combinazione con Puppeteer.

### Funzionamento

1. **Generazione della pagina report**: L'applicazione Next.js crea una pagina web con tutti i dati e le visualizzazioni del report, in base alle risposte raccolte e alla struttura definita in `lib/questionary.ts`.
2. **Rendering headless**: Il servizio `browserless-chrome` riceve una richiesta HTTP contenente l'URL della pagina report da stampare. Questo servizio esegue la pagina in modalità headless (senza interfaccia grafica) tramite Puppeteer.
3. **Attesa del caricamento**: È possibile configurare un tempo di attesa (`BROWSERLESS_WAITFOR`) per assicurarsi che tutti i dati e i grafici siano caricati prima della stampa.
4. **Generazione PDF**: Una volta che la pagina è completamente renderizzata, Puppeteer la esporta in formato PDF e restituisce il file all'utente o lo salva dove richiesto.

### Note tecniche

- L'indirizzo della pagina da stampare deve essere assoluto (non localhost) affinché Puppeteer possa accedervi correttamente.
- Le variabili di ambiente `BROWSERLESS_URL` e `BROWSERLESS_SCANDAI_URL` devono essere configurate per collegare correttamente il servizio di stampa all'applicazione.
- La stampa può essere avviata tramite interfaccia web (pulsante di stampa) o tramite chiamata API.

Questa soluzione garantisce una stampa fedele e automatica dei report, utile per archiviazione, condivisione o presentazione dei risultati.

## Possibili Applicazioni AI

- **Analisi automatica delle risposte**: Possibilità di integrare moduli AI per clusterizzazione, sentiment analysis o estrazione di pattern linguistici.
- **Generazione automatica di report**: Utilizzo di modelli AI per la sintesi automatica dei risultati.
- **Suggerimenti personalizzati**: Algoritmi AI per proporre attività o percorsi formativi basati sui dati raccolti.

## Estendibilità AI

Il progetto è strutturato in modo da poter essere facilmente integrato con moduli AI per:
- Pre-elaborazione e normalizzazione dei dati linguistici.
- Analisi predittiva delle competenze linguistiche.
- Generazione automatica di domande o traduzioni.

## Conclusione

scandai è una piattaforma versatile per la raccolta e l'analisi di dati linguistici, con una solida base per l'integrazione di funzionalità AI avanzate, sia per la gestione dei dati che per l'analisi automatica. La modularità e la localizzazione lo rendono adatto a contesti educativi e di ricerca.

---

