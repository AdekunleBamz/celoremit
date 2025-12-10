import type { Metadata, Viewport } from 'next';
import { WagmiProvider } from '@/providers/WagmiProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CeloRemit - AI-Powered Remittances',
  description: 'Send money globally using natural language. Powered by Mento stablecoins on Celo.',
  openGraph: {
    title: 'CeloRemit',
    description: 'AI-powered cross-border payments with 15 Mento stablecoins',
    images: ['/og-image.png'],
  },
  other: {
    'fc:frame': JSON.stringify({
      version: '1',
      imageUrl: 'https://celoremit.vercel.app/og-image.png',
      button: {
        title: '💸 Send Money',
        action: {
          type: 'launch_frame',
          name: 'CeloRemit',
          url: 'https://celoremit.vercel.app',
          splashImageUrl: 'https://celoremit.vercel.app/splash.png',
          splashBackgroundColor: '#0D4A3C',
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D4A3C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>{children}</WagmiProvider>
      </body>
    </html>
  );
}
