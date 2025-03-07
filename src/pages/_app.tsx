import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import MagicProvider from '@/hooks/MagicProvider'
import SquidProvider from '@/hooks/SquidProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MagicProvider>
      <SquidProvider>
        <Component {...pageProps} />
      </SquidProvider>
    </MagicProvider>
  )
}
