import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.min.css';
import { MessagesProvider } from '@/components/Messages'

export default function App({ Component, pageProps }: AppProps) {
  // Better Auth doesn't need a session provider wrapper
  return <MessagesProvider>
    <Component {...pageProps} />
  </MessagesProvider>
}
