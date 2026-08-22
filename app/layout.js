import { Rajdhani, JetBrains_Mono } from 'next/font/google';
import SwRegister from '@/components/SwRegister';
import './globals.css';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata = {
  title: 'BSC GRID // Live Chain Board',
  description:
    'Live price board for BNB Smart Chain (BSC) ecosystem coins — real-time market data, sparklines, and detail charts.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BSC GRID',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  themeColor: '#06070a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${rajdhani.variable} ${jetbrains.variable}`}>
      <body>
        <div className="streaks" />
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
