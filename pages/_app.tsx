import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.min.css';
import { SessionProvider } from 'next-auth/react'
import { MessagesProvider } from '@/components/Messages'

import config from '@/lib/config'

export default function App({ Component, pageProps }: AppProps) {
  console.log(`App config: ${JSON.stringify(config)}`)
  return <SessionProvider session={pageProps.session}>
    <MessagesProvider>
      <Component {...pageProps} config={config} />
    </MessagesProvider>
  </SessionProvider> 
}
