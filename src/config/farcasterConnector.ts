import { createConnector } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

export const farcasterConnector = () => {
  return createConnector((config) => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    type: 'injected',
    
    async connect({ chainId } = {}) {
      try {
        const provider = await this.getProvider();
        if (!provider) throw new Error('Farcaster wallet not available');
        
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        });
        
        return {
          accounts: accounts as readonly `0x${string}`[],
          chainId: chainId || 42220, // Use provided chainId or default to Celo
        };
      } catch (error) {
        console.error('Farcaster wallet connection error:', error);
        throw error;
      }
    },
    
    async disconnect() {
      // Farcaster wallet doesn't need explicit disconnect
    },
    
    async getAccounts() {
      const provider = await this.getProvider();
      if (!provider) return [];
      
      const accounts = await provider.request({
        method: 'eth_accounts',
      });
      
      return accounts as readonly `0x${string}`[];
    },
    
    async getChainId() {
      const provider = await this.getProvider();
      if (!provider) return 42220; // Default to Celo
      
      const chainId = await provider.request({
        method: 'eth_chainId',
      });
      
      return Number(chainId);
    },
    
    async getProvider() {
      try {
        const context = await sdk.context;
        
        // Check if we're in Farcaster and have wallet access
        if (context?.client?.wallet) {
          // The Farcaster SDK provides an EIP-1193 provider
          return (window as any).ethereum || null;
        }
        
        return null;
      } catch {
        return null;
      }
    },
    
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();
        return accounts.length > 0;
      } catch {
        return false;
      }
    },
    
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      if (!provider) throw new Error('Provider not available');
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      return config.chains.find((c) => c.id === chainId) || config.chains[0];
    },
    
    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect?.();
      } else {
        config.emitter.emit('change', {
          accounts: accounts as `0x${string}`[],
        });
      }
    },
    
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    
    async onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));
};

