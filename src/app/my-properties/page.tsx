"use client";

import { useState, useEffect } from "react";
import { getProperties } from "@/lib/data";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3 } from "@/hooks/use-web3";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();

  useEffect(() => {
    if (account) {
      const fetchProperties = async () => {
        setLoading(true);
        const allProps = await getProperties();
        const myProps = allProps.filter(p => p.ownerAddress.toLowerCase() === account.toLowerCase());
        setProperties(myProps);
        setLoading(false);
      };
      fetchProperties();
    } else {
      setLoading(false);
    }
  }, [account]);

  if (!account) {
     return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>Please connect your wallet to view your properties.</AlertDescription>
            </Alert>
        </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
          My Properties
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A list of properties registered to your wallet address.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.length > 0 ? (
            properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">You do not own any properties.</p>
          )}
        </div>
      )}
    </div>
  );
}
