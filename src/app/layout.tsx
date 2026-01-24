import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/navbar';
import { Web3Provider } from '@/hooks/use-web3';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// SEO metadata
export const metadata: Metadata = {
  title: 'Bhumi | Decentralized Land Registry',
  description:
    'Bhumi is a blockchain-powered land registry system ensuring transparency, immutability, and secure property ownership management.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable}`}
    >
       <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 22h16'/><path d='M2 18v-1l10-4 10 4v1'/><path d='M12 2v8'/><path d='M6 18v-5'/><path d='M18 18v-5'/><path d='M2 13l10 4 10-4'/></svg>"
        />
      </head>
      <body 
        suppressHydrationWarning
        className="antialiased bg-background text-foreground transition-colors duration-200"
      >
        <FirebaseClientProvider>
          <Web3Provider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </Web3Provider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
