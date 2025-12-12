'use client';

import { http, createConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from environment or use default
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'celoremit-app';

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'CeloRemit' }),
    walletConnect({ projectId: walletConnectProjectId }),
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org'),
  },
  ssr: true,
});