import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/navbar';
import { Web3Provider } from '@/hooks/use-web3';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Manrope, Lora } from 'next/font/google';

// Font configuration
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
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
      className={`${manrope.variable} ${lora.variable}`}
    >
      <body 
        suppressHydrationWarning
        className="font-body antialiased bg-background text-foreground transition-colors duration-200"
      >
        <FirebaseProvider>
          <FirebaseClientProvider>
            <Web3Provider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </Web3Provider>
          </FirebaseClientProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
