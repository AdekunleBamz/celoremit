import { NextRequest, NextResponse } from 'next/server';
import { MENTO_STABLECOINS, COUNTRY_CURRENCY_MAP, getActiveStablecoins } from '@/config/contracts';

// Lazy-load OpenAI to avoid build errors
const getOpenAI = async () => {
  const { default: OpenAI } = await import('openai');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

interface ParsedIntent {
  success: boolean;
  intent?: {
    action: 'send' | 'convert' | 'check_rate';
    amount: number;
    sourceCurrency: string;
    targetCurrency: string;
    recipient?: string;
    recipientType?: 'address' | 'contact' | 'country';
    memo?: string;
    confidence: number;
  };
  message?: string;
  suggestions?: string[];
}

const getSystemPrompt = () => `You are an AI that parses remittance requests into JSON.

Available currencies: ${getActiveStablecoins().map(c => `${c.symbol} (${c.country})`).join(', ')}

Country mappings: USA→cUSD, Europe→cEUR, Brazil→cREAL, Kenya→cKES, Philippines→PUSO, Colombia→cCOP, West Africa→eXOF

Return JSON only:
{"action":"send|convert|check_rate","amount":<number>,"sourceCurrency":"<symbol>","targetCurrency":"<symbol>","recipient":"<address or description>","recipientType":"address|contact|country","memo":"<optional>","confidence":<0-1>}

Default source to cUSD. Infer target from destination country.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ success: false, message: 'Message required' }, { status: 400 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(parseIntentFallback(message));
    }

    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: getSystemPrompt() }, { role: 'user', content: message }],
      temperature: 0.1,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return NextResponse.json(parseIntentFallback(message));

    try {
      const parsed = JSON.parse(response.trim());
      const validated = validateIntent(parsed);
      return NextResponse.json({
        success: true,
        intent: validated,
        message: formatIntent(validated),
      });
    } catch {
      return NextResponse.json(parseIntentFallback(message));
    }
  } catch (error) {
    console.error('Intent parsing error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process' }, { status: 500 });
  }
}

function validateIntent(p: any) {
  const validCurrencies = Object.keys(MENTO_STABLECOINS);
  return {
    action: ['send', 'convert', 'check_rate'].includes(p.action) ? p.action : 'send',
    amount: Number(p.amount) || 0,
    sourceCurrency: validCurrencies.includes(p.sourceCurrency) ? p.sourceCurrency : 'cUSD',
    targetCurrency: validCurrencies.includes(p.targetCurrency) ? p.targetCurrency : 'cUSD',
    recipient: p.recipient,
    recipientType: p.recipientType || 'country',
    memo: p.memo,
    confidence: Math.min(1, Math.max(0, Number(p.confidence) || 0.5)),
  };
}

function parseIntentFallback(message: string): ParsedIntent {
  const lower = message.toLowerCase();
  let action: 'send' | 'convert' | 'check_rate' = 'send';
  if (lower.includes('convert') || lower.includes('swap')) action = 'convert';
  if (lower.includes('rate') || lower.includes('price')) action = 'check_rate';

  const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  let sourceCurrency = 'cUSD';
  if (lower.includes('euro') || lower.includes('ceur')) sourceCurrency = 'cEUR';
  else if (lower.includes('real') || lower.includes('creal')) sourceCurrency = 'cREAL';

  let targetCurrency = 'cUSD';
  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (lower.includes(country)) { targetCurrency = currency; break; }
  }

  let recipient: string | undefined;
  let recipientType: 'address' | 'contact' | 'country' = 'country';
  const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
  if (addressMatch) { recipient = addressMatch[0]; recipientType = 'address'; }

  if (amount === 0) {
    return { success: false, message: 'Could not understand amount', suggestions: ['Try: "Send $50 to Philippines"'] };
  }

  const intent = { action, amount, sourceCurrency, targetCurrency, recipient, recipientType, confidence: 0.7 };
  return { success: true, intent, message: formatIntent(intent) };
}

function formatIntent(i: any): string {
  const src = MENTO_STABLECOINS[i.sourceCurrency as keyof typeof MENTO_STABLECOINS];
  const tgt = MENTO_STABLECOINS[i.targetCurrency as keyof typeof MENTO_STABLECOINS];
  if (i.action === 'send') return `Send ${i.amount} ${src?.symbol} ${src?.flag || ''} → ${tgt?.symbol} ${tgt?.flag || ''}`;
  if (i.action === 'convert') return `Convert ${i.amount} ${src?.symbol} to ${tgt?.symbol}`;
  return `Rate: ${src?.symbol} → ${tgt?.symbol}`;
}
