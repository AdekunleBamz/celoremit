'use client';

import { http, createConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect, injected } from 'wagmi/connectors';
import { farcasterConnector } from './farcasterConnector';

// Get WalletConnect project ID from environment or use default
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'celoremit-app';

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    // Farcaster wallet connector (appears first in Farcaster Mini App)
    farcasterConnector(),
    // Injected wallet (browser extensions)
    injected(),
    // MetaMask
    metaMask(),
    // Coinbase Wallet
    coinbaseWallet({ 
      appName: 'CeloRemit',
      preference: 'smartWalletOnly',
    }),
    // WalletConnect
    walletConnect({ 
      projectId: walletConnectProjectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org'),
  },
  ssr: true,
  multiInjectedProviderDiscovery: true,
});