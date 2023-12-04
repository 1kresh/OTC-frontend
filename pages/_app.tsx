import '../styles/globals.css'
import { ConfigProvider } from 'antd'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import type { AppProps } from 'next/app'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import {
  arbitrum,
  sepolia,
  mainnet,
  optimism,
  polygon,
  base,
  zora,
} from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon, optimism, arbitrum, base, zora, sepolia],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
    publicProvider(),
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'OTC',
  projectId: '5eb9202a0da0387fbb57caa1a5a207ba',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <ConfigProvider>
          <Component {...pageProps} />
        </ConfigProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
