# CeloRemit Contract Deployment

## Current Deployment

**Network:** Celo Mainnet  
**Contract Address:** `0x20102f304a08911D731721CAFCC139Db96824408`  
**Deployment Date:** December 13, 2024  
**Compiler Version:** Solidity 0.8.30  
**Optimization:** Disabled  
**Verification:** ✅ Verified on Celoscan

### Links

- **Celoscan (Verified):** https://celoscan.io/address/0x20102f304a08911D731721CAFCC139Db96824408#code
- **Sourcify:** https://repo.sourcify.dev/contracts/full_match/42220/0x20102f304a08911D731721CAFCC139Db96824408/
- **Live App:** https://celoremit.vercel.app

## Contract Features

- ✅ Support for 7 Mento stablecoins (cUSD, cEUR, cREAL, cKES, PUSO, cCOP, eXOF)
- ✅ Low platform fee (0.5% / 50 basis points)
- ✅ Reentrancy protection
- ✅ SafeERC20 token transfers
- ✅ Emergency withdrawal function (owner only)
- ✅ Fee collector management

## Supported Stablecoins

| Symbol | Name | Region | Address |
|--------|------|--------|---------|
| cUSD | Celo Dollar | United States | 0x765DE816845861e75A25fCA122bb6898B8B1282a |
| cEUR | Celo Euro | European Union | 0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73 |
| cREAL | Celo Brazilian Real | Brazil | 0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787 |
| cKES | Celo Kenyan Shilling | Kenya | 0x456a3D042C0DbD3db53D5489e98dFb038553B0d0 |
| PUSO | Philippine Peso | Philippines | 0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B |
| cCOP | Celo Colombian Peso | Colombia | 0x8a567E2ae79CA692BD748aB832081c45De4eF982 |
| eXOF | CFA Franc | West Africa | 0x73F93dcc49cB8A239e2032663e9475dd5ef29A08 |

## Previous Deployments

### Version 1 (Initial)
- **Address:** 0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A
- **Status:** Verified on Sourcify only
- **Note:** Replaced due to verification requirements for Karma

## Deployment Process

The contract was deployed using Hardhat with the following configuration:

```javascript
solidity: {
  version: "0.8.30",
  settings: {
    optimizer: {
      enabled: false,
      runs: 200,
    },
  },
}
```

### To Deploy a New Version

1. Ensure PRIVATE_KEY is set in `.env.local`
2. Run: `npm run deploy:celo`
3. Update `.env.local` with new NEXT_PUBLIC_CELOREMIT_ADDRESS
4. Remove PRIVATE_KEY from `.env.local` after deployment
5. Update this file with new deployment info

## Security

- ✅ OpenZeppelin contracts (v5.4.0)
- ✅ ReentrancyGuard protection
- ✅ Ownable access control
- ✅ SafeERC20 for safe token transfers
- ✅ Verified source code on Celoscan
- ⚠️ Consider professional audit before handling large volumes

## Contract Owner

The deployer wallet retains ownership for:
- Setting platform fees (max 5%)
- Setting fee collector address
- Emergency token withdrawal

---

**Last Updated:** December 13, 2024  
**Maintained By:** CeloRemit Team

