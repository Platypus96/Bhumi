
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { PropertyCard } from '@/components/property-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeb3 } from '@/hooks/use-web3';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle, Building2, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!account || !firestore) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(firestore, 'properties'),
      where('owner', '==', account)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const myProps = querySnapshot.docs.map((doc) => doc.data() as Property);
        setProperties(myProps);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching properties:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your properties.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [account, firestore, toast]);

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your properties.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasContent = properties.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center">
                   <div className="bg-primary/10 text-primary p-3 rounded-xl mr-4">
                      <Home className="h-8 w-8" />
                  </div>
                  My Properties
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    A list of all your registered properties, including pending and verified ones.
                </p>
            </div>
             <Button asChild size="lg" className="rounded-full font-semibold">
              <Link href="/my-properties/add">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Property
              </Link>
            </Button>
        </div>


      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {hasContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((prop) => (
                <PropertyCard key={prop.parcelId} property={prop} />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-2xl border-2 border-dashed">
                <div className="bg-secondary p-4 rounded-full mb-6">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              <h3 className="text-2xl font-semibold text-foreground font-headline">
                You haven't added any properties yet.
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Get started by registering a new property on the blockchain to see it appear here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
