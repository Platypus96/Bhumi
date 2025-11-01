import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Search, Store, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="flex items-center gap-x-4">
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
          <div className="mt-10 flex items-center gap-x-6">
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
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://images.unsplash.com/photo-1593998066526-65fcab3021a2?q=80&w=2940&auto=format&fit=crop"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
