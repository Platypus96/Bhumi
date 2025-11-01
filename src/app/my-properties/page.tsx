"use client";

import { useState, useEffect } from "react";
import { getPropertiesByOwner } from "@/lib/data";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase/provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();
  const { db } = useFirebase();

  useEffect(() => {
    if (account && db) {
      const fetchProperties = async () => {
        setLoading(true);
        const myProps = await getPropertiesByOwner(db, account);
        setProperties(myProps);
        setLoading(false);
      };
      fetchProperties();
    } else {
      setProperties([]);
      setLoading(false);
    }
  }, [account, db]);

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
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
            My Properties
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            A list of properties registered to your wallet address.
            </p>
        </div>
        <Button asChild>
            <Link href="/my-properties/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Property
            </Link>
        </Button>
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
        <>
            {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((prop) => (
                        <PropertyCard key={prop.parcelId} property={prop} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-medium text-muted-foreground">You do not own any properties yet.</h3>
                    <p className="text-muted-foreground mt-2">Get started by submitting a new property for registration.</p>
                </div>
            )}
        </>
      )}
    </div>
  );
}
