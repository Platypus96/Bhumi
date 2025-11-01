import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Search, Store } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline sm:text-5xl md:text-6xl">
          Land Registry DApp
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
          A decentralized platform for secure and transparent property management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Link href="/public-portal" className="block hover:no-underline">
          <Card className="h-full hover:shadow-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                <Search className="h-8 w-8" />
              </div>
              <CardTitle>Public Portal</CardTitle>
              <CardDescription className="mt-2">Search and verify properties on the blockchain.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/my-properties" className="block hover:no-underline">
          <Card className="h-full hover:shadow-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                <Briefcase className="h-8 w-8" />
              </div>
              <CardTitle>My Properties</CardTitle>
              <CardDescription className="mt-2">View and manage your registered properties.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/marketplace" className="block hover:no-underline">
          <Card className="h-full hover:shadow-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                <Store className="h-8 w-8" />
              </div>
              <CardTitle>Marketplace</CardTitle>
              <CardDescription className="mt-2">Browse and purchase properties for sale.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
