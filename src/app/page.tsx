'use client';

// Force dynamic rendering to avoid SSR issues with localStorage and wallet connections
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits, formatUnits, isAddress } from 'viem';
import { sdk } from '@farcaster/miniapp-sdk';
import { MENTO_STABLECOINS, getActiveStablecoins, ERC20_ABI, CELOREMIT_ADDRESS, CELOREMIT_ABI } from '@/config/contracts';
import { SelfVerification } from '@/components/SelfVerification';
import { CurrencySelector } from '@/components/CurrencySelector';
import { TransactionHistory } from '@/components/TransactionHistory';

interface ParsedIntent {
  action: 'send' | 'convert' | 'check_rate';
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  recipient?: string;
  recipientType?: string;
  memo?: string;
  confidence: number;
}

interface Quote {
  targetAmount: bigint;
  fee: bigint;
  exchangeRate: bigint;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  
  const [inputText, setInputText] = useState('');
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [error, setError] = useState<string>('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const hasExecutedRef = useRef(false);

  // Farcaster Mini App initialization
  useEffect(() => {
    let mounted = true;
    const initMiniApp = async () => {
      try {
        const context = await sdk.context;
        if (context && mounted) {
          setIsMiniApp(true);
          await sdk.actions.ready();
        }
      } catch (e) {
        console.log('Not in Farcaster context');
      }
    };
    initMiniApp();
    return () => {
      mounted = false;
    };
  }, []);

  // Check verification status from localStorage
  useEffect(() => {
    if (address && typeof window !== 'undefined') {
      try {
        const verified = localStorage.getItem(`self_verified_${address}`);
        setIsVerified(verified === 'true');
      } catch (error) {
        // localStorage might not be available in some environments
        console.warn('Failed to access localStorage:', error);
      }
    }
  }, [address]);

  // Get balance of selected source currency
  const sourceToken = parsedIntent ? MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS] : null;
  const { data: balance } = useBalance({
    address,
    token: sourceToken?.address as `0x${string}`,
    query: {
      enabled: !!sourceToken && !!address,
    },
  });

  // Check allowance
  const { data: allowance } = useReadContract({
    address: sourceToken?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && sourceToken ? [address, CELOREMIT_ADDRESS as `0x${string}`] : undefined,
    query: {
      enabled: !!sourceToken && !!address && !!parsedIntent,
    },
  });

