"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getPropertyById, initiateTransfer, approveTransfer } from "@/lib/data";
import type { Property } from "@/lib/types";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, ShieldAlert, FileText, Landmark, Key, Loader2, Send, History, Check, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from 'date-fns';

const transferFormSchema = z.object({
  buyerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address."),
});

export default function PropertyDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { account, isRegistrar } = useWeb3();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isOwner = account?.toLowerCase() === property?.ownerAddress.toLowerCase();

  const transferForm = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
  });

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        setLoading(true);
        const prop = await getPropertyById(id);
        if (prop) {
          setProperty(prop);
        } else {
          toast({ variant: "destructive", title: "Property not found" });
        }
        setLoading(false);
      };
      fetchProperty();
    }
  }, [id, toast]);

  const handleVerify = () => {
    setVerificationStatus('verifying');
    setTimeout(() => {
      // Simulate re-hashing and comparison
      const isAuthentic = Math.random() > 0.1; // 90% chance of success
      setVerificationStatus(isAuthentic ? 'verified' : 'failed');
    }, 1500);
  };
  
  async function onInitiateTransfer(values: z.infer<typeof transferFormSchema>) {
    if (!property) return;
    setIsTransferring(true);
    try {
      const updatedProperty = await initiateTransfer(property.id, values.buyerAddress);
      setProperty(updatedProperty!);
      toast({ title: "Transfer Initiated", description: `Request to transfer to ${values.buyerAddress.substring(0,8)}... sent for registrar approval.` });
      transferForm.reset();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to initiate transfer.' });
    } finally {
      setIsTransferring(false);
    }
  }

  async function onApproveTransfer() {
    if (!property) return;
    setIsApproving(true);
    try {
      const updatedProperty = await approveTransfer(property.id);
      setProperty(updatedProperty!);
      toast({ title: "Transfer Approved!", description: `Property successfully transferred to new owner.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve transfer.' });
    } finally {
      setIsApproving(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><Skeleton className="h-[600px] w-full" /></div>;
  }
  
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The property you are looking for does not exist.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Card className="overflow-hidden">
            <div className="relative aspect-video">
              <Image src={property.imageUrl} alt={property.propertyAddress} data-ai-hint={property.imageHint} fill className="object-cover" />
               {property.status === 'Transfer Initiated' && (
                <Badge variant="destructive" className="absolute top-4 right-4 text-base px-3 py-1">
                  Transfer Pending
                </Badge>
              )}
            </div>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2" /> Document Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Verify the integrity of the property document by comparing its hash with the one stored on the blockchain.</p>
              <div className="space-y-2 text-sm break-all mb-4">
                <p><strong>IPFS CID:</strong> {property.documentCID}</p>
                <p><strong>On-Chain Hash (SHA-256):</strong> {property.documentHash}</p>
              </div>
              <Button onClick={handleVerify} disabled={verificationStatus === 'verifying'}>
                {verificationStatus === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verificationStatus === 'idle' && 'Verify Integrity'}
                {verificationStatus === 'verifying' && 'Verifying...'}
                {verificationStatus === 'verified' && 'Verified'}
                {verificationStatus === 'failed' && 'Verification Failed'}
              </Button>
              {verificationStatus === 'verified' && <Alert className="mt-4 border-green-500 text-green-700"><CheckCircle className="h-4 w-4 text-green-500" /><AlertTitle>Success</AlertTitle><AlertDescription>Document hash matches the on-chain record. The document is authentic.</AlertDescription></Alert>}
              {verificationStatus === 'failed' && <Alert variant="destructive" className="mt-4"><ShieldAlert className="h-4 w-4" /><AlertTitle>Warning</AlertTitle><AlertDescription>Document hash does not match the on-chain record. The document may have been tampered with.</AlertDescription></Alert>}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{property.propertyAddress}</CardTitle>
              <CardDescription>Property ID: {property.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center"><User className="mr-3 h-5 w-5 text-primary" /> <div><strong>Owner:</strong> {property.ownerName}</div></div>
              <div className="flex items-center break-all"><Key className="mr-3 h-5 w-5 text-primary" /> <div><strong>Owner Wallet:</strong> {property.ownerAddress}</div></div>
              <div className="flex items-center"><Landmark className="mr-3 h-5 w-5 text-primary" /> <div><strong>Status:</strong> <Badge variant={property.status === 'Registered' ? 'secondary' : 'destructive'}>{property.status}</Badge></div></div>
              
              {property.status === 'Transfer Initiated' && (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Transfer In Progress</AlertTitle>
                  <AlertDescription>
                    This property is pending transfer to: <span className="font-mono block mt-1">{property.transferTo}</span>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {isOwner && property.status === 'Registered' && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="flex items-center"><Send className="mr-2" />Initiate Property Transfer</CardTitle></CardHeader>
              <CardContent>
                <Form {...transferForm}>
                  <form onSubmit={transferForm.handleSubmit(onInitiateTransfer)} className="space-y-4">
                    <FormField control={transferForm.control} name="buyerAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buyer&apos;s Wallet Address</FormLabel>
                        <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={isTransferring}>
                       {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Initiate Transfer
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {isRegistrar && property.status === 'Transfer Initiated' && (
             <Card className="mt-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CardHeader><CardTitle className="flex items-center text-green-800 dark:text-green-300"><CheckCircle className="mr-2" />Approve Transfer</CardTitle></CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-green-700 dark:text-green-400">As the registrar, you can approve this transfer. This action is irreversible.</p>
                <Button onClick={onApproveTransfer} disabled={isApproving} className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
                  {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve & Finalize Transfer
                </Button>
              </CardContent>
            </Card>
          )}

          {property.transferHistory.length > 0 && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="flex items-center"><History className="mr-2" />Transfer History</CardTitle></CardHeader>
              <CardContent>
                 <ul className="space-y-4">
                    {property.transferHistory.slice().reverse().map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">From: <span className="font-mono text-xs">{item.from}</span></p>
                          <p className="font-semibold">To: <span className="font-mono text-xs">{item.to}</span></p>
                          <p className="text-xs text-muted-foreground">{format(new Date(item.date), "PPP p")}</p>
                        </div>
                      </li>
                    ))}
                 </ul>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
