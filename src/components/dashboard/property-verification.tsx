
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import type { Property } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { HashPill } from '../hash-pill';
import { format } from 'date-fns';
import { Download, FileText, Loader2, Map, User, ArrowLeft, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { MapDisplay } from './map-display';
import { Separator } from '../ui/separator';
import { useBlockchain } from '@/hooks/use-blockchain';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { verifyPropertyInDb, rejectPropertyInDb } from '@/lib/data';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface PropertyVerificationProps {
    property: Property | null;
    onBack?: () => void;
}

export function PropertyVerification({ property, onBack }: PropertyVerificationProps) {
    const { verifyProperty: verifyOnChain } = useBlockchain();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        if (!property || !firestore) return;
        setIsProcessing(true);
        setError(null);
        try {
            await verifyOnChain(property.parcelId);
            await verifyPropertyInDb(firestore, property.parcelId);
            toast({ title: 'Success', description: 'Property has been verified.' });
        } catch (e: any) {
            setError(e.message || "An error occurred during verification.");
            toast({ variant: 'destructive', title: 'Verification Failed', description: e.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleReject = async () => {
         if (!property || !firestore) return;
        setIsProcessing(true);
        setError(null);
        try {
            await rejectPropertyInDb(firestore, property.parcelId);
            toast({ title: 'Property Rejected', description: 'The property status has been updated to rejected.' });
        } catch (e: any) {
            setError(e.message || "An error occurred.");
            toast({ variant: 'destructive', title: 'Rejection Failed', description: e.message });
        } finally {
            setIsProcessing(false);
        }
    }

    if (!property) {
        return (
            <Card className="h-full flex items-center justify-center shadow-lg">
                <div className="text-center p-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Property Selected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Select a property from the list to view its details and begin verification.</p>
                </div>
            </Card>
        );
    }
    
    const isPending = !property.status || property.status === 'unverified';

    return (
        <Card className="h-full shadow-lg">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl break-all line-clamp-1">{property.title}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                </div>
                {onBack && <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2"/> Back</Button>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground flex items-center"><User className="mr-2 h-4 w-4"/>Owner</strong> <HashPill type="address" hash={property.owner}/></div>
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground">Registered</strong> <span>{property.registeredAt ? format(property.registeredAt.toDate(), "PPP") : 'N/A'}</span></div>
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground">Status</strong> <Badge variant={isPending ? 'destructive' : 'secondary'}>{property.status || 'unverified'}</Badge></div>
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
                    <DialogContent className="max-w-4xl h-[80vh] p-0">
                         <MapDisplay properties={[property]} selectedProperty={property}/>
                    </DialogContent>
                </Dialog>

                {error && (
                     <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Operation Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isPending && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button 
                            variant="destructive"
                            onClick={handleReject} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />}
                            Reject
                        </Button>
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

