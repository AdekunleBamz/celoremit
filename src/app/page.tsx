'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
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

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
  const [farcasterSdk, setFarcasterSdk] = useState<any>(null);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const context = await sdk.context;
        if (context) {
          setIsMiniApp(true);
          setFarcasterSdk(sdk);
          await sdk.actions.ready();
        }
      } catch (e) {
        console.log('Not in Farcaster context');
      }
    };
    initMiniApp();
  }, []);

  const connectWallet = async () => {
    try {
      if (isMiniApp && farcasterSdk) {
        await farcasterSdk.wallet.ethProvider.request({
          method: 'eth_requestAccounts',
        });
      } else if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Connection failed:', error);
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    }
  };

  const sourceToken = parsedIntent 
    ? MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS] 
    : null;

  const { data: balance } = useBalance({
    address,
    token: sourceToken?.address as `0x${string}`,
  });

  const { data: approveHash, writeContract: approveToken, isPending: isApproving } = useWriteContract();
  const { data: sendHash, writeContract: sendRemittance, isPending: isSending } = useWriteContract();
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isSendConfirming, isSuccess: isSendSuccess } = useWaitForTransactionReceipt({ hash: sendHash });

  const parseIntent = async () => {
    if (!inputText.trim()) return;
    setIsParsing(true);
    setParseMessage('');

    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, userAddress: address }),
      });
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
      setParseMessage('Failed to process your request');
      setParsedIntent(null);
    }
    setIsParsing(false);
  };

  const executeRemittance = async () => {
    if (!parsedIntent || !recipientAddress || !address) return;

    const sourceTokenInfo = MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS];
    const targetTokenInfo = MENTO_STABLECOINS[parsedIntent.targetCurrency as keyof typeof MENTO_STABLECOINS];

    if (!sourceTokenInfo || !targetTokenInfo) return;

    const amount = parseUnits(parsedIntent.amount.toString(), 18);

    approveToken({
      address: sourceTokenInfo.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CELOREMIT_ADDRESS as `0x${string}`, amount],
    });
  };

  useEffect(() => {
    if (approveHash && !isApproveConfirming && parsedIntent && recipientAddress) {
      const sourceTokenInfo = MENTO_STABLECOINS[parsedIntent.sourceCurrency as keyof typeof MENTO_STABLECOINS];
      const targetTokenInfo = MENTO_STABLECOINS[parsedIntent.targetCurrency as keyof typeof MENTO_STABLECOINS];
      const amount = parseUnits(parsedIntent.amount.toString(), 18);
      const minTarget = (amount * BigInt(95)) / BigInt(100);

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
          memo,
        ],
      });
    }
  }, [approveHash, isApproveConfirming]);

  const quickActions = ['Send $50 to Kenya', 'Transfer 100 cUSD to Philippines', 'Convert 200 cEUR to cKES'];

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isApproving || isApproveConfirming) return 'Approving...';
    if (isSending || isSendConfirming) return 'Sending...';
    if (isSendSuccess) return '✓ Sent!';
    if (parsedIntent) return 'Send ' + parsedIntent.amount + ' ' + parsedIntent.sourceCurrency;
    return 'Send';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      parseIntent();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-950 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-emerald-900/80 border-b border-emerald-700/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <h1 className="text-xl font-bold">CeloRemit</h1>
          </div>
          {isConnected ? (
            <button onClick={() => disconnect()} className="px-3 py-1.5 bg-emerald-700/50 rounded-full text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button onClick={connectWallet} className="px-4 py-1.5 bg-yellow-500 text-emerald-900 rounded-full text-sm font-semibold hover:bg-yellow-400 transition">
              Connect
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex gap-2 bg-emerald-800/30 rounded-xl p-1">
          <button onClick={() => setActiveTab('send')} className={'flex-1 py-2 rounded-lg text-sm font-medium transition ' + (activeTab === 'send' ? 'bg-emerald-600 text-white' : 'text-emerald-300')}>
            💸 Send
          </button>
          <button onClick={() => setActiveTab('history')} className={'flex-1 py-2 rounded-lg text-sm font-medium transition ' + (activeTab === 'history' ? 'bg-emerald-600 text-white' : 'text-emerald-300')}>
            📜 History
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {activeTab === 'send' && (
          <div>
            <div className="mt-4 bg-emerald-800/30 rounded-2xl p-4">
              <label className="text-sm text-emerald-300 mb-2 block">Tell me what you want to send 🤖</label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send $50 to my mom in Philippines..."
                  className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 text-white placeholder-emerald-400/50 resize-none h-20 pr-12"
                />
                <button onClick={parseIntent} disabled={isParsing || !inputText.trim()} className="absolute right-2 bottom-2 p-2 bg-yellow-500 rounded-lg text-emerald-900 disabled:opacity-50 hover:bg-yellow-400 transition">
                  {isParsing ? '⏳' : '✨'}
                </button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {quickActions.map((action) => (
                  <button key={action} onClick={() => setInputText(action)} className="text-xs px-3 py-1 bg-emerald-700/30 rounded-full text-emerald-300 hover:bg-emerald-700/50 transition">
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {parseMessage && (
              <div className={'mt-4 p-4 rounded-xl ' + (parsedIntent ? 'bg-emerald-700/30' : 'bg-red-900/30')}>
                <p className="text-lg font-semibold">{parseMessage}</p>
                {parsedIntent && <p className="text-sm text-emerald-300 mt-1">Confidence: {Math.round(parsedIntent.confidence * 100)}%</p>}
              </div>
            )}

            {parsedIntent && (
              <div className="mt-4 bg-emerald-800/30 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <CurrencySelector value={parsedIntent.sourceCurrency} onChange={(c) => setParsedIntent({ ...parsedIntent, sourceCurrency: c })} label="From" />
                  <span className="text-2xl">→</span>
                  <CurrencySelector value={parsedIntent.targetCurrency} onChange={(c) => setParsedIntent({ ...parsedIntent, targetCurrency: c })} label="To" />
                </div>

                <div>
                  <label className="text-sm text-emerald-300">Amount</label>
                  <input type="number" value={parsedIntent.amount} onChange={(e) => setParsedIntent({ ...parsedIntent, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 mt-1 text-xl font-bold" />
                  {balance && <p className="text-xs text-emerald-400 mt-1">Balance: {formatUnits(balance.value, 18)} {balance.symbol}</p>}
                </div>

                <div>
                  <label className="text-sm text-emerald-300">Recipient Address</label>
                  <input type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="0x..." className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 mt-1 font-mono text-sm" />
                </div>

                <div>
                  <label className="text-sm text-emerald-300">Memo (optional)</label>
                  <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="For groceries..." className="w-full bg-emerald-900/50 rounded-xl px-4 py-3 mt-1" />
                </div>

                {isVerified ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <span>✓</span> Identity Verified via Self Protocol
                  </div>
                ) : (
                  <button onClick={() => setShowVerification(true)} className="w-full py-2 bg-blue-600/30 rounded-xl text-blue-300 text-sm hover:bg-blue-600/50 transition">
                    🔐 Verify Identity (Self Protocol)
                  </button>
                )}

                <button onClick={executeRemittance} disabled={!isConnected || !recipientAddress || isApproving || isSending || isApproveConfirming || isSendConfirming} className="w-full py-4 bg-yellow-500 text-emerald-900 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-yellow-400 transition">
                  {getButtonText()}
                </button>

                {isSendSuccess && sendHash && (
                  <a href={'https://celoscan.io/tx/' + sendHash} target="_blank" rel="noopener noreferrer" className="block text-center text-emerald-300 text-sm underline">
                    View on Celoscan →
                  </a>
                )}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm text-emerald-300 mb-3">Supported Currencies</h3>
              <div className="grid grid-cols-4 gap-2">
                {getActiveStablecoins().map((coin) => (
                  <div key={coin.symbol} className="bg-emerald-800/30 rounded-xl p-2 text-center">
                    <span className="text-xl">{coin.flag}</span>
                    <p className="text-xs font-medium mt-1">{coin.symbol}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && <TransactionHistory address={address} />}
      </div>

      {showVerification && (
        <SelfVerification
          onVerified={() => { setIsVerified(true); setShowVerification(false); }}
          onClose={() => setShowVerification(false)}
          userAddress={address || ''}
        />
      )}

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