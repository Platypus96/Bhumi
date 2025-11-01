"use client";

import { useState, useEffect } from "react";
import { getAllProperties } from "@/lib/data";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";

interface AllPropertiesProps {
    showForSaleOnly?: boolean;
}

export function AllProperties({ showForSaleOnly = false }: AllPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      let allProps = await getAllProperties();
      if (showForSaleOnly) {
        allProps = allProps.filter(p => p.forSale);
      }
      setProperties(allProps);
      setLoading(false);
    };
    fetchProperties();
  }, [showForSaleOnly]);

  return (
     <>
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
                            {showForSaleOnly ? "No properties are currently for sale." : "No properties found."}
                        </h3>
                        <p className="text-muted-foreground mt-2">
                            {showForSaleOnly ? "Check back later!" : "Wait for the registrar to add properties."}
                        </p>
                    </div>
                )}
            </>
        )}
    </>
  );
}
