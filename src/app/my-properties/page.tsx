'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useWeb3 } from '@/hooks/use-web3';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle, Home, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/components/dashboard/stats';
import { PropertyStatusFilter } from '@/app/dashboard/page';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PropertyCard } from '@/components/property-card';

export default function MyPropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [filter, setFilter] = useState<PropertyStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!account || !firestore) {
      setAllProperties([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const propertiesCollection = collection(firestore, 'artifacts/default-app-id/public/data/properties');
    const q = query(propertiesCollection, where('owner', '==', account));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const props = querySnapshot.docs.map(doc => doc.data() as Property);
        props.sort((a, b) => (b.registeredAt?.toMillis() || 0) - (a.registeredAt?.toMillis() || 0));
        setAllProperties(props);
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch user properties:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your properties.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [account, firestore, toast]);

  const filteredProperties = useMemo(() => {
    let properties = allProperties;

    if (filter === 'pending') {
      properties = properties.filter(p => !p.status || p.status === 'unverified');
    } else if (filter === 'verified') {
      properties = properties.filter(p => p.status === 'verified');
    } else if (filter === 'rejected') {
        properties = properties.filter(p => p.status === 'rejected');
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      properties = properties.filter(
        (p) =>
          p.title.toLowerCase().includes(lowercasedTerm) ||
          p.parcelId.toLowerCase().includes(lowercasedTerm) ||
          p.location.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    return properties;
  }, [allProperties, filter, searchTerm]);

  const stats = useMemo(
    () => ({
      pending: allProperties.filter(p => !p.status || p.status === 'unverified').length,
      verified: allProperties.filter(p => p.status === 'verified').length,
      rejected: allProperties.filter(p => p.status === 'rejected').length,
    }),
    [allProperties]
  );
  
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Properties
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your registered properties and track their verification status.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/my-properties/add">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Property
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <DashboardStats
          stats={stats}
          currentFilter={filter}
          onFilterChange={setFilter}
        />

        {/* Search and Table */}
        <div className="mt-8">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, or ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[225px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProperties.map((prop) => (
                    <PropertyCard key={prop.parcelId} property={prop} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-2xl border-2 border-dashed">
                  <div className="bg-secondary p-4 rounded-full mb-6">
                    <Home className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground font-headline">
                    {allProperties.length === 0 ? "You haven't registered any properties yet." : "No properties match your filters."}
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    {allProperties.length === 0 ? "Click the button above to add your first property to the blockchain." : "Try adjusting your search or filter settings."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
