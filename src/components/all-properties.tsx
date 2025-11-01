"use client";

import { useState, useEffect } from "react";
import { getAllProperties } from "@/lib/data";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AllPropertiesProps {
  showForSaleOnly?: boolean;
}

export function AllProperties({ showForSaleOnly = false }: AllPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const fetchProperties = async (isManualRefresh = false) => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Firestore is not available. Please try again later.",
      });
      return;
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let allProps = await getAllProperties(firestore);

      if (showForSaleOnly) {
        allProps = allProps.filter((p) => p.forSale);
      }

      setProperties(allProps);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Fetching Properties",
        description: error.message || "Unable to retrieve property data.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // Poll every 30 seconds to reflect live updates (e.g., property purchased)
    const interval = setInterval(() => fetchProperties(), 30000);
    return () => clearInterval(interval);
  }, [showForSaleOnly, firestore]);

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {showForSaleOnly ? "Available Properties" : "All Registered Properties"}
        </h2>
        <Button
          onClick={() => fetchProperties(true)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={refreshing || loading}
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin text-green-500" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
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
                  : "Wait for the registrar to add new properties."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
