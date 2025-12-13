'use client';

import { http, createConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect, injected } from 'wagmi/connectors';

// Get WalletConnect project ID from environment or use default
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'celoremit-app';

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    // Injected connector for Farcaster wallet and other injected wallets
    injected({
      target() {
        return {
          id: 'farcaster',
          name: 'Farcaster Wallet',
          provider: typeof window !== 'undefined' ? window.ethereum : undefined,
        };
      },
    }),
    metaMask(),
    coinbaseWallet({ 
      appName: 'CeloRemit',
      preference: 'smartWalletOnly', // Prioritize Smart Wallet for better UX
    }),
    walletConnect({ 
      projectId: walletConnectProjectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org'),
  },
  ssr: true,
  multiInjectedProviderDiscovery: true, // Enable detection of multiple wallets
});