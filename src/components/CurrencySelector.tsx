'use client';

import { useState } from 'react';
import { MENTO_STABLECOINS, getActiveStablecoins } from '@/config/contracts';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  label: string;
}

export function CurrencySelector({ value, onChange, label }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCoin = MENTO_STABLECOINS[value as keyof typeof MENTO_STABLECOINS];
  const activeCurrencies = getActiveStablecoins();

  return (
    <div className="relative">
      <label className="text-xs text-emerald-400 mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-emerald-700/50 rounded-xl px-3 py-2 min-w-[120px]"
      >
        <span className="text-xl">{selectedCoin?.flag || '🌍'}</span>
        <span className="font-semibold">{value}</span>
        <span className="text-xs ml-auto">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 top-full mt-1 left-0 bg-emerald-800 rounded-xl shadow-xl max-h-60 overflow-y-auto w-48">
            {activeCurrencies.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => {
                  onChange(coin.symbol);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-700 text-left ${
                  coin.symbol === value ? 'bg-emerald-600' : ''
                }`}
              >
                <span className="text-lg">{coin.flag}</span>
                <div>
                  <p className="font-semibold text-sm">{coin.symbol}</p>
                  <p className="text-xs text-emerald-300">{coin.country}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
