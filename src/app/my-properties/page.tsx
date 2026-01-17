'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useWeb3 } from '@/hooks/use-web3';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyPropertiesTable } from '@/components/my-properties/my-properties-table';

export default function MyPropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();
  const { firestore } = useFirebase();
  const { toast } = useToast();

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
        // Sort by registration date
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

  const { pendingProperties, verifiedProperties, rejectedProperties } = useMemo(() => {
    const pending: Property[] = [];
    const verified: Property[] = [];
    const rejected: Property[] = [];

    allProperties.forEach(prop => {
      if (prop.status === 'verified') {
        verified.push(prop);
      } else if (prop.status === 'rejected') {
        rejected.push(prop);
      } else {
        pending.push(prop);
      }
    });

    return { pendingProperties: pending, verifiedProperties: verified, rejectedProperties: rejected };
  }, [allProperties]);
  
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
                    A list of all your registered properties, sorted by their verification status.
                </p>
            </div>
             <Button asChild size="lg" className="rounded-full font-semibold">
              <Link href="/my-properties/add">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Property
              </Link>
            </Button>
        </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading your properties...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
              <TabsTrigger value="pending">
                Under Verification ({pendingProperties.length})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({verifiedProperties.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedProperties.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6">
              <MyPropertiesTable properties={pendingProperties} status="unverified" />
            </TabsContent>
            <TabsContent value="verified" className="mt-6">
              <MyPropertiesTable properties={verifiedProperties} status="verified" />
            </TabsContent>
            <TabsContent value="rejected" className="mt-6">
              <MyPropertiesTable properties={rejectedProperties} status="rejected" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
