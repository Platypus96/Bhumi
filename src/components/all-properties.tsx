
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AllPropertiesProps {
  showForSaleOnly?: boolean;
}

export function AllProperties({ showForSaleOnly = false }: AllPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const propertiesCollection = collection(firestore, `artifacts/default-app-id/public/data/properties`);
    
    const q = showForSaleOnly 
      ? query(propertiesCollection, where('forSale', '==', true))
      : query(propertiesCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const props = querySnapshot.docs.map(doc => doc.data() as Property);
      // Sort client-side
      props.sort((a, b) => b.registeredAt.toMillis() - a.registeredAt.toMillis());
      setProperties(props);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching properties: ", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Properties",
        description: "Unable to retrieve property data at this time.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, showForSaleOnly, toast]);


  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
          <Search className="mr-3 h-6 w-6 text-primary" />
          {showForSaleOnly ? "Available Properties" : "All Registered Properties"}
        </h2>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop.parcelId} property={prop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
              <h3 className="text-xl font-medium text-muted-foreground">
                {showForSaleOnly
                  ? "No properties are currently for sale."
                  : "No properties found."}
              </h3>
              <p className="text-muted-foreground mt-2">
                {showForSaleOnly
                  ? "Check back later!"
                  : "Register a property to see it here."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
