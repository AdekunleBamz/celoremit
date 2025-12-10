'use client';

import { useState, useEffect } from 'react';
import { SelfAppBuilder, SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { SELF_PROTOCOL } from '@/config/contracts';

interface SelfVerificationProps {
  onVerified: () => void;
  onClose: () => void;
  userAddress: string;
}

export function SelfVerification({ onVerified, onClose, userAddress }: SelfVerificationProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'success' | 'error'>('loading');
  const [selfApp, setSelfApp] = useState<any>(null);

  useEffect(() => {
    if (!userAddress) return;

    try {
      const app = new SelfAppBuilder({
        appName: SELF_PROTOCOL.appName,
        scope: SELF_PROTOCOL.scope,
        endpoint: '/api/self/verify',
        userId: userAddress,
        userIdType: 'hex',
        disclosures: {
          minimumAge: 18,
          excludedCountries: [],
        },
      }).build();

      setSelfApp(app);
      setStatus('ready');
    } catch (error) {
      console.error('Self SDK init error:', error);
      setStatus('error');
    }
  }, [userAddress]);

  const handleSuccess = () => {
    setStatus('success');
    localStorage.setItem(`self_verified_${userAddress}`, 'true');
    setTimeout(onVerified, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-emerald-900 rounded-2xl max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Verify Your Identity</h3>
          <button onClick={onClose} className="text-emerald-400 text-2xl">×</button>
        </div>

        <p className="text-emerald-300 text-sm mb-4">
          Scan the QR code with the Self app to verify your identity. This ensures secure, sybil-resistant transfers.
        </p>

        <div className="bg-white rounded-xl p-4 flex justify-center min-h-[200px] items-center">
          {status === 'loading' && <span className="text-emerald-900">Loading...</span>}
          {status === 'error' && <span className="text-red-500">Failed to initialize</span>}
          {status === 'success' && <span className="text-green-600 text-xl">✓ Verified!</span>}
          {status === 'ready' && selfApp && (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccess}
              onError={(error) => {
                console.error('Self verification error:', error);
                setStatus('error');
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

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleSuccess}
            className="mt-4 w-full py-2 bg-emerald-700 rounded-lg text-sm"
          >
            [DEV] Skip Verification
          </button>
        )}
      </div>
    </div>
  );
}
