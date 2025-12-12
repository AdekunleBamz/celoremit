'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { getStablecoinByAddress, CELOREMIT_ADDRESS, CELOREMIT_ABI } from '@/config/contracts';

interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  targetAmount: string;
  memo: string;
  timestamp: number;
  status: 'Pending' | 'Completed' | 'Failed';
}

interface TransactionHistoryProps {
  address?: string;
}

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch remittance IDs from contract
  const { data: remittanceIds, isLoading: isLoadingIds } = useReadContract({
    address: CELOREMIT_ADDRESS as `0x${string}`,
    abi: CELOREMIT_ABI,
    functionName: 'getUserRemittances',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // In production, fetch transaction details from contract or indexer
        // For now, we'll use mock data but structure it for easy replacement
        // TODO: Replace with actual contract calls to get remittance details
        
        // If we have remittance IDs, we could fetch each one:
        // for (const id of remittanceIds) {
        //   const remittance = await readContract({
        //     address: CELOREMIT_ADDRESS,
        //     abi: CELOREMIT_ABI,
        //     functionName: 'remittances',
        //     args: [id],
        //   });
        // }
        
        // For demo purposes, show mock data
        const mockTx: Transaction[] = [
          {
            id: '0x123...',
            sender: address,
            recipient: '0xabc...',
            sourceToken: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
            targetToken: '0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B', // PUSO
            sourceAmount: '50000000000000000000',
            targetAmount: '2850000000000000000000',
            memo: 'For groceries',
            timestamp: Date.now() - 86400000,
            status: 'Completed',
          },
          {
            id: '0x456...',
            sender: address,
            recipient: '0xdef...',
            sourceToken: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
            targetToken: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0', // cKES
            sourceAmount: '100000000000000000000',
            targetAmount: '12900000000000000000000',
            memo: 'Monthly support',
            timestamp: Date.now() - 172800000,
            status: 'Completed',
          },
        ];

        setTransactions(mockTx);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transaction history');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingIds) {
      fetchTransactions();
    }
  }, [address, remittanceIds, isLoadingIds]);

  const formatAmount = (amount: string) => {
    return (parseFloat(amount) / 1e18).toFixed(2);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!address) {
    return (
      <div className="mt-4 bg-emerald-800/30 rounded-2xl p-8 text-center">
        <p className="text-emerald-400">Connect wallet to view history</p>
      </div>
    );
  }

  if (isLoading || isLoadingIds) {
    return (
      <div className="mt-4 bg-emerald-800/30 rounded-2xl p-8 text-center">
        <p className="text-emerald-400">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 bg-red-900/30 rounded-2xl p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-sm hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-4 bg-emerald-800/30 rounded-2xl p-8 text-center">
        <span className="text-4xl mb-3 block">📭</span>
        <p className="text-emerald-300">No transactions yet</p>
        <p className="text-emerald-500 text-sm mt-1">Your remittances will appear here</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-sm text-emerald-300 font-medium">Recent Transactions</h3>
      
      {transactions.map((tx) => {
        const sourceToken = getStablecoinByAddress(tx.sourceToken);
        const targetToken = getStablecoinByAddress(tx.targetToken);
        
        return (
          <div key={tx.id} className="bg-emerald-800/30 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sourceToken?.flag || '💵'}</span>
                <span>→</span>
                <span className="text-lg">{targetToken?.flag || '💵'}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {tx.status}
              </span>
            </div>
            
            <div className="mt-2">
              <p className="text-lg font-bold">
                {formatAmount(tx.sourceAmount)} {sourceToken?.symbol}
                <span className="text-emerald-400 text-sm font-normal"> → </span>
                {formatAmount(tx.targetAmount)} {targetToken?.symbol}
              </p>
              {tx.memo && (
                <p className="text-sm text-emerald-400 mt-1">"{tx.memo}"</p>
              )}
            </div>
            
            <div className="mt-2 flex justify-between text-xs text-emerald-500">
              <span>To: {tx.recipient.slice(0, 8)}...{tx.recipient.slice(-6)}</span>
              <span>{formatDate(tx.timestamp)}</span>
            </div>
            <a
              href={`https://celoscan.io/address/${tx.recipient}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 underline mt-1 block"
            >
              View on Celoscan →
            </a>
          </div>
        );
      })}
    </div>
  );
}
