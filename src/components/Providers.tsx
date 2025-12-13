'use client';

import { useState, useEffect } from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/config/wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import '@rainbow-me/rainbowkit/styles.css';

// Create a singleton QueryClient instance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // Check if running in Farcaster Mini App context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // The SDK is available globally when running in Farcaster
        const context = sdk.context;
        if (context) {
          console.log('✅ Running in Farcaster Mini App context');
        } else {
          console.log('ℹ️ Running outside Farcaster (web browser)');
        }
      } catch (error) {
        console.log('ℹ️ Farcaster SDK not available');
      }
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#FCFF52',
            accentColorForeground: 'black',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}