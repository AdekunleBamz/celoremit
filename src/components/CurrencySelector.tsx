'use client';

import { useState, useEffect, useRef } from 'react';
import { MENTO_STABLECOINS, getActiveStablecoins } from '@/config/contracts';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  label: string;
}

export function CurrencySelector({ value, onChange, label }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCoin = MENTO_STABLECOINS[value as keyof typeof MENTO_STABLECOINS];
  const activeCurrencies = getActiveStablecoins();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs text-emerald-400 mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 bg-emerald-700/50 rounded-xl px-3 py-2 min-w-[120px] hover:bg-emerald-700/70 transition"
      >
        <span className="text-xl" aria-hidden="true">{selectedCoin?.flag || '🌍'}</span>
        <span className="font-semibold">{value}</span>
        <span className={`text-xs ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="absolute z-50 top-full mt-1 left-0 bg-emerald-800 rounded-xl shadow-xl max-h-60 overflow-y-auto w-48"
            role="listbox"
          >
            {activeCurrencies.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => {
                  onChange(coin.symbol);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={coin.symbol === value}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-700 text-left transition ${
                  coin.symbol === value ? 'bg-emerald-600' : ''
                }`}
              >
                <span className="text-lg" aria-hidden="true">{coin.flag}</span>
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
