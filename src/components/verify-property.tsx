"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPropertyByParcelId } from "@/lib/data";

export function VerifyProperty() {
  const [parcelId, setParcelId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!parcelId) {
       toast({
            variant: "destructive",
            title: "Input Required",
            description: "Please enter a Parcel ID to search.",
        });
      return;
    }
    setLoading(true);
    try {
        const property = await getPropertyByParcelId(parcelId);
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
    <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Parcel ID (e.g., 0xaddress...-1)"
            className="w-full pl-10"
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="mt-4 w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Search Property
        </Button>
    </div>
  );
}