  // Contract write hooks
  const { data: approveHash, writeContract: approveToken, isPending: isApproving } = useWriteContract();
  const { data: sendHash, writeContract: sendRemittance, isPending: isSending } = useWriteContract();
  
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isSendConfirming, isSuccess: isSendSuccess } = useWaitForTransactionReceipt({ hash: sendHash });

  // Validate recipient address
  useEffect(() => {
    if (recipientAddress) {
      const isValid = isAddress(recipientAddress);
      setIsValidAddress(isValid);
      if (!isValid && recipientAddress.length > 0) {
        setError('Invalid recipient address');
      } else {
        setError('');
      }
    } else {
      setIsValidAddress(true);
      setError('');
    }
  }, [recipientAddress]);

  // Fetch quote when intent changes
  useEffect(() => {
    if (!parsedIntent || !address || parsedIntent.amount <= 0) {
      setQuote(null);
      return;
    }

    const sourceTokenInfo = MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS];
    const targetTokenInfo = MENTO_STABLECOINS[parsedIntent.targetCurrency as keyof typeof MENTO_STABLECOINS];
    
    if (!sourceTokenInfo || !targetTokenInfo || sourceTokenInfo.address === targetTokenInfo.address) {
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    const fetchQuote = async () => {
      try {
        // In a real implementation, call the contract's getQuote function
        // For now, we'll use a placeholder
        setQuote({
          targetAmount: parseUnits((parsedIntent.amount * 0.95).toString(), 18),
          fee: parseUnits((parsedIntent.amount * 0.01).toString(), 18),
          exchangeRate: parseUnits('1', 18),
        });
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [parsedIntent, address]);

  // Parse intent from natural language
  const parseIntent = async () => {
    if (!inputText.trim()) return;
    
    setIsParsing(true);
    setParseMessage('');
    setError('');
    
    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, userAddress: address }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to parse intent');
      }
      
      const data = await res.json();
      
      if (data.success && data.intent) {
        setParsedIntent(data.intent);
        setParseMessage(data.message || '');
        if (data.intent.recipient && data.intent.recipientType === 'address') {
          setRecipientAddress(data.intent.recipient);
        }
        if (data.intent.memo) {
          setMemo(data.intent.memo);
        }
      } else {
        setParseMessage(data.message || 'Could not understand your request');
        setParsedIntent(null);
      }
    } catch (error) {
      setParseMessage('Failed to process your request. Please try again.');
      setParsedIntent(null);
      setError('Network error. Please check your connection.');
    }
    
    setIsParsing(false);
  };

  // Execute send transaction
  const executeSend = useCallback((amount: bigint, sourceTokenInfo: typeof MENTO_STABLECOINS[keyof typeof MENTO_STABLECOINS], targetTokenInfo: typeof MENTO_STABLECOINS[keyof typeof MENTO_STABLECOINS]) => {
    if (!parsedIntent || !recipientAddress || !address) {
      console.error('Missing required data for send:', { parsedIntent: !!parsedIntent, recipientAddress: !!recipientAddress, address: !!address });
      return;
    }

    // Validate addresses
    if (!isAddress(recipientAddress) || !isAddress(sourceTokenInfo.address) || !isAddress(targetTokenInfo.address)) {
      setError('Invalid address detected. Please check your inputs.');
      console.error('Invalid addresses:', { recipientAddress, sourceToken: sourceTokenInfo.address, targetToken: targetTokenInfo.address });
      return;
    }

    // Ensure amount is valid
    if (amount <= BigInt(0)) {
      setError('Invalid amount. Amount must be greater than 0.');
      console.error('Invalid amount:', amount.toString());
      return;
    }

    // Calculate minTarget with proper slippage (5%)
    const minTarget = quote?.targetAmount || (amount * BigInt(95)) / BigInt(100);
    
    console.log('Executing send with params:', {
      recipient: recipientAddress,
      sourceToken: sourceTokenInfo.address,
      targetToken: targetTokenInfo.address,
      amount: amount.toString(),
      minTarget: minTarget.toString(),
      memo: memo || '',
    });
    
    try {
      sendRemittance({
        address: CELOREMIT_ADDRESS as `0x${string}`,
        abi: CELOREMIT_ABI,
        functionName: 'executeRemittance',
        args: [
          recipientAddress as `0x${string}`,
          sourceTokenInfo.address as `0x${string}`,
          targetTokenInfo.address as `0x${string}`,
          amount,
          minTarget,
          memo || '',
        ],
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to send transaction: ${errorMessage}. Please check your balance and try again.`);
      console.error('Send error:', error);
    }
  }, [parsedIntent, recipientAddress, memo, quote, sendRemittance, address]);

  // Execute the remittance
  const executeRemittance = useCallback(async () => {
    console.log('executeRemittance called', { parsedIntent, recipientAddress, address });
    
    if (!parsedIntent || !recipientAddress || !address) {
      const errorMsg = !parsedIntent ? 'No intent parsed' : !recipientAddress ? 'No recipient address' : 'Wallet not connected';
      setError(`Please fill in all required fields: ${errorMsg}`);
      console.error('Missing required fields:', { parsedIntent: !!parsedIntent, recipientAddress: !!recipientAddress, address: !!address });
      return;
    }

    // Validate address
    if (!isAddress(recipientAddress)) {
      setError('Invalid recipient address');
      console.error('Invalid address:', recipientAddress);
      return;
    }

    // Validate amount
    if (parsedIntent.amount <= 0) {
      setError('Amount must be greater than 0');
      console.error('Invalid amount:', parsedIntent.amount);
      return;
    }
    
    const sourceTokenInfo = MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS];
    const targetTokenInfo = MENTO_STABLECOINS[parsedIntent.targetCurrency as keyof typeof MENTO_STABLECOINS];
    
    if (!sourceTokenInfo || !targetTokenInfo) {
      setError('Invalid currency selection');
      console.error('Invalid tokens:', { sourceTokenInfo, targetTokenInfo });
      return;
    }

    // Check if same currency
    if (sourceTokenInfo.address === targetTokenInfo.address) {
      setError('Source and target currencies cannot be the same');
      return;
    }

    // Check balance
    const amount = parseUnits(parsedIntent.amount.toString(), 18);
    if (balance && balance.value < amount) {
      setError('Insufficient balance');
      console.error('Insufficient balance:', { 
        required: amount.toString(), 
        available: balance.value.toString() 
      });
      return;
    }

    setError('');
    hasExecutedRef.current = false;
    
    // Check if approval is needed
    const currentAllowance = allowance || BigInt(0);
    console.log('Checking allowance:', { 
      currentAllowance: currentAllowance.toString(), 
      amount: amount.toString(),
      needsApproval: currentAllowance < amount 
    });
    
    // Approve a bit more than needed to avoid multiple approvals (add 10% buffer)
    const approvalAmount = (amount * BigInt(110)) / BigInt(100);
    
    if (currentAllowance < amount) {
      // First approve the token
      console.log('Approval needed, requesting approval...', {
        token: sourceTokenInfo.address,
        spender: CELOREMIT_ADDRESS,
        amount: approvalAmount.toString(),
      });
      try {
        approveToken({
          address: sourceTokenInfo.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CELOREMIT_ADDRESS as `0x${string}`, approvalAmount],
        });
        console.log('Approval request sent');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to approve token: ${errorMessage}. Please try again.`);
        console.error('Approval error:', error);
      }
    } else {
      // Already approved, execute directly
      console.log('Already approved, executing send...');
      executeSend(amount, sourceTokenInfo, targetTokenInfo);
    }
  }, [parsedIntent, recipientAddress, address, balance, allowance, approveToken, executeSend]);

  // After approval, execute the transfer
  useEffect(() => {
    if (approveHash && !isApproveConfirming && !hasExecutedRef.current && parsedIntent && recipientAddress) {
      hasExecutedRef.current = true;
      const sourceTokenInfo = MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS];
      const targetTokenInfo = MENTO_STABLECOINS[parsedIntent.targetCurrency as keyof typeof MENTO_STABLECOINS];
      
      if (!sourceTokenInfo || !targetTokenInfo) return;
      
      const amount = parseUnits(parsedIntent.amount.toString(), 18);
      executeSend(amount, sourceTokenInfo, targetTokenInfo);
    }
  }, [approveHash, isApproveConfirming, parsedIntent, recipientAddress, executeSend]);

  // Reset state after successful transaction
  useEffect(() => {
    if (isSendSuccess) {
      // Reset form after a delay
      setTimeout(() => {
        setParsedIntent(null);
        setRecipientAddress('');
        setMemo('');
        setInputText('');
        setParseMessage('');
        setQuote(null);
        hasExecutedRef.current = false;
      }, 3000);
    }
  }, [isSendSuccess]);

  // Quick action buttons
  const quickActions = [
    'Send $50 to Kenya',
    'Transfer 100 cUSD to Philippines',
    'Convert 200 cEUR to cKES',
    'Send 1000 to 0x...',
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-emerald-900/80 border-b border-emerald-700/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <h1 className="text-xl font-bold">CeloRemit</h1>
          </div>
          
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              
              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="px-4 py-1.5 bg-yellow-500 text-emerald-900 rounded-full text-sm font-semibold"
                        >
                          Connect
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="px-3 py-1.5 bg-emerald-700/50 rounded-full text-sm"
                      >
                        {account.displayName}
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex gap-2 bg-emerald-800/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'send' ? 'bg-emerald-600 text-white' : 'text-emerald-300'
            }`}
          >
            💸 Send
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'history' ? 'bg-emerald-600 text-white' : 'text-emerald-300'
            }`}
          >
            📜 History
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {activeTab === 'send' ? (
          <>
            {/* AI Intent Input */}
            <div className="mt-4 bg-emerald-800/30 rounded-2xl p-4">
              <label className="text-sm text-emerald-300 mb-2 block">
                Tell me what you want to send 🤖
              </label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), parseIntent())}
                  placeholder="Send $50 to my mom in Philippines..."
                  className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 text-white placeholder-emerald-400/50 resize-none h-20 pr-12"
                />
                <button
                  onClick={parseIntent}
                  disabled={isParsing || !inputText.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-yellow-500 rounded-lg text-emerald-900 disabled:opacity-50"
                >
                  {isParsing ? '⏳' : '✨'}
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => { setInputText(action); }}
                    className="text-xs px-3 py-1 bg-emerald-700/30 rounded-full text-emerald-300 hover:bg-emerald-700/50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Parsed Intent Display */}
            {parseMessage && (
              <div className={`mt-4 p-4 rounded-xl ${parsedIntent ? 'bg-emerald-700/30' : 'bg-red-900/30'}`}>
                <p className="text-lg font-semibold">{parseMessage}</p>
                {parsedIntent && (
                  <p className="text-sm text-emerald-300 mt-1">
                    Confidence: {Math.round(parsedIntent.confidence * 100)}%
                  </p>
                )}
              </div>
            )}

            {/* Transfer Form */}
            {parsedIntent && (
              <div className="mt-4 bg-emerald-800/30 rounded-2xl p-4 space-y-4">
                {/* Currency Display */}
                <div className="flex items-center justify-between">
                  <CurrencySelector
                    value={parsedIntent.sourceCurrency}
                    onChange={(c) => setParsedIntent({ ...parsedIntent, sourceCurrency: c })}
                    label="From"
                  />
                  <span className="text-2xl">→</span>
                  <CurrencySelector
                    value={parsedIntent.targetCurrency}
                    onChange={(c) => setParsedIntent({ ...parsedIntent, targetCurrency: c })}
                    label="To"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm text-emerald-300">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={parsedIntent.amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setParsedIntent({ ...parsedIntent, amount: value });
                      setError('');
                    }}
                    className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 mt-1 text-xl font-bold"
                  />
                  {balance && (
                    <p className={`text-xs mt-1 ${
                      balance.value < parseUnits(parsedIntent.amount.toString(), 18) 
                        ? 'text-red-400' 
                        : 'text-emerald-400'
                    }`}>
                      Balance: {formatUnits(balance.value, 18)} {balance.symbol}
                      {balance.value < parseUnits(parsedIntent.amount.toString(), 18) && ' (Insufficient)'}
                    </p>
                  )}
                  {quote && (
                    <p className="text-xs text-emerald-300 mt-1">
                      Estimated: ~{formatUnits(quote.targetAmount, 18)} {parsedIntent.targetCurrency}
                    </p>
                  )}
                </div>

                {/* Recipient */}
                <div>
                  <label className="text-sm text-emerald-300">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                      setRecipientAddress(e.target.value);
                      setError('');
                    }}
                    placeholder="0x..."
                    className={`w-full bg-emerald-900/50 rounded-xl px-4 py-3 mt-1 font-mono text-sm ${
                      !isValidAddress && recipientAddress ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  {!isValidAddress && recipientAddress && (
                    <p className="text-xs text-red-400 mt-1">Invalid address format</p>
                  )}
                </div>

                {/* Memo */}
                <div>
                  <label className="text-sm text-emerald-300">Memo (optional)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="For groceries..."
                    className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 mt-1"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Verification Status */}
                {isVerified ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <span>✓</span> Identity Verified via Self Protocol
                  </div>
                ) : (
                  <div className="space-y-2">
                  <button
                    onClick={() => setShowVerification(true)}
                      className="w-full py-2 bg-blue-600/30 rounded-xl text-blue-300 text-sm hover:bg-blue-600/40 transition"
                  >
                      🔐 Verify Identity (Self Protocol) - Optional
                  </button>
                    <p className="text-xs text-emerald-400 text-center">
                      Verification is optional. You can send without verifying.
                    </p>
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Send button clicked', {
                      isConnected,
                      recipientAddress,
                      isValidAddress,
                      amount: parsedIntent.amount,
                      hasBalance: balance ? balance.value >= parseUnits(parsedIntent.amount.toString(), 18) : 'no balance',
                      sourceCurrency: parsedIntent.sourceCurrency,
                      targetCurrency: parsedIntent.targetCurrency,
                    });
                    executeRemittance();
                  }}
                  disabled={
                    !isConnected || 
                    !recipientAddress || 
                    !isValidAddress ||
                    parsedIntent.amount <= 0 ||
                    (balance && balance.value < parseUnits(parsedIntent.amount.toString(), 18)) ||
                    parsedIntent.sourceCurrency === parsedIntent.targetCurrency ||
                    isApproving || 
                    isSending || 
                    isApproveConfirming || 
                    isSendConfirming ||
                    isLoadingQuote
                  }
                  className="w-full py-4 bg-yellow-500 text-emerald-900 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition"
                >
                  {!isConnected ? 'Connect Wallet' :
                   !recipientAddress ? 'Enter Recipient Address' :
                   !isValidAddress ? 'Invalid Address' :
                   parsedIntent.amount <= 0 ? 'Enter Amount' :
                   (balance && balance.value < parseUnits(parsedIntent.amount.toString(), 18)) ? 'Insufficient Balance' :
                   parsedIntent.sourceCurrency === parsedIntent.targetCurrency ? 'Select Different Currencies' :
                   isLoadingQuote ? 'Loading quote...' :
                   isApproving || isApproveConfirming ? 'Approving...' :
                   isSending || isSendConfirming ? 'Sending...' :
                   isSendSuccess ? '✓ Sent!' :
                   `Send ${parsedIntent.amount} ${parsedIntent.sourceCurrency}`}
                </button>

                {isSendSuccess && sendHash && (
                  <a
                    href={`https://celoscan.io/tx/${sendHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-emerald-300 text-sm underline"
                  >
                    View on Celoscan →
                  </a>
                )}
              </div>
            )}

            {/* Supported Currencies */}
            <div className="mt-6">
              <h3 className="text-sm text-emerald-300 mb-3">Supported Currencies</h3>
              <div className="grid grid-cols-4 gap-2">
                {getActiveStablecoins().map((coin) => (
                  <div
                    key={coin.symbol}
                    className="bg-emerald-800/30 rounded-xl p-2 text-center"
                  >
                    <span className="text-xl">{coin.flag}</span>
                    <p className="text-xs font-medium mt-1">{coin.symbol}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <TransactionHistory address={address} />
        )}
      </div>

      {/* Self Protocol Verification Modal */}
      {showVerification && (
        <SelfVerification
          onVerified={() => {
            if (address && typeof window !== 'undefined') {
              try {
                localStorage.setItem(`self_verified_${address}`, 'true');
              } catch (error) {
                console.warn('Failed to save to localStorage:', error);
              }
            }
            setIsVerified(true);
            setShowVerification(false);
            setError(''); // Clear any errors
          }}
          onClose={() => {
            setShowVerification(false);
            // Don't require verification - allow sending without it
          }}
          userAddress={address || ''}
        />
      )}

      {/* Powered by Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-emerald-900/90 backdrop-blur border-t border-emerald-700/50 py-3">
        <div className="flex justify-center items-center gap-4 text-xs text-emerald-400">
          <span>Powered by</span>
          <span className="font-semibold">Mento</span>
          <span>•</span>
          <span className="font-semibold">Self Protocol</span>
          <span>•</span>
          <span className="font-semibold">Celo</span>
        </div>
      </footer>
    </main>
  );
}
