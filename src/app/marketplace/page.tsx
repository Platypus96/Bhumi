'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PropertyCard } from '@/components/property-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplacePage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { firestore } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const propertiesCollection = collection(
      firestore,
      'artifacts/default-app-id/public/data/properties'
    );

    const q = query(propertiesCollection, where('forSale', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const props = querySnapshot.docs.map((doc) => doc.data() as Property);
        props.sort(
          (a, b) =>
            (b.registeredAt?.toMillis() || 0) -
            (a.registeredAt?.toMillis() || 0)
        );
        setAllProperties(props);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching properties: ', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Properties',
          description: 'Unable to retrieve property data at this time.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast]);

  const filteredProperties = useMemo(() => {
    if (!searchTerm) {
      return allProperties;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    return allProperties.filter((prop) => {
      const locationMatch = prop.location.toLowerCase().includes(lowercasedTerm);
      const titleMatch = prop.title.toLowerCase().includes(lowercasedTerm);
      const parcelIdMatch = prop.parcelId.toLowerCase().includes(lowercasedTerm);
      const ownerAddressMatch = prop.owner.toLowerCase().includes(lowercasedTerm);
      return locationMatch || titleMatch || parcelIdMatch || ownerAddressMatch;
    });
  }, [allProperties, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="text-left">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center">
          <div className="bg-primary/10 text-primary p-3 rounded-xl mr-4">
            <Building2 className="h-8 w-8" />
          </div>
          Property Marketplace
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse and purchase properties verified on the blockchain.
        </p>
      </div>
      
      <div className="mt-8">
        <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by location, title, owner address, or ID..."
                className="pl-10 h-11 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[225px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
                </div>
            ))}
            </div>
        ) : (
            <>
            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredProperties.map((prop) => (
                    <PropertyCard key={prop.parcelId} property={prop} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                  <div className="bg-secondary p-4 rounded-full mb-6 inline-block">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium text-muted-foreground">
                    No properties match your search.
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Try a different search term or browse all available properties.
                  </p>
                </div>
            )}
            </>
        )}
      </div>

    </div>
  );
}
