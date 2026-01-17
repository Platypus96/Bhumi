
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/lib/types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { DashboardStats } from "@/components/dashboard/stats";
import { PropertiesTable } from "@/components/dashboard/properties-table";

export type PropertyStatusFilter = "all" | "pending" | "verified" | "rejected";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PropertyStatusFilter>("pending");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!firestore || !isRegistrar) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const propertiesCollection = collection(
      firestore,
      "artifacts/default-app-id/public/data/properties"
    );
    
    const q = query(propertiesCollection);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const props = querySnapshot.docs.map((doc) => doc.data() as Property);
        props.sort(
          (a, b) =>
            (b.registeredAt?.toMillis() || 0) -
            (a.registeredAt?.toMillis() || 0)
        );
        setAllProperties(props);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch properties:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch properties.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, isRegistrar, toast]);
  
  const filteredProperties = useMemo(() => {
    let properties = allProperties;

    // Apply status filter
    if (filter === 'pending') {
      properties = properties.filter(p => !p.status || p.status === 'unverified');
    } else if (filter === 'verified') {
      properties = properties.filter(p => p.status === 'verified');
    } else if (filter === 'rejected') {
        properties = properties.filter(p => p.status === 'rejected');
    }

    // Apply search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      properties = properties.filter(
        (p) =>
        p.title.toLowerCase().includes(lowercasedTerm) ||
        p.parcelId.toLowerCase().includes(lowercasedTerm) ||
        p.owner.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    return properties;
  }, [allProperties, filter, searchTerm]);

  const stats = useMemo(
    () => ({
      pending: allProperties.filter(
        (p) => !p.status || p.status === "unverified"
      ).length,
      verified: allProperties.filter((p) => p.status === "verified").length,
      rejected: allProperties.filter((p) => p.status === "rejected").length,
    }),
    [allProperties]
  );

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Please connect your wallet to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isRegistrar) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only the registrar can access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registrar Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review, verify, and manage property registrations on the blockchain.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats
          stats={stats}
          currentFilter={filter}
          onFilterChange={setFilter}
        />

        {/* Search and Table */}
        <div className="mt-8">
            <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title, owner, or ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Loading properties...</p>
                </div>
            ) : (
                <PropertiesTable properties={filteredProperties} />
            )}
        </div>
      </div>
    </div>
  );
}

