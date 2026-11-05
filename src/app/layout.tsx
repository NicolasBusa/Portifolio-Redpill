import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/jetbrains-mono';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

const origin = getSiteUrl();

export const metadata: Metadata = {
  title: 'Portfólio Matrix',
  metadataBase: new URL(origin ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <noscript><style>{`.portfolio [style*="opacity:0;"], .portfolio [style$="opacity:0"] { opacity: 1 !important; transform: none !important; } .matrix-js-only, .matrix-decorative-motion { display: none !important; }`}</style></noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
