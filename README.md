## Production Server

Code is deployed here: [https://scandai.matb.it](https://scandai.matb.it)

Il testo usato nel questionario si trova nel file [/pages/api/questionary.ts](https://github.com/paolini/scandai/blob/main/pages/api/questionary.ts).
Lo puoi modificare direttamente su github, premendo sul link precedente.

Le modifiche vengono inviate tramite un "commit" che richiede un breve messaggio descrittivo. La "continuous integration" di github provvederà a compilare il nuovo codice e produrre una nuova immagine. Il server in produzione si accorgerà della presenza di una nuova immagine e si aggiornerà automaticamente. Per verificare che la compilazione sia andata a buon fine 
basta aprire la pagina [actions](https://github.com/paolini/scandai/actions) su github. 
Se si modifica il testo del questionario è opportuno incrementare il numero 
di versione, nello stesso file. Questo numero viene visualizzato in alto a destra sul questionario e quindi è utile per verificare che effettivamente 
il server si sia aggiornato.

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

