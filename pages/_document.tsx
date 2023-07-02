import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
      <main 
        className="flex p-2 flex-col items-center justify-between p-24 mx-auto"
        style={{maxWidth: '80rem'}}
      >
        <Main />
      </main>
        
      <NextScript />  
      </body>
    </Html>
  )
}
