"use client";

import { useState, useEffect } from "react";
import { getProperties } from "@/lib/data";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const props = await getProperties();
      setProperties(props);
      setFilteredProperties(props);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    const results = properties.filter(prop =>
      prop.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.ownerAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(results);
  }, [searchTerm, properties]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
          Public Property Registry
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Search and verify properties on the Bhumi decentralized ledger.
        </p>
      </div>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by address, property ID, or owner wallet..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
          {filteredProperties.length > 0 ? (
            filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No properties found.</p>
          )}
        </div>
      )}
    </div>
  );
}
