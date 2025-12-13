import { createConnector } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

export const farcasterConnector = () => {
  return createConnector((config) => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    type: 'injected',
    
    async connect(parameters = {}) {
      try {
        const provider = await this.getProvider();
        if (!provider) throw new Error('Farcaster wallet not available');
        
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        }) as string[];
        
        const currentChainId = parameters.chainId || 42220;
        
        return {
          accounts: accounts as any,
          chainId: currentChainId,
        };
      } catch (error) {
        console.error('Farcaster wallet connection error:', error);
        throw error;
      }
    },
    
    async disconnect() {
      // Farcaster wallet doesn't need explicit disconnect
    },
    
    async getAccounts(): Promise<readonly `0x${string}`[]> {
      const provider = await this.getProvider();
      if (!provider) return [];
      
      const accounts = await provider.request({
        method: 'eth_accounts',
      }) as string[];
      
      return accounts as readonly `0x${string}`[];
    },
    
    async getChainId(): Promise<number> {
      const provider = await this.getProvider();
      if (!provider) return 42220; // Default to Celo
      
      const chainId = await provider.request({
        method: 'eth_chainId',
      }) as string;
      
      return Number(chainId);
    },
    
    async getProvider(): Promise<EthereumProvider | null> {
      try {
        const context = await sdk.context;
        
        // Check if we're in Farcaster and have wallet access
        if (context && typeof window !== 'undefined' && (window as any).ethereum) {
          // The Farcaster SDK provides an EIP-1193 provider
          return (window as any).ethereum as EthereumProvider;
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

