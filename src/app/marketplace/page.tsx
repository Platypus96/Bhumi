
"use client";
import { AllProperties } from "@/components/all-properties";
import PropertiesMap from "@/components/property-map";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { getAllProperties } from "@/lib/data";
import { Property } from "@/lib/types";
import { Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore } = useFirebase();
  const { toast } = useToast();

   useEffect(() => {
    if (!firestore) return;

    const fetchProperties = async () => {
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
    };

    fetchProperties();
  }, [firestore, toast]);


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

        <Tabs defaultValue="grid">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="grid" className="mt-6">
              <AllProperties showForSaleOnly={true} />
          </TabsContent>
          <TabsContent value="map" className="mt-6">
              {!loading && properties.length > 0 ? (
                <PropertiesMap properties={properties} />
              ) : (
                <p className="text-center text-muted-foreground">Loading map data or no properties for sale.</p>
              )}
          </TabsContent>
        </Tabs>
    </div>
  );
}
