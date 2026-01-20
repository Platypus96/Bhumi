"use client";

import { useState } from "react";
import { collection, query, getDocs } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicPortalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm) {
      toast({
        variant: "destructive",
        title: "Search term required",
        description: "Please enter a search term to find properties.",
      });
      return;
    }
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Firestore is not available.",
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setProperties([]);

    try {
      const propertiesCollection = collection(firestore, 'artifacts/default-app-id/public/data/properties');
      
      // For a production app with large datasets, a dedicated search service like Algolia or Elasticsearch is recommended.
      // For this app, we'll fetch all documents and filter on the client.
      const querySnapshot = await getDocs(query(propertiesCollection));
      const allProps = querySnapshot.docs.map(doc => doc.data() as Property);

      const lowercasedTerm = searchTerm.toLowerCase();

      const filteredProps = allProps.filter(prop => {
        const locationMatch = prop.location.toLowerCase().includes(lowercasedTerm);
        const ownerNameMatch = prop.title.toLowerCase().includes(lowercasedTerm);
        const parcelIdMatch = prop.parcelId.toLowerCase().includes(lowercasedTerm);
        const ownerAddressMatch = prop.owner.toLowerCase().includes(lowercasedTerm);
        
        return locationMatch || ownerNameMatch || parcelIdMatch || ownerAddressMatch;
      });

      filteredProps.sort((a, b) => (b.registeredAt?.toMillis() || 0) - (a.registeredAt?.toMillis() || 0));
      setProperties(filteredProps);

    } catch (error) {
      console.error("Failed to search properties:", error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'An error occurred while searching for properties.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="text-left mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center">
          Public Property Search
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find registered properties by location, owner, parcel ID, or wallet address.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Search for a Property</CardTitle>
            <CardDescription>Enter a location, owner's name, parcel ID, or owner's wallet address.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full space-y-2">
                    <label htmlFor="searchTerm" className="text-sm font-medium">Search Term</label>
                    <Input
                        id="searchTerm"
                        placeholder="e.g., New York, John Doe, 0x..., or parcel ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
      
      {hasSearched && (
        <div className="mt-8">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
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
                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {properties.map((prop) => (
                        <PropertyCard key={prop.parcelId} property={prop} />
                    ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-2xl border-2 border-dashed">
                        <div className="bg-secondary p-4 rounded-full mb-6">
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground font-headline">
                            No Properties Found
                        </h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            No properties matched your search criteria. Please try a different search.
                        </p>
                    </div>
                )}
                </>
            )}
        </div>
      )}
    </div>
  );
}
