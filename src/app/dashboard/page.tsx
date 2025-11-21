
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/lib/types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { DashboardStats } from "@/components/dashboard/stats";
import { TaskList } from "@/components/dashboard/task-list";
import { PropertyVerification } from "@/components/dashboard/property-verification";

export type PropertyStatusFilter = "all" | "pending" | "verified";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const isMobile = useIsMobile();

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
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
  
  const handleSelectProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const filteredProperties = useMemo(() => {
    let properties = allProperties;

    // Apply status filter
    if (filter === 'pending') {
      properties = properties.filter(p => !p.status || p.status === 'unverified');
    } else if (filter === 'verified') {
      properties = properties.filter(p => p.status === 'verified');
    }

    // Apply search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      properties = properties.filter(
        (p) =>
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

  const renderContent = () => {
    if (loading && allProperties.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      );
    }
    
    const taskList = (
      <TaskList
        properties={filteredProperties}
        selectedProperty={selectedProperty}
        onSelectProperty={handleSelectProperty}
        filter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={loading}
      />
    );
    
    if (isMobile) {
        return (
            <div className="p-4 space-y-4">
               { selectedProperty ? 
                 <PropertyVerification property={selectedProperty} onBack={() => setSelectedProperty(null)} /> : 
                 taskList 
               }
            </div>
        )
    }

    return (
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-10 lg:col-span-4 xl:col-span-3">
          {taskList}
        </div>
        <div className="col-span-10 lg:col-span-6 xl:col-span-7">
           <PropertyVerification property={selectedProperty} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

        {/* Main Content Area */}
        <div className="mt-8">{renderContent()}</div>
      </div>
    </div>
  );
}
