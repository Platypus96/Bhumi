
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { rejectPropertyInDb, verifyPropertyInDb } from "@/lib/data";
import { useBlockchain } from "@/hooks/use-blockchain";
import { useToast } from "@/hooks/use-toast";
import type { Property, PropertyStatus } from "@/lib/types";
import { useFirebase } from "@/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, FileText, Loader2, ShieldCheck, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HashPill } from "@/components/hash-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const { verifyProperty } = useBlockchain();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PropertyStatus>("unverified");

  useEffect(() => {
    if (!firestore || !isRegistrar) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const propertiesQuery = query(collection(firestore, 'properties'), orderBy('registeredAt', 'desc'));

    const unsubscribe = onSnapshot(propertiesQuery, (querySnapshot) => {
        const props = querySnapshot.docs.map(doc => {
            const data = doc.data() as Property;
            // Backward compatibility: If status is missing, it's 'unverified'.
            if (!data.status) {
                data.status = 'unverified';
            }
            return data;
        });
        setProperties(props);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching properties:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch properties.' });
        setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [firestore, isRegistrar, toast]);


  const handleVerify = async (property: Property) => {
    if (!firestore) return;
    setProcessingId(property.parcelId);
    try {
      await verifyProperty(property.parcelId);
      await verifyPropertyInDb(firestore, property.parcelId);
      toast({
        title: "Property Verified!",
        description: `Property is now verified on-chain.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "An error occurred.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (property: Property) => {
     if (!firestore) return;
    setProcessingId(property.parcelId);
    try {
      await rejectPropertyInDb(firestore, property.parcelId);
      toast({
        variant: "destructive",
        title: "Property Rejected",
        description: `The property registration has been marked as rejected.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "An error occurred.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  const filteredProperties = useMemo(() => {
    return properties.filter(p => (p.status || 'unverified') === activeTab);
  }, [properties, activeTab]);

  const propertyCounts = useMemo(() => {
    return properties.reduce((acc, prop) => {
      const status = prop.status || 'unverified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<PropertyStatus, number>);
  }, [properties]);


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
  
  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-12 w-20 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-3/4 mt-2" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-9 w-24" /></TableCell>
        <TableCell><Skeleton className="h-9 w-28" /></TableCell>
      </TableRow>
    ))
  );

  const StatusBadge = ({ status }: { status: PropertyStatus }) => {
    const currentStatus = status || 'unverified';
    const variants: Record<PropertyStatus, { className: string, text: string }> = {
      unverified: { className: "bg-amber-100 text-amber-800 border-amber-200", text: "Pending"},
      verified: { className: "bg-green-100 text-green-800 border-green-200", text: "Verified"},
      rejected: { className: "bg-red-100 text-red-800 border-red-200", text: "Rejected"},
    }
    return (
      <Badge variant="outline" className={`font-semibold ${variants[currentStatus].className}`}>
        {variants[currentStatus].text}
      </Badge>
    );
  };

  const renderTable = (propertiesToRender: Property[]) => (
    <div className="rounded-lg border">
      <Table>
          <TableHeader>
          <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title & Owner</TableHead>
              <TableHead className="w-[170px]">Registered At</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[130px]">Proof</TableHead>
              <TableHead className="w-[200px] text-center">Actions</TableHead>
          </TableRow>
          </TableHeader>
          <TableBody>
          {loading ? renderSkeletons() : 
          propertiesToRender.length > 0 ? (
              propertiesToRender.map((prop) => (
              <TableRow key={prop.parcelId}>
                  <TableCell>
                      <div className="relative h-12 w-20 group">
                          <Image src={prop.imageUrl} alt={prop.title} fill className="rounded-md object-cover transition-transform duration-300 group-hover:scale-125" />
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="font-bold text-base">{prop.title}</div>
                      <HashPill type="address" hash={prop.owner} className="mt-1"/>
                  </TableCell>
                  <TableCell>{format(prop.registeredAt.toDate(), "dd MMM, yyyy")}</TableCell>
                    <TableCell>
                      <StatusBadge status={prop.status || 'unverified'} />
                  </TableCell>
                  <TableCell>
                      <Button asChild variant="outline" size="sm">
                          <Link href={prop.ipfsProofCid} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              Document
                          </Link>
                      </Button>
                  </TableCell>
                  <TableCell className="text-center">
                      {(prop.status === 'unverified' || !prop.status) ? (
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200" onClick={() => handleVerify(prop)} disabled={!!processingId}>
                              {processingId === prop.parcelId ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldCheck className="h-4 w-4"/>}
                              Verify
                          </Button>
                          <Button size="sm" variant="destructive" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200" onClick={() => handleReject(prop)} disabled={!!processingId}>
                              <X className="h-4 w-4"/>
                          </Button>
                        </div>
                      ) : prop.status === 'verified' ? (
                          <div className="flex items-center justify-center text-sm text-muted-foreground italic">
                            <Check className="h-4 w-4 mr-2 text-green-500"/>
                            Completed
                          </div>
                      ) : null }
                  </TableCell>
              </TableRow>
              ))
          ) : (
              <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                  No properties in this category.
              </TableCell>
              </TableRow>
          )}
          </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl">Registrar Dashboard</CardTitle>
                <CardDescription>Review and manage new property registrations on the blockchain.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PropertyStatus)}>
                  <TabsList>
                      <TabsTrigger value="unverified">
                        Pending 
                        <Badge variant="secondary" className="ml-2">{propertyCounts.unverified || 0}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="verified">
                        Verified
                        <Badge variant="secondary" className="ml-2">{propertyCounts.verified || 0}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="rejected">
                        Rejected
                        <Badge variant="secondary" className="ml-2">{propertyCounts.rejected || 0}</Badge>
                      </TabsTrigger>
                  </TabsList>

                  <TabsContent value="unverified" className="mt-4">
                    {renderTable(filteredProperties)}
                  </TabsContent>
                  <TabsContent value="verified" className="mt-4">
                    {renderTable(filteredProperties)}
                  </TabsContent>
                   <TabsContent value="rejected" className="mt-4">
                    {renderTable(filteredProperties)}
                  </TabsContent>
              </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}

    