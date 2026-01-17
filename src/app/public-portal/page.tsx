"use client";

import { useState } from "react";
import { collection, query, getDocs } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { PublicPropertiesTable } from "@/components/public-properties-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PublicPortalPage() {
  const [location, setLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!location && !ownerName) {
      toast({
        variant: "destructive",
        title: "Search criteria needed",
        description: "Please enter a location or an owner's name to search.",
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

      const lowercasedLocation = location.toLowerCase();
      const lowercasedOwner = ownerName.toLowerCase();

      const filteredProps = allProps.filter(prop => {
        const locationMatch = lowercasedLocation 
          ? prop.location.toLowerCase().includes(lowercasedLocation) 
          : true;
        const ownerMatch = lowercasedOwner 
          ? prop.title.toLowerCase().includes(lowercasedOwner) 
          : true;
        
        return locationMatch && ownerMatch;
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
          Find registered properties by location and/or owner's name.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Search for a Property</CardTitle>
            <CardDescription>Enter a location and optionally an owner's name to find properties.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input
                        id="location"
                        placeholder="e.g., City, State, or Country"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="ownerName" className="text-sm font-medium">Owner's Name (Optional)</label>
                    <Input
                        id="ownerName"
                        placeholder="e.g., John Doe"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                    />
                </div>
                 <div className="sm:col-span-2">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search Properties
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
      
      {hasSearched && (
        <div className="mt-8">
            {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4 text-muted-foreground">Searching for properties...</p>
                </div>
            ) : (
                <PublicPropertiesTable properties={properties} />
            )}
        </div>
      )}
    </div>
  );
}
