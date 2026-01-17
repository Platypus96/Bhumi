"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import type { Property } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { HashPill } from '../hash-pill';
import { format } from 'date-fns';
import { Download, FileText, Loader2, Map, User, CheckCircle, XCircle, ShieldAlert, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { useBlockchain } from '@/hooks/use-blockchain';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { verifyPropertyInDb, rejectPropertyInDb } from '@/lib/data';
import { Alert, AlertTitle, AlertDescription as AlertDesc } from '../ui/alert';
import dynamic from 'next/dynamic';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
});


interface PropertyVerificationProps {
    property: Property;
    onUpdate: () => void;
}

export function PropertyVerification({ property, onUpdate }: PropertyVerificationProps) {
    const { verifyProperty: verifyOnChain } = useBlockchain();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

    const handleVerify = async () => {
        if (!property || !firestore) return;
        setIsProcessing(true);
        setError(null);
        try {
            await verifyOnChain(property.parcelId);
            await verifyPropertyInDb(firestore, property.parcelId);
            toast({ title: 'Success', description: 'Property has been verified.' });
            onUpdate(); // Re-fetch data on parent page
        } catch (e: any) {
            setError(e.message || "An error occurred during verification.");
            toast({ variant: 'destructive', title: 'Verification Failed', description: e.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
     const handleRejectSubmit = async () => {
        if (!property || !firestore || !rejectionReason) {
            toast({ variant: 'destructive', title: 'Reason required', description: 'Please provide a reason for rejection.' });
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            await rejectPropertyInDb(firestore, property.parcelId, rejectionReason);
            toast({ title: 'Property Rejected', description: 'The property status has been updated to rejected.' });
            setIsRejectionDialogOpen(false);
            setRejectionReason("");
            onUpdate();
        } catch (e: any) {
            setError(e.message || "An error occurred.");
            toast({ variant: 'destructive', title: 'Rejection Failed', description: e.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const isPending = !property.status || property.status === 'unverified';
    const hasCoordinates = property.latitude && property.longitude;

    return (
        <Card className="h-full shadow-lg">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl break-all line-clamp-1">{property.title}</CardTitle>
                     {hasCoordinates ? (
                        <a
                            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:underline flex items-center"
                        >
                            <MapPin className="mr-1 h-4 w-4" />
                            {property.location}
                            <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                    ) : (
                        <CardDescription>{property.location}</CardDescription>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground flex items-center"><User className="mr-2 h-4 w-4"/>Owner</strong> <HashPill type="address" hash={property.owner}/></div>
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground">Registered</strong> <span>{property.registeredAt ? format(property.registeredAt.toDate(), "PPP") : 'N/A'}</span></div>
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground">Status</strong> <Badge variant={isPending ? 'default' : property.status === 'verified' ? 'secondary' : 'destructive'}>{property.status || 'unverified'}</Badge></div>
                </div>

                <Separator/>
                
                 <div className="space-y-3">
                    <h4 className="font-semibold">Documents</h4>
                    <div className="flex items-center space-x-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={property.imageUrl} target="_blank" rel="noopener noreferrer">
                              View Image <Download className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                         <Link href={property.ipfsProofCid} target="_blank" rel="noopener noreferrer">
                              View Proof <Download className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                    </div>
                </div>

                <Separator/>

                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Map className="mr-2 h-4 w-4"/> View on Map
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>Map View: {property.title}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow">
                         <LeafletMap readOnly initialData={property.polygon}/>
                        </div>
                    </DialogContent>
                </Dialog>

                {error && (
                     <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Operation Failed</AlertTitle>
                        <AlertDesc>{error}</AlertDesc>
                    </Alert>
                )}

                {isPending && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" disabled={isProcessing}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Reason for Rejection</DialogTitle>
                                    <DialogDescription>
                                        Please provide a reason for rejecting this property. This will be shared with the owner.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label htmlFor="rejectionReason" className="sr-only">Rejection Reason</Label>
                                    <Textarea 
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="e.g., The provided documents are illegible or incomplete."
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsRejectionDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleRejectSubmit} disabled={isProcessing || !rejectionReason}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Submit Rejection
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleVerify}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Verify Property
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
