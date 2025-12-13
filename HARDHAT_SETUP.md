# Hardhat Setup for CeloRemit

Complete guide for deploying and verifying smart contracts using Hardhat.

## 📋 Prerequisites

- Node.js v18+ installed
- A Celo wallet with CELO tokens for gas
- Celoscan API key (for verification)

## 🔧 Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Get from https://celoscan.io/myapikey
CELOSCAN_API_KEY=your_celoscan_api_key_here

# Existing variables
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CELOREMIT_ADDRESS=0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A
```

### 2. Get Your Private Key

#### From MetaMask:
1. Open MetaMask
2. Click the three dots menu
3. Account Details → Show Private Key
4. Enter your password
5. Copy the private key

⚠️ **NEVER share your private key or commit it to Git!**

### 3. Get Celoscan API Key

1. Go to https://celoscan.io
2. Sign up / Log in
3. Go to **My Account** → **API Keys**
4. Click **Add** to create a new API key
5. Copy the API key to your `.env.local`

## 🚀 Usage

### Compile Contracts

```bash
npm run hardhat:compile
```

### Deploy to Alfajores Testnet (Recommended for testing)

```bash
npm run deploy:alfajores
```

### Deploy to Celo Mainnet

```bash
npm run deploy:celo
```

The deployment script will:
1. Deploy the CeloRemit contract
2. Wait 30 seconds for block confirmations
3. Automatically verify the contract on Celoscan
4. Display the new contract address

### Verify Existing Contract

If you have an already-deployed contract:

```bash
# Using the address from .env.local
npm run verify:celo

# Or specify a different address
CONTRACT_ADDRESS=0xYourContractAddress npm run verify:celo
```

### Manual Verification

```bash
npx hardhat verify --network celo 0xYourContractAddress
```

## 📂 Project Structure

```
celoremit-app/
├── contracts/
│   └── CeloRemit.sol          # Main smart contract
├── scripts/
│   ├── deploy.js              # Deployment script
│   └── verify.js              # Verification script
├── hardhat.config.js          # Hardhat configuration
└── .env.local                 # Environment variables (gitignored)
```

## 🔍 Verifying Your Current Contract

To verify your existing contract at `0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A`:

```bash
npx hardhat verify --network celo 0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A
```

This will use the contract code in `contracts/CeloRemit.sol` with:
- Compiler: 0.8.20
- Optimization: Enabled (200 runs)
- No constructor arguments

## ✅ Successful Verification

When verification succeeds, you'll see:
```
✅ Contract verified successfully!
```

Visit Celoscan to see your verified contract:
https://celoscan.io/address/0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A#code

## ❌ Troubleshooting

### "Already Verified"
Your contract is already verified! Check Celoscan.

### "Invalid API Key"
Make sure `CELOSCAN_API_KEY` is set in `.env.local`

### "Compilation Failed"
Run `npm run hardhat:compile` to check for errors

### "Insufficient Funds"
Add CELO to your wallet:
- Testnet: https://faucet.celo.org
- Mainnet: Buy CELO on an exchange

### "Bytecode Mismatch"
Ensure:
- The Solidity code matches what was deployed
- Compiler version is 0.8.20
- Optimization is enabled with 200 runs

## 📚 Hardhat Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests (when you add them)
npx hardhat test

# Clean build artifacts
npx hardhat clean

# Get account info
npx hardhat accounts --network celo

# Check network connection
npx hardhat node

# Get help
npx hardhat help
```

## 🌐 Networks

### Celo Mainnet
- Chain ID: 42220
- RPC: https://forno.celo.org
- Explorer: https://celoscan.io

### Alfajores Testnet
- Chain ID: 44787
- RPC: https://alfajores-forno.celo-testnet.org
- Explorer: https://alfajores.celoscan.io
- Faucet: https://faucet.celo.org

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Never share your private key**
3. **Use a separate wallet for deployments** (not your main wallet)
4. **Test on Alfajores first** before deploying to mainnet
5. **Audit your contracts** before handling real funds

## 💡 Next Steps

After deploying a new contract:

1. Update `.env.local` with the new address:
   ```
   NEXT_PUBLIC_CELOREMIT_ADDRESS=0xYourNewAddress
   ```

2. Verify the contract on Celoscan

3. Update your frontend to use the new contract

4. Test all functions thoroughly

5. Document the deployment in your README

## 🆘 Need Help?

- Hardhat Docs: https://hardhat.org/docs
- Celo Docs: https://docs.celo.org
- Celoscan: https://celoscan.io

---

**Happy Deploying! 🚀**

