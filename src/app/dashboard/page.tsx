
"use client";

import { useState, useMemo, useCallback }mport { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/lib/types";
import { collection, onSnapshot, query, where, Query } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2, Map as MapIcon, List, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

import { DashboardStats } from "@/components/dashboard/stats";
import { TaskList } from "@/components/dashboard/task-list";
import { MapDisplay } from "@/components/dashboard/map-display";

export type PropertyStatusFilter = "all" | "pending" | "verified";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const isMobile = useIsMobile();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filter, setFilter] = useState<PropertyStatusFilter>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  
  // Use a single listener for all properties
  useEffect(() => {
    if (!firestore || !isRegistrar) {
        setLoading(false);
        return;
    };
    setLoading(true);

    const propertiesCollection = collection(firestore, 'artifacts/default-app-id/public/data/properties');
    const q = query(propertiesCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const props = querySnapshot.docs.map(doc => doc.data() as Property);
      // Sort once here
      props.sort((a, b) => (b.registeredAt?.toMillis() || 0) - (a.registeredAt?.toMillis() || 0));
      setProperties(props);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch properties:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch properties.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, isRegistrar, toast]);

  const handleSelectProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
    if (isMobile) {
      setMobileView("map"); // Switch to map view on mobile when a property is selected
    }
  }, [isMobile]);

  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (filter === "pending") {
      filtered = properties.filter(p => !p.status || p.status === 'unverified');
    } else if (filter === "verified") {
      filtered = properties.filter(p => p.status === 'verified');
    }
    
    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.parcelId.toLowerCase().includes(lowercasedTerm) ||
            p.owner.toLowerCase().includes(lowercasedTerm)
        );
    }
    
    return filtered;
  }, [properties, filter, searchTerm]);
  
  const stats = useMemo(() => ({
    pending: properties.filter(p => !p.status || p.status === 'unverified').length,
    verified: properties.filter(p => p.status === 'verified').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  }), [properties]);


  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Please connect your wallet to access this page.</AlertDescription>
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
          <AlertDescription>Only the registrar can access this dashboard.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <Button onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}>
                {mobileView === 'list' ? <MapIcon className="mr-2" /> : <List className="mr-2" />}
                Switch to {mobileView === 'list' ? 'Map View' : 'List View'}
            </Button>
          </div>
          {mobileView === 'list' ? (
             <TaskList
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={handleSelectProperty}
                filter={filter}
                onFilterChange={setFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
             />
          ) : (
             <MapDisplay 
                properties={filteredProperties}
                selectedProperty={selectedProperty}
             />
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-10 lg:col-span-4 xl:col-span-3">
          <TaskList
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={handleSelectProperty}
            filter={filter}
            onFilterChange={setFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <div className="col-span-10 lg:col-span-6 xl:col-span-7">
          <MapDisplay 
            properties={filteredProperties}
            selectedProperty={selectedProperty}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registrar Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Review, verify, and manage property registrations on the blockchain.
                </p>
            </div>
            
            {/* Stats */}
            <DashboardStats stats={stats} currentFilter={filter} onFilterChange={setFilter} />

            {/* Main Content Area */}
            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
    </div>
  );
}

