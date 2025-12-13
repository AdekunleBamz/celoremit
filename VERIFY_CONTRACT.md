# Verify Your Existing Contract

Quick guide to verify your deployed contract at:
`0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A`

## Step 1: Get Celoscan API Key

1. Go to https://celoscan.io/myapikey
2. Sign up / Log in
3. Create a new API key
4. Add to your `.env.local`:

```bash
CELOSCAN_API_KEY=your_api_key_here
```

## Step 2: Verify the Contract

Run this command:

```bash
npx hardhat verify --network celo 0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A
```

That's it! ✅

## Troubleshooting

### "Already Verified"
Great! Your contract is already verified. Check: https://celoscan.io/address/0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A#code

### "Invalid API Key"
Make sure `CELOSCAN_API_KEY` is in your `.env.local` file (not `.env`)

### "Bytecode Mismatch"
The deployed contract might be different from the current code. This is OK - you can still use the contract!

## Success!

When it works, you'll see:
```
Successfully verified contract CeloRemit on Celoscan.
https://celoscan.io/address/0xcC217F1b111cAb9E76FD9ff49b4a338441F5BA5A#code
```

---

For future deployments, use:
```bash
npm run deploy:celo  # Deploys + verifies automatically
```

