import { http, createConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [injected(), metaMask()],
  transports: { [celo.id]: http('https://forno.celo.org') },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
