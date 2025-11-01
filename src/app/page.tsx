import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Search, Store, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-x-4">
             <div className="bg-primary/10 text-primary p-2 rounded-full">
              <Landmark className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Land Registry DApp</h1>
          </div>
          <p className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
            A Secure & Transparent Land Registry on the Blockchain
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Leverage the power of decentralization to manage, verify, and transfer property with unparalleled security and transparency. Built with Ethereum and IPFS.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild className="rounded-full">
              <Link href="/public-portal">
                Get Started
              </Link>
            </Button>
            <Button variant="link" asChild className="text-md">
              <Link href="/marketplace">
                Explore Marketplace <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
