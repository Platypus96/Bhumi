"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWeb3 } from "@/hooks/use-web3";
import { getProperties } from "@/lib/data";
import type { Property } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const [pendingTransfers, setPendingTransfers] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isRegistrar) {
      const fetchPending = async () => {
        setLoading(true);
        const allProps = await getProperties();
        const pending = allProps.filter(p => p.status === 'Transfer Initiated');
        setPendingTransfers(pending);
        setLoading(false);
      };
      fetchPending();
    } else {
        setLoading(false);
    }
  }, [isRegistrar]);

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
                <AlertDescription>Only the registrar can access the dashboard.</AlertDescription>
            </Alert>
        </div>
    );
  }
  
  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary font-headline">Registrar Dashboard</h1>
      <h2 className="text-xl font-semibold mb-4">Pending Transfer Approvals</h2>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property ID</TableHead>
              <TableHead>Current Owner</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? renderSkeletons() : 
             pendingTransfers.length > 0 ? (
              pendingTransfers.map((prop) => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium">{prop.id}</TableCell>
                  <TableCell>{`${prop.ownerAddress.substring(0, 8)}...`}</TableCell>
                  <TableCell>{`${prop.transferTo?.substring(0, 8)}...`}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/property/${prop.id}`}>
                        Review & Approve <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No pending transfers.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
