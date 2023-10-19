import { Html, Head, Main, NextScript } from 'next/document'

import { SITE_TITLE } from '@/lib/config'

export default function Document() {
  return (
    <Html lang="it">
      <Head>
      <style>
            {`@media print {.noPrint{display: none;}}`}
      </style>
      <script
            dangerouslySetInnerHTML={{
              __html: `var SITE_TITLE="${SITE_TITLE}";`,
            }}
      />
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
