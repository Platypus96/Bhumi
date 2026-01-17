"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPropertyByParcelId, deletePropertyFromDb } from "@/lib/data";
import type { Property } from "@/lib/types";
import { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase/provider";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, ShieldAlert, History, Check, Tag, Hourglass, ExternalLink, Trash2, Map } from "lucide-react";
import { format } from 'date-fns';
import { VerifyDocument } from "@/components/verify-document";
import { ManageSale } from "@/components/manage-sale";
import { BuyProperty } from "@/components/buy-property";
import { formatEther } from "ethers";
import { Button } from "@/components/ui/button";
import { HashPill } from "@/components/hash-pill";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
});


export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { account } = useWeb3();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isOwner = account?.toLowerCase() === property?.owner.toLowerCase();
  
  const fetchProperty = useCallback(async () => {
    if (id && firestore) {
      setLoading(true);
      const prop = await getPropertyByParcelId(firestore, id);
      setProperty(prop);
      setLoading(false);
    }
  }, [id, firestore]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);
  
  const handleDelete = async () => {
    if (!property || !firestore) return;
    setIsDeleting(true);
    try {
        await deletePropertyFromDb(firestore, property.parcelId);
        toast({
            title: "Property Removed",
            description: "You can now re-register the property with corrected details.",
        });
        router.push('/my-properties');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || "Could not remove the property.",
        });
        setIsDeleting(false);
    }
  };

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

  const showReadMore = property.description.length > 200;
  const isCoordinate = property.latitude && property.longitude;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <Card>
             <CardHeader>
                <CardTitle className="text-3xl font-bold">{property.title}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="text-muted-foreground">
                  <p className={showReadMore ? 'line-clamp-3' : ''}>
                    {property.description}
                  </p>
                  {showReadMore && (
                     <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-sm">Read more...</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{property.title}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                          {property.description}
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
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
             </CardContent>
          </Card>

            {property.history && property.history.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center text-2xl"><History className="mr-3" />Transfer History</CardTitle></CardHeader>
                  <CardContent>
                     <ul className="space-y-4">
                        {property.history.slice().reverse().map((item, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-semibold">From: <HashPill type="address" hash={item.from} /></div>
                              <div className="font-semibold">To: <HashPill type="address" hash={item.to} /></div>
                              {item.price && item.price !== "0" && <p className="text-sm">Price: {formatEther(item.price)} ETH</p>}
                              <p className="text-xs text-muted-foreground">{format(item.timestamp.toDate(), "PPP p")}</p>
                            </div>
                          </li>
                        ))}
                     </ul>
                  </CardContent>
                </Card>
            )}
          
        </div>

        <div className="space-y-6">
          <Card>
             <CardHeader>
              <CardTitle className="text-2xl break-all">Asset Information</CardTitle>
              {property.forSale && property.price && (
                <Alert className="border-accent !mt-4 bg-accent/10">
                  <Tag className="h-4 w-4 text-accent" />
                  <AlertTitle className="text-accent">This property is for sale!</AlertTitle>
                  <AlertDescription>
                    Price: <span className="font-bold text-lg">{formatEther(property.price)} ETH</span>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                    <div className="flex items-start justify-between"><strong className="text-muted-foreground">Owner</strong> <HashPill type="address" hash={property.owner}/></div>
                    <div className="flex items-start justify-between"><strong className="text-muted-foreground">Parcel ID</strong> <HashPill type="parcel" hash={property.parcelId}/></div>
                    {property.registeredAt && <div className="flex items-center justify-between"><strong className="text-muted-foreground">Registered</strong> <span>{format(property.registeredAt.toDate(), "PPP")}</span></div>}
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground">Status</strong> <Badge variant={property.status === 'verified' ? 'secondary' : property.status === 'rejected' ? 'destructive' : 'default'}>{property.status}</Badge></div>
                    {property.location && (
                      <div className="flex items-center justify-between">
                        <strong className="text-muted-foreground">Location</strong>
                        {isCoordinate ? (
                          <a
                            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <span className="text-right font-mono">
                                {property.latitude?.toFixed(5)}, {property.longitude?.toFixed(5)}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-right">{property.location}</span>
                        )}
                      </div>
                    )}
                </div>
                <Separator className="my-4" />
                <VerifyDocument property={property} />
            </CardContent>
          </Card>

           {isOwner && property.status === 'rejected' && property.rejectionReason && (
              <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Property Rejected</AlertTitle>
                  <AlertDescription>
                      <p className="font-semibold">The registrar provided the following reason:</p>
                      <p className="mt-2 italic">"{property.rejectionReason}"</p>
                  </AlertDescription>
              </Alert>
          )}
          
           {isOwner && property.status === 'verified' && (
            <ManageSale property={property} onSaleStatusChanged={fetchProperty} />
          )}

           {isOwner && property.status === 'unverified' && (
            <Card className="mt-6 border-dashed">
                <CardHeader className="flex-row items-center gap-4">
                    <Hourglass className="h-6 w-6 text-muted-foreground"/>
                    <div>
                        <CardTitle>Pending Verification</CardTitle>
                        <CardDescription>This property must be verified by the registrar before it can be listed for sale.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
          )}

          {!isOwner && property.forSale && (
            <BuyProperty property={property} onPurchase={fetchProperty} />
          )}

          {isOwner && (property.status === 'unverified' || property.status === 'rejected') && (
              <Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-950/30">
                  <CardHeader>
                      <CardTitle>Owner Actions</CardTitle>
                      <CardDescription>
                          Since this property is not verified, you can remove it to submit a new, corrected registration.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" disabled={isDeleting}>
                                  <Trash2 className="mr-2 h-4 w-4"/> Delete and Re-register
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will permanently remove this property registration. This action cannot be undone, but you will be able to submit a new registration.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                      Yes, delete it
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </CardContent>
              </Card>
          )}
        </div>
      </div>
    </div>
  );
}
