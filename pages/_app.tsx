import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.min.css';
import { SessionProvider } from 'next-auth/react'
import { MessagesProvider } from '@/components/Messages'

export default function App({ Component, pageProps }: AppProps) {
  console.log('App session', JSON.stringify(pageProps.session))
  return <SessionProvider session={pageProps.session}>
    <MessagesProvider>
      <Component {...pageProps} />
    </MessagesProvider>
  </SessionProvider> 
}
