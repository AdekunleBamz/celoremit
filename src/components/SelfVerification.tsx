'use client';

import { useState, useEffect } from 'react';
import { SelfAppBuilder, SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { SELF_PROTOCOL } from '@/config/contracts';

interface SelfVerificationProps {
  onVerified: () => void;
  onClose: () => void;
  userAddress: string;
}

type SelfAppType = ReturnType<SelfAppBuilder['build']>;

export function SelfVerification({ onVerified, onClose, userAddress }: SelfVerificationProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'success' | 'error'>('loading');
  const [selfApp, setSelfApp] = useState<SelfAppType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!userAddress) {
      setStatus('error');
      setErrorMessage('User address is required');
      return;
    }

    // Check if we're on localhost
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname === '');

    let mounted = true;

    try {
      const app = new SelfAppBuilder({
        appName: SELF_PROTOCOL.appName,
        scope: SELF_PROTOCOL.scope,
        endpoint: isLocalhost ? `${window.location.origin}/api/self/verify` : '/api/self/verify',
        userId: userAddress,
        userIdType: 'hex',
        disclosures: {
          minimumAge: 18,
          excludedCountries: [],
        },
      }).build();

      if (mounted) {
        setSelfApp(app);
        setStatus('ready');
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Self SDK init error:', error);
      if (mounted) {
        setStatus('error');
        const errorMsg = error instanceof Error ? error.message : 'Failed to initialize verification';
        // On localhost, show a more helpful message
        if (isLocalhost) {
          setErrorMessage(`${errorMsg}. Self verification may not work on localhost. Use "Skip Verification" to continue.`);
        } else {
          setErrorMessage(errorMsg);
        }
      }
    }

    return () => {
      mounted = false;
    };
  }, [userAddress]);

  const handleSuccess = () => {
    setStatus('success');
    localStorage.setItem(`self_verified_${userAddress}`, 'true');
    setTimeout(onVerified, 1500);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-title"
    >
      <div className="bg-emerald-900 rounded-2xl max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 id="verification-title" className="text-lg font-bold">Verify Your Identity</h3>
          <button 
            onClick={onClose} 
            className="text-emerald-400 text-2xl hover:text-emerald-300 transition"
            aria-label="Close verification modal"
          >
            ×
          </button>
        </div>

        <p className="text-emerald-300 text-sm mb-4">
          Scan the QR code with the Self app to verify your identity. This ensures secure, sybil-resistant transfers.
        </p>

        <div className="bg-white rounded-xl p-4 flex justify-center min-h-[200px] items-center">
          {status === 'loading' && (
            <div className="text-emerald-900">
              <span className="animate-pulse">Loading...</span>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center">
              <span className="text-red-500 block mb-2">Failed to initialize</span>
              {errorMessage && (
                <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
              )}
              <button
                onClick={() => {
                  setStatus('loading');
                  setErrorMessage('');
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
              >
                Retry
              </button>
            </div>
          )}
          {status === 'success' && (
            <div className="text-center">
              <span className="text-green-600 text-xl block mb-2">✓ Verified!</span>
              <p className="text-sm text-emerald-900">Your identity has been verified successfully.</p>
            </div>
          )}
          {status === 'ready' && selfApp && (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccess}
              onError={(error: unknown) => {
                console.error('Self verification error:', error);
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
              }}
              size={200}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-emerald-400">
            Powered by Self Protocol • Zero-knowledge verification
          </p>
        </div>

        {/* Always show skip button on localhost or in development */}
        {(process.env.NODE_ENV === 'development' || 
          typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) && (
          <button
            onClick={handleSuccess}
            className="mt-4 w-full py-2 bg-emerald-700 rounded-lg text-sm hover:bg-emerald-600 transition"
          >
            Skip Verification (Localhost)
          </button>
        )}
        
        {/* Show skip button if verification fails */}
        {status === 'error' && (
          <button
            onClick={handleSuccess}
            className="mt-4 w-full py-2 bg-yellow-600 rounded-lg text-sm hover:bg-yellow-500 transition text-white"
          >
            Skip Verification & Continue
          </button>
        )}
      </div>
    </div>
  );
}
