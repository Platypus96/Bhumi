
"use client";
import { AllProperties } from "@/components/all-properties";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/lib/types";
import { Store } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import { collection, query, where, onSnapshot } from "firebase/firestore";

const PropertiesMap = dynamic(() => import('@/components/property-map'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
});


export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("grid");
  const { firestore } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const propertiesCollection = collection(firestore, 'artifacts/default-app-id/public/data/properties');
    const q = query(propertiesCollection, where('forSale', '==', true));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const props = querySnapshot.docs.map(doc => doc.data() as Property);
        setProperties(props);
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch marketplace properties:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch marketplace properties.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);
  
  const hasContent = properties.length > 0;

  const MemoizedPropertiesMap = useMemo(() => {
    if (activeView === 'map' && hasContent) {
      return <PropertiesMap properties={properties} className="h-[600px]" />;
    }
    return null;
  }, [activeView, hasContent, properties]);


  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center">
               <div className="bg-primary/10 text-primary p-3 rounded-xl mr-4">
                  <Store className="h-8 w-8" />
              </div>
              Property Marketplace
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Browse and purchase properties verified on the blockchain.
            </p>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="grid" className="mt-6">
              <AllProperties showForSaleOnly={true} />
          </TabsContent>
          <TabsContent value="map" className="mt-6">
              {activeView === 'map' && (
                loading ? (
                   <div className="h-[600px] w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map Data...</p></div>
                ) : hasContent ? (
                  MemoizedPropertiesMap
                ) : (
                  <p className="text-center text-muted-foreground">No properties for sale to display on the map.</p>
                )
              )}
          </TabsContent>
        </Tabs>
    </div>
  );
}
