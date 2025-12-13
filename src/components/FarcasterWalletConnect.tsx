'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

export function FarcasterWalletConnect() {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [farcasterWallet, setFarcasterWallet] = useState<string | null>(null);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    let mounted = true;
    
    const checkFarcasterContext = async () => {
      try {
        const context = await sdk.context;
        if (context && mounted) {
          setIsFarcaster(true);
          setFarcasterUser(context.user);
          
          // Get Farcaster wallet if available
          if (context.client?.wallet) {
            setFarcasterWallet(context.client.wallet.address);
            console.log('✅ Farcaster wallet detected:', context.client.wallet.address);
          }
          
          console.log('✅ Farcaster Mini App context:', {
            user: context.user,
            client: context.client,
          });
        }
      } catch (e) {
        if (mounted) {
          setIsFarcaster(false);
          console.log('ℹ️ Not in Farcaster context');
        }
      }
    };

    checkFarcasterContext();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (!isFarcaster) {
    return null;
  }

  return (
    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
      <div className="flex items-center gap-2 text-purple-400 text-sm">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
        <span className="font-medium">
          Farcaster Mini App
          {farcasterUser && ` • @${farcasterUser.username}`}
        </span>
      </div>
      
      {farcasterWallet && !isConnected && (
        <div className="mt-2 text-xs text-yellow-300">
          ⚡ Click "Connect" above to connect your Farcaster wallet
        </div>
      )}
      
      {isConnected && address && (
        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-2">
          <span>✓ Wallet:</span>
          <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
      )}
      
      {!farcasterWallet && !isConnected && (
        <div className="mt-2 text-xs text-gray-400">
          Connect your wallet using the button above
        </div>
      )}
    </div>
  );
}

