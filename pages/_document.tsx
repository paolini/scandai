import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  // console.log('Document')
  return (
    <Html lang="it">
      <Head>
      <style>
        {`@media print {.noPrint{display: none;} .hideBlock{display: block !important;}}`}
      </style>
      </Head>
      <body>
      <main 
        className="flex p-2 flex-col items-center justify-between p-24 mx-auto"
        style={{maxWidth: '60rem'}}
      >
        <Main />
      </main>
        
      <NextScript />  
      </body>
    </Html>
  )
}
