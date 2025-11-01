"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { getPendingSubmissions, createProperty, updateSubmissionStatus } from "@/lib/data";
import { useBlockchain } from "@/hooks/use-blockchain";
import { useToast } from "@/hooks/use-toast";
import type { Submission } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const { isRegistrar, account } = useWeb3();
  const { registerProperty } = useBlockchain();
  const { toast } = useToast();
  const { db } = useFirebase();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    const pending = await getPendingSubmissions(db);
    setSubmissions(pending);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    if (isRegistrar) {
      fetchPending();
    } else {
      setLoading(false);
    }
  }, [isRegistrar, fetchPending]);

  const handleApprove = async (submission: Submission) => {
    if (!db) return;
    setProcessingId(submission.id);
    try {
      // 1. Call smart contract to register property
      const { parcelId, receipt } = await registerProperty(
        submission.owner,
        submission.proofCID,
        submission.pointerCID
      );

      if (!parcelId || !receipt) {
        throw new Error("Failed to get Parcel ID from contract.");
      }

      // 2. Create property in Firestore
      await createProperty(db, {
        parcelId: parcelId,
        owner: submission.owner,
        title: submission.title,
        description: submission.description,
        area: submission.area,
        imageUrl: submission.imageUrl,
        ipfsProofCid: submission.proofCID,
        pointerCid: submission.pointerCID,
        verified: true,
        txHash: receipt.hash,
        forSale: false,
        price: null,
        registeredAt: Timestamp.now(),
      });
      
      // 3. Update submission status
      await updateSubmissionStatus(db, submission.id, 'approved');

      toast({
        title: "Submission Approved!",
        description: `Property registered with Parcel ID: ${parcelId}`,
      });

      // Refresh list
      fetchPending();

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "An error occurred during the approval process.",
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (submissionId: string) => {
    if (!db) return;
    setProcessingId(submissionId);
     try {
      await updateSubmissionStatus(db, submissionId, 'rejected');
      toast({
        title: "Submission Rejected",
        variant: "default",
      });
      fetchPending();
     } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "Could not update submission status.",
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
        <TableCell className="space-x-2 flex"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-primary font-headline">Registrar Dashboard</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Pending Property Submissions</CardTitle>
                <CardDescription>Review and approve new property registrations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Title & Owner</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? renderSkeletons() : 
                    submissions.length > 0 ? (
                        submissions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell>
                                <div className="relative h-10 w-16">
                                    <Image src={sub.imageUrl} alt={sub.title} fill className="rounded-md object-cover" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{sub.title}</div>
                                <div className="text-xs text-muted-foreground font-mono break-all">{sub.owner}</div>
                            </TableCell>
                            <TableCell>{format(sub.createdAt.toDate(), "PPP")}</TableCell>
                            <TableCell>
                                <Button variant="link" asChild size="sm" className="p-0 h-auto">
                                    <Link href={`https://ipfs.io/ipfs/${sub.proofCID}`} target="_blank">View on IPFS</Link>
                                </Button>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700" onClick={() => handleApprove(sub)} disabled={!!processingId}>
                                    {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(sub.id)} disabled={!!processingId}>
                                     {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4"/>}
                                </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No pending submissions.
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
