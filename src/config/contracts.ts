// All 15 Mento Stablecoins on Celo Mainnet
export const MENTO_STABLECOINS = {
  cUSD: { address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as `0x${string}`, symbol: 'cUSD', name: 'Celo Dollar', decimals: 18, currency: 'USD', country: 'United States', flag: '🇺🇸', isActive: true },
  cEUR: { address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73' as `0x${string}`, symbol: 'cEUR', name: 'Celo Euro', decimals: 18, currency: 'EUR', country: 'European Union', flag: '🇪🇺', isActive: true },
  cREAL: { address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787' as `0x${string}`, symbol: 'cREAL', name: 'Celo Brazilian Real', decimals: 18, currency: 'BRL', country: 'Brazil', flag: '🇧🇷', isActive: true },
  cKES: { address: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0' as `0x${string}`, symbol: 'cKES', name: 'Celo Kenyan Shilling', decimals: 18, currency: 'KES', country: 'Kenya', flag: '🇰🇪', isActive: true },
  PUSO: { address: '0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B' as `0x${string}`, symbol: 'PUSO', name: 'Philippine Peso', decimals: 18, currency: 'PHP', country: 'Philippines', flag: '🇵🇭', isActive: true },
  cCOP: { address: '0x8A567e2aE79CA692Bd748aB832081C45de4EF982' as `0x${string}`, symbol: 'cCOP', name: 'Celo Colombian Peso', decimals: 18, currency: 'COP', country: 'Colombia', flag: '🇨🇴', isActive: true },
  eXOF: { address: '0x73F93dcc49cB8A239e2032663e9475dd5ef29A08' as `0x${string}`, symbol: 'eXOF', name: 'ECO CFA Franc', decimals: 18, currency: 'XOF', country: 'West Africa', flag: '🌍', isActive: true },
  cNGN: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cNGN', name: 'Celo Nigerian Naira', decimals: 18, currency: 'NGN', country: 'Nigeria', flag: '🇳🇬', isActive: false },
  cGHS: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cGHS', name: 'Celo Ghanaian Cedi', decimals: 18, currency: 'GHS', country: 'Ghana', flag: '🇬🇭', isActive: false },
  cZAR: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cZAR', name: 'Celo South African Rand', decimals: 18, currency: 'ZAR', country: 'South Africa', flag: '🇿🇦', isActive: false },
  cJPY: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cJPY', name: 'Celo Japanese Yen', decimals: 18, currency: 'JPY', country: 'Japan', flag: '🇯🇵', isActive: false },
  cCHF: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cCHF', name: 'Celo Swiss Franc', decimals: 18, currency: 'CHF', country: 'Switzerland', flag: '🇨🇭', isActive: false },
  cGBP: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cGBP', name: 'Celo British Pound', decimals: 18, currency: 'GBP', country: 'United Kingdom', flag: '🇬🇧', isActive: false },
  cAUD: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cAUD', name: 'Celo Australian Dollar', decimals: 18, currency: 'AUD', country: 'Australia', flag: '🇦🇺', isActive: false },
  cCAD: { address: '0x0000000000000000000000000000000000000000' as `0x${string}`, symbol: 'cCAD', name: 'Celo Canadian Dollar', decimals: 18, currency: 'CAD', country: 'Canada', flag: '🇨🇦', isActive: false },
} as const;

// Country to currency mapping for AI intent parsing
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'united states': 'cUSD', 'usa': 'cUSD', 'us': 'cUSD', 'america': 'cUSD',
  'europe': 'cEUR', 'eu': 'cEUR', 'germany': 'cEUR', 'france': 'cEUR', 'italy': 'cEUR', 'spain': 'cEUR',
  'brazil': 'cREAL', 'brasil': 'cREAL',
  'kenya': 'cKES',
  'philippines': 'PUSO',
  'colombia': 'cCOP',
  'west africa': 'eXOF', 'senegal': 'eXOF', 'ivory coast': 'eXOF', 'mali': 'eXOF',
  'nigeria': 'cNGN',
  'ghana': 'cGHS',
  'south africa': 'cZAR',
  'japan': 'cJPY',
  'switzerland': 'cCHF',
  'uk': 'cGBP', 'united kingdom': 'cGBP', 'england': 'cGBP',
  'australia': 'cAUD',
  'canada': 'cCAD',
};

export const COUNTRY_TO_STABLECOIN = COUNTRY_CURRENCY_MAP;

export const CURRENCY_TO_STABLECOIN: Record<string, keyof typeof MENTO_STABLECOINS> = {
  'usd': 'cUSD', 'dollar': 'cUSD', 'dollars': 'cUSD',
  'eur': 'cEUR', 'euro': 'cEUR', 'brl': 'cREAL', 'real': 'cREAL',
  'kes': 'cKES', 'shilling': 'cKES', 'ngn': 'cNGN', 'naira': 'cNGN',
  'xof': 'eXOF', 'cfa': 'eXOF', 'ghs': 'cGHS', 'cedi': 'cGHS',
  'zar': 'cZAR', 'rand': 'cZAR', 'php': 'PUSO', 'peso': 'PUSO',
  'jpy': 'cJPY', 'yen': 'cJPY', 'cop': 'cCOP', 'chf': 'cCHF',
  'gbp': 'cGBP', 'pound': 'cGBP', 'aud': 'cAUD', 'cad': 'cCAD',
};

// Helper functions
export const getActiveStablecoins = () => Object.values(MENTO_STABLECOINS).filter(c => c.isActive);
export const getStablecoinBySymbol = (symbol: string) => MENTO_STABLECOINS[symbol as keyof typeof MENTO_STABLECOINS];
export const getStablecoinByAddress = (address: string) => Object.values(MENTO_STABLECOINS).find(c => c.address.toLowerCase() === address.toLowerCase());
export const STABLECOIN_LIST = Object.values(MENTO_STABLECOINS);

// Self Protocol Config
export const SELF_PROTOCOL = {
  hubAddress: '0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF',
  appName: 'CeloRemit',
  scope: 'celoremit-transfer',
};

// CeloRemit Contract (deploy and update this address)
export const CELOREMIT_ADDRESS = '0x95932e0aA70B82418B94764d4275091378C149e0';

export const CELOREMIT_ABI = [
  { inputs: [{ name: "recipient", type: "address" }, { name: "sourceToken", type: "address" }, { name: "targetToken", type: "address" }, { name: "sourceAmount", type: "uint256" }, { name: "minTargetAmount", type: "uint256" }, { name: "memo", type: "string" }], name: "executeRemittance", outputs: [{ name: "remittanceId", type: "bytes32" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "sourceToken", type: "address" }, { name: "targetToken", type: "address" }, { name: "sourceAmount", type: "uint256" }], name: "getQuote", outputs: [{ name: "targetAmount", type: "uint256" }, { name: "fee", type: "uint256" }, { name: "exchangeRate", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getUserRemittances", outputs: [{ name: "", type: "bytes32[]" }], stateMutability: "view", type: "function" },
] as const;

export const ERC20_ABI = [
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

// Celo Chain Config
export const CELO_CHAIN = {
  id: 42220,
  name: 'Celo',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: ['https://forno.celo.org'] }, public: { http: ['https://forno.celo.org'] } },
  blockExplorers: { default: { name: 'Celoscan', url: 'https://celoscan.io' } },
} as const;
