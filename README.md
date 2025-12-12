# 💸 CeloRemit - AI-Powered Intent-Based Remittance Router

Send money globally using natural language. Just say "Send $50 to my mom in Philippines" and CeloRemit handles the rest.

## 🌟 Features

- **🤖 Natural Language Processing**: AI parses your intent - just describe what you want to send
- **🌍 15 Mento Stablecoins**: Support for currencies across 4 continents
- **🔐 Self Protocol Integration**: Privacy-preserving identity verification
- **📱 Farcaster Mini App**: Native social experience
- **⚡ Instant FX**: Real-time currency conversion via Mento

## 💰 Supported Currencies

| Currency | Symbol | Country | Status |
|----------|--------|---------|--------|
| 🇺🇸 US Dollar | cUSD | United States | ✅ Active |
| 🇪🇺 Euro | cEUR | European Union | ✅ Active |
| 🇧🇷 Brazilian Real | cREAL | Brazil | ✅ Active |
| 🇰🇪 Kenyan Shilling | cKES | Kenya | ✅ Active |
| 🇵🇭 Philippine Peso | PUSO | Philippines | ✅ Active |
| 🇨🇴 Colombian Peso | cCOP | Colombia | ✅ Active |
| 🌍 CFA Franc | eXOF | West Africa | ✅ Active |
| 🇳🇬 Nigerian Naira | cNGN | Nigeria | 🔜 Coming |
| 🇬🇭 Ghanaian Cedi | cGHS | Ghana | 🔜 Coming |
| 🇯🇵 Japanese Yen | cJPY | Japan | 🔜 Coming |
| 🇨🇭 Swiss Franc | cCHF | Switzerland | 🔜 Coming |
| 🇬🇧 British Pound | cGBP | United Kingdom | 🔜 Coming |
| 🇦🇺 Australian Dollar | cAUD | Australia | 🔜 Coming |
| 🇨🇦 Canadian Dollar | cCAD | Canada | 🔜 Coming |
| 🇿🇦 South African Rand | cZAR | South Africa | 🔜 Coming |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key (for AI parsing)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/celoremit.git
cd celoremit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run development server
npm run dev
```

### Deploy Contract

```bash
# Using Foundry
forge create contracts/CeloRemit.sol:CeloRemit \
  --rpc-url https://forno.celo.org \
  --private-key YOUR_PRIVATE_KEY

# Update CELOREMIT_ADDRESS in src/config/contracts.ts
```

## 📖 How It Works

### 1. Natural Language Intent
User types: "Send $50 to Kenya"

### 2. AI Parsing
OpenAI extracts:
- Amount: 50
- Source: cUSD (default)
- Target: cKES (Kenya)
- Action: send

### 3. Smart Routing
CeloRemit finds the best route through Mento's exchange.

### 4. Execution
- Token approval
- FX conversion via Mento Broker
- Transfer to recipient

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Farcaster Mini App                   │
│                   @farcaster/miniapp-sdk                │
├─────────────────────────────────────────────────────────┤
│                     Next.js Frontend                    │
│              Natural Language Input + UI                │
├─────────────────────────────────────────────────────────┤
│                    AI Intent Parser                     │
│              OpenAI GPT-4o-mini API                     │
├─────────────────────────────────────────────────────────┤
│                   Smart Contracts                       │
│    CeloRemit.sol → Mento Broker → Token Transfer        │
├─────────────────────────────────────────────────────────┤
│                   Self Protocol                         │
│           Privacy-preserving verification               │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Track Eligibility

| Track | Prize | Status |
|-------|-------|--------|
| **Mini App** | 6000 CELO | ✅ Ready |
| **Self Protocol** | +$250 | ✅ Integrated |
| **Mento Track** | TBD | ✅ Uses all Mento stablecoins |
| **Open Track** | Prize pool | ✅ Ready |

## 📱 Farcaster Mini App Setup

1. Deploy to Vercel: `vercel deploy`
2. Update URLs in `public/.well-known/farcaster.json`
3. Generate account association via [Warpcast Developer Tools](https://warpcast.com/~/developers)
4. Add to your Farcaster profile

## 🔐 Self Protocol Integration

CeloRemit uses Self Protocol for:
- **Sybil Resistance**: Prevent abuse of the transfer system
- **Age Verification**: Ensure 18+ for financial services
- **Privacy**: Zero-knowledge proofs - no personal data stored

### Self Protocol Setup

**No API Keys Required!** Self Protocol is decentralized and doesn't require API keys.

**For Development (Localhost):**
- Verification works in development mode without full ZK proof verification
- Use "Skip Verification" button for testing on localhost

**For Production:**
1. Install the backend verifier:
   ```bash
   npm install @selfxyz/core
   ```
2. Uncomment the verification code in `src/app/api/self/verify/route.ts`
3. The verifier will automatically verify ZK proofs using the Self Protocol hub

**Configuration:**
- Hub Address: `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF` (Celo mainnet)
- RPC URL: `https://forno.celo.org`
- No API keys or authentication needed!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Blockchain**: Wagmi, Viem, Celo L2
- **AI**: OpenAI GPT-4o-mini
- **Identity**: Self Protocol (@selfxyz/qrcode)
- **Mini App**: @farcaster/miniapp-sdk

## 📝 API Reference

### Parse Intent
```typescript
POST /api/parse-intent
Body: { message: "Send $50 to Philippines" }
Response: {
  success: true,
  intent: {
    action: "send",
    amount: 50,
    sourceCurrency: "cUSD",
    targetCurrency: "PUSO",
    confidence: 0.95
  }
}
```

### Self Verification
```typescript
POST /api/self/verify
Body: { proof, publicSignals, userId }
Response: { success: true, userId, timestamp }
```

## 🌐 Resources

- [Mento Documentation](https://docs.mento.org)
- [Self Protocol](https://self.xyz)
- [Farcaster Mini Apps](https://miniapps.farcaster.xyz)
- [Celo Documentation](https://docs.celo.org)

## 📄 License

MIT License - see LICENSE file

---

Built with 💚 for Celo Proof of Ship
