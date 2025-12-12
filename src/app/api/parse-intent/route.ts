import { NextRequest, NextResponse } from 'next/server';
import { MENTO_STABLECOINS, COUNTRY_CURRENCY_MAP, getActiveStablecoins } from '@/config/contracts';
import { getEnvVarOptional } from '@/utils/env';

// Lazy-load OpenAI to avoid build errors
const getOpenAI = async () => {
  const apiKey = getEnvVarOptional('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  const { default: OpenAI } = await import('openai');
  return new OpenAI({ apiKey });
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

IMPORTANT RULES:
1. If user explicitly mentions a currency (e.g., "cUSD", "cEUR"), that is the SOURCE currency
2. If user mentions a destination country/region (e.g., "to Europe", "to Kenya"), that determines the TARGET currency
3. Example: "send $50 cUSD to Europe" → sourceCurrency: "cUSD", targetCurrency: "cEUR"
4. Example: "send 100 cEUR to Kenya" → sourceCurrency: "cEUR", targetCurrency: "cKES"
5. If no source currency mentioned, default to cUSD
6. Extract wallet addresses from the message as recipient

Return JSON only:
{"action":"send|convert|check_rate","amount":<number>,"sourceCurrency":"<symbol>","targetCurrency":"<symbol>","recipient":"<address or description>","recipientType":"address|contact|country","memo":"<optional>","confidence":<0-1>}`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, message: 'Message required' }, { status: 400 });
    }

    // Check if OpenAI API key is available
    const apiKey = getEnvVarOptional('OPENAI_API_KEY');
    if (!apiKey) {
      // Use fallback parsing if OpenAI is not configured
      return NextResponse.json(parseIntentFallback(message));
    }

    try {
      const openai = await getOpenAI();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: getSystemPrompt() }, { role: 'user', content: message }],
        temperature: 0.1,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return NextResponse.json(parseIntentFallback(message));
      }

      try {
        // Try to parse JSON response
        const cleanedResponse = response.trim().replace(/^```json\s*|\s*```$/g, '');
        const parsed = JSON.parse(cleanedResponse);
        const validated = validateIntent(parsed);
        return NextResponse.json({
          success: true,
          intent: validated,
          message: formatIntent(validated),
        });
      } catch (parseError) {
        // If JSON parsing fails, use fallback
        console.warn('Failed to parse OpenAI response:', parseError);
        return NextResponse.json(parseIntentFallback(message));
      }
    } catch (openaiError: unknown) {
      // If OpenAI API fails, fall back to rule-based parsing
      console.warn('OpenAI API error, using fallback:', openaiError);
      return NextResponse.json(parseIntentFallback(message));
    }
  } catch (error) {
    console.error('Intent parsing error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

interface RawIntent {
  action?: string;
  amount?: number | string;
  sourceCurrency?: string;
  targetCurrency?: string;
  recipient?: string;
  recipientType?: string;
  memo?: string;
  confidence?: number | string;
}

function validateIntent(p: RawIntent): NonNullable<ParsedIntent['intent']> {
  const validCurrencies = Object.keys(MENTO_STABLECOINS);
  const validActions: Array<'send' | 'convert' | 'check_rate'> = ['send', 'convert', 'check_rate'];
  
  return {
    action: (validActions.includes(p.action as any) ? p.action : 'send') as 'send' | 'convert' | 'check_rate',
    amount: Math.max(0, Number(p.amount) || 0),
    sourceCurrency: validCurrencies.includes(p.sourceCurrency || '') ? (p.sourceCurrency as string) : 'cUSD',
    targetCurrency: validCurrencies.includes(p.targetCurrency || '') ? (p.targetCurrency as string) : 'cUSD',
    recipient: p.recipient,
    recipientType: (p.recipientType === 'address' || p.recipientType === 'contact' || p.recipientType === 'country') 
      ? p.recipientType 
      : 'country',
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

  // First, check for explicit currency mentions in the message (source currency)
  let sourceCurrency = 'cUSD'; // Default
  const currencyPatterns: Record<string, string> = {
    'cusd': 'cUSD',
    'ceur': 'cEUR', 'euro': 'cEUR',
    'creal': 'cREAL', 'real': 'cREAL',
    'ckes': 'cKES', 'kes': 'cKES',
    'puso': 'PUSO', 'peso': 'PUSO',
    'ccop': 'cCOP', 'cop': 'cCOP',
    'exof': 'eXOF', 'xof': 'eXOF', 'cfa': 'eXOF',
  };

  // Check for explicit currency mentions (prioritize source currency detection)
  for (const [pattern, currency] of Object.entries(currencyPatterns)) {
    if (lower.includes(pattern)) {
      sourceCurrency = currency;
      break; // First match wins for source
    }
  }

  // Then, check for destination country/region to determine target currency
  let targetCurrency = 'cUSD'; // Default
  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (lower.includes(country)) {
      targetCurrency = currency;
      // If target currency matches source, keep default or use a different default
      if (targetCurrency === sourceCurrency) {
        targetCurrency = sourceCurrency === 'cUSD' ? 'cEUR' : 'cUSD';
      }
      break;
    }
  }

  // If no target found but we have a source, try to infer from context
  // (e.g., "send to europe" should set target to cEUR)
  if (targetCurrency === 'cUSD' && sourceCurrency !== 'cUSD') {
    // If source is specified but no target country found, keep default
    // This will be handled by the AI in production
  }

  let recipient: string | undefined;
  let recipientType: 'address' | 'contact' | 'country' = 'country';
  const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
  if (addressMatch) { 
    recipient = addressMatch[0]; 
    recipientType = 'address'; 
  }

  if (amount === 0) {
    return { success: false, message: 'Could not understand amount', suggestions: ['Try: "Send $50 to Philippines"'] };
  }

  const intent = { action, amount, sourceCurrency, targetCurrency, recipient, recipientType, confidence: 0.7 };
  return { success: true, intent, message: formatIntent(intent) };
}

function formatIntent(i: NonNullable<ParsedIntent['intent']>): string {
  const src = MENTO_STABLECOINS[i.sourceCurrency as keyof typeof MENTO_STABLECOINS];
  const tgt = MENTO_STABLECOINS[i.targetCurrency as keyof typeof MENTO_STABLECOINS];
  if (i.action === 'send') return `Send ${i.amount} ${src?.symbol} ${src?.flag || ''} → ${tgt?.symbol} ${tgt?.flag || ''}`;
  if (i.action === 'convert') return `Convert ${i.amount} ${src?.symbol} to ${tgt?.symbol}`;
  return `Rate: ${src?.symbol} → ${tgt?.symbol}`;
}

