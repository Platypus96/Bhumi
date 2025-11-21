
"use client";
import { AllProperties } from "@/components/all-properties";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { getAllProperties } from "@/lib/data";
import { Property } from "@/lib/types";
import { Store } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';

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

   const fetchMapProperties = useCallback(async () => {
    if (!firestore) return;

    setLoading(true);
    try {
      let allProps = await getAllProperties(firestore);
      setProperties(allProps.filter(p => p.forSale));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch properties for the map.' });
    } finally {
      setLoading(false);
    }
  }, [firestore, toast]);


  useEffect(() => {
    // Only fetch properties for the map if the map view is active
    if (activeView === 'map') {
      fetchMapProperties();
    }
  }, [activeView, fetchMapProperties]);


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
                ) : properties.length > 0 ? (
                  <PropertiesMap properties={properties} />
                ) : (
                  <p className="text-center text-muted-foreground">No properties for sale to display on the map.</p>
                )
              )}
          </TabsContent>
        </Tabs>
    </div>
  );
}
