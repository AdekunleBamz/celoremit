'use client';

import { useEffect, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

export function FarcasterWalletConnect() {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const checkFarcasterContext = async () => {
      try {
        const context = await sdk.context;
        if (context) {
          setIsFarcaster(true);
          setFarcasterUser(context.user);
          
          // Auto-connect to injected wallet when in Farcaster
          if (!isConnected) {
            const injectedConnector = connectors.find(
              (c) => c.id === 'farcaster' || c.id === 'injected'
            );
            if (injectedConnector) {
              try {
                await connect({ connector: injectedConnector });
              } catch (error) {
                console.log('Farcaster wallet connection:', error);
              }
            }
          }
        }
      } catch (e) {
        setIsFarcaster(false);
      }
    };

    checkFarcasterContext();
  }, [connect, connectors, isConnected]);

  if (!isFarcaster) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
      <div className="flex items-center gap-2 text-purple-400 text-sm">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
        <span className="font-medium">
          Running in Farcaster
          {farcasterUser && ` • @${farcasterUser.username}`}
        </span>
      </div>
      {isConnected && address && (
        <div className="mt-2 text-xs text-gray-400">
          Wallet: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
    </div>
  );
}

