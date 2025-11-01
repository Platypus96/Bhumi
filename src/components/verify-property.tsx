"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPropertyByParcelId } from "@/lib/data";
import { useFirebase } from "@/firebase/provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VerifyProperty() {
  const [parcelId, setParcelId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleSearch = async () => {
    if (!parcelId) {
       toast({
            variant: "destructive",
            title: "Input Required",
            description: "Please enter a Parcel ID to search.",
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
    try {
        const property = await getPropertyByParcelId(firestore, parcelId);
        if (property) {
            router.push(`/property/${parcelId}`);
        } else {
            toast({
                variant: "destructive",
                title: "Not Found",
                description: "No property found with that Parcel ID.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to search for property.",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-none border-2 border-dashed">
        <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
                <div>
                    <label htmlFor="parcelId" className="sr-only">Parcel ID</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <Input
                            id="parcelId"
                            name="parcelId"
                            type="search"
                            placeholder="Enter property parcel ID to verify..."
                            className="relative w-full rounded-r-none h-12 text-base"
                            value={parcelId}
                            onChange={(e) => setParcelId(e.target.value)}
                        />
                        <Button type="submit" disabled={loading} className="rounded-l-none h-12 bg-primary hover:bg-primary/90 text-white">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </form>
        </CardContent>
    </Card>
  );
}
