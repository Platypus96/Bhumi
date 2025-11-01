"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { getAllProperties, verifyPropertyInDb } from "@/lib/data";
import { useBlockchain } from "@/hooks/use-blockchain";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/lib/types";
import { useFirebase } from "@/firebase";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const { verifyProperty } = useBlockchain();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAllProperties = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    const allProps = await getAllProperties(firestore);
    setProperties(allProps);
    setLoading(false);
  }, [firestore]);

  useEffect(() => {
    if (isRegistrar) {
      fetchAllProperties();
    } else {
      setLoading(false);
    }
  }, [isRegistrar, fetchAllProperties]);

  const handleVerify = async (property: Property) => {
    if (!firestore) return;
    setProcessingId(property.parcelId);
    try {
      // 1. Call smart contract to verify property
      await verifyProperty(property.parcelId);

      // 2. Update property in Firestore
      await verifyPropertyInDb(firestore, property.parcelId);

      toast({
        title: "Property Verified!",
        description: `Property ${property.parcelId.substring(0, 10)}... is now verified on-chain.`,
      });

      // Refresh list
      fetchAllProperties();

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "An error occurred during the verification process.",
      });
    } finally {
      setProcessingId(null);
    }
  };


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
        <TableCell><Skeleton className="h-10 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-primary font-headline">Registrar Dashboard</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Property Verification</CardTitle>
                <CardDescription>Review and verify new property registrations on the blockchain.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Title & Owner</TableHead>
                        <TableHead>Registered At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? renderSkeletons() : 
                    properties.length > 0 ? (
                        properties.map((prop) => (
                        <TableRow key={prop.parcelId}>
                            <TableCell>
                                <div className="relative h-10 w-16">
                                    <Image src={prop.imageUrl} alt={prop.title} fill className="rounded-md object-cover" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{prop.title}</div>
                                <div className="text-xs text-muted-foreground font-mono break-all">{prop.owner}</div>
                            </TableCell>
                            <TableCell>{format(prop.registeredAt.toDate(), "PPP")}</TableCell>
                             <TableCell>
                                <Badge variant={prop.verified ? 'secondary' : 'destructive'}>
                                    {prop.verified ? "Verified" : "Unverified"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                { !prop.verified && (
                                  <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700" onClick={() => handleVerify(prop)} disabled={!!processingId}>
                                      {processingId === prop.parcelId ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldCheck className="h-4 w-4 mr-2"/>}
                                      Verify
                                  </Button>
                                )}
                                { prop.verified && (
                                    <div className="flex items-center text-green-600">
                                        <Check className="h-4 w-4 mr-2"/>
                                        Verified
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No properties have been added yet.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
