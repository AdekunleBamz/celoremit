'use client';

import { useEffect, useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

export function FarcasterWalletConnect() {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    let mounted = true;
    
    const checkFarcasterContext = async () => {
      try {
        const context = await sdk.context;
        if (context && mounted) {
          setIsFarcaster(true);
          setFarcasterUser(context.user);
          console.log('✅ Farcaster Mini App detected', context);
          
          // Auto-connect to injected wallet when in Farcaster
          if (!isConnected && !isConnecting) {
            setIsConnecting(true);
            
            // Wait a bit for connectors to be ready
            setTimeout(async () => {
              if (!mounted) return;
              
              const injectedConnector = connectors.find(
                (c) => c.type === 'injected' || c.id === 'injected'
              );
              
              console.log('Available connectors:', connectors.map(c => ({ id: c.id, type: c.type, name: c.name })));
              
              if (injectedConnector) {
                try {
                  console.log('Connecting to injected wallet for Farcaster...');
                  await connect({ connector: injectedConnector });
                  console.log('✅ Connected to Farcaster wallet');
                } catch (error) {
                  console.error('Farcaster wallet connection error:', error);
                } finally {
                  setIsConnecting(false);
                }
              } else {
                console.warn('No injected connector found');
                setIsConnecting(false);
              }
            }, 1000);
          }
        }
      } catch (e) {
        if (mounted) {
          setIsFarcaster(false);
          console.log('Not in Farcaster context');
        }
      }
    };

    checkFarcasterContext();
    
    return () => {
      mounted = false;
    };
  }, [connect, connectors, isConnected, isConnecting]);

  if (!isFarcaster) {
    return null;
  }

  return (
    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
      <div className="flex items-center justify-between">
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
          <button
            onClick={() => disconnect()}
            className="text-xs text-purple-300 hover:text-purple-200"
          >
            Switch
          </button>
        )}
      </div>
      
      {isConnecting && !isConnected && (
        <div className="mt-2 text-xs text-purple-300">
          🔄 Connecting to Farcaster wallet...
        </div>
      )}
      
      {isConnected && address ? (
        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-2">
          <span>✓ Connected:</span>
          <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
      ) : !isConnecting && (
        <div className="mt-2 text-xs text-yellow-400">
          ⚠️ Please connect your wallet using the button above
        </div>
      )}
    </div>
  );
}

