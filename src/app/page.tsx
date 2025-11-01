import Link from 'next/link';
import { Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Header */}
          <div className="flex items-center justify-center gap-x-3">
            <div className="bg-primary/10 p-3 rounded-full text-primary shadow-sm">
              <Landmark className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
              Bhumi
            </h1>
          </div>

          {/* Hero Text */}
          <h2 className="mt-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl font-headline">
            Secure, Transparent Land Registry on the Blockchain
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Leverage the power of decentralization to manage, verify, and transfer
            property ownership with unmatched transparency and trust. Built using
            Ethereum and IPFS for immutability and security.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild className="rounded-full px-6 py-3 text-base">
              <Link href="/public-portal">Get Started</Link>
            </Button>
            <Button variant="link" asChild className="text-md font-medium">
              <Link href="/marketplace">
                Explore Marketplace <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Background blur for premium touch */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem]
          bg-gradient-to-tr from-primary/20 to-indigo-300 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
    </div>
  );
}
