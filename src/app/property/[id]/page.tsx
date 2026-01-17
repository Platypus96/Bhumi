
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
import { User, ShieldAlert, History, Check, Tag, Hourglass, ExternalLink, Trash2, MapPin, Square, Building, Wallet, Fingerprint } from "lucide-react";
import { format } from 'date-fns';
import { VerifyDocument } from "@/components/verify-document";
import { ManageSale } from "@/components/manage-sale";
import { BuyProperty } from "@/components/buy-property";
import { formatEther } from "ethers";
import { Button } from "@/components/ui/button";
import { HashPill } from "@/components/hash-pill";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-muted animate-pulse" />
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
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex flex-col space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-[450px] w-full rounded-2xl" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div>
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
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

  const isCoordinate = property.latitude && property.longitude;
  
  const StatusBadge = ({ className }: { className?: string }) => {
    const statusConfig = {
      verified: { text: 'Verified', icon: Check, className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { text: 'Rejected', icon: ShieldAlert, className: 'bg-red-100 text-red-800 border-red-200' },
      unverified: { text: 'Pending Verification', icon: Hourglass, className: 'bg-amber-100 text-amber-800 border-amber-200' }
    };
    const config = statusConfig[property.status || 'unverified'];
    const Icon = config.icon;

    return (
      <Badge className={cn("flex items-center gap-2 text-sm font-medium", config.className, className)}>
        <Icon className="h-4 w-4" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="bg-gray-50/50 dark:bg-black py-8 lg:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <StatusBadge className="mb-2 max-w-fit"/>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            {property.title}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-lg text-muted-foreground">
              {isCoordinate ? (
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-2"
                >
                  <MapPin className="h-5 w-5" />
                  <span>{property.location}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {property.location}
                </span>
              )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Map */}
            <Card className="shadow-md overflow-hidden relative z-0">
                <CardContent className="p-0">
                    <p className="text-xs text-muted-foreground text-center p-2 bg-secondary/50">This is only a tentative boundary for representation of land, actual boundary may differ.</p>
                    <div className="h-[450px]">
                        <LeafletMap readOnly initialData={property.polygon}/>
                    </div>
                </CardContent>
            </Card>
            
            {/* About Section */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center"><Building className="mr-3 text-primary"/> About this Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-base text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </CardContent>
            </Card>

            {/* Document Verification */}
             <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Document Integrity</CardTitle>
                 <CardDescription>Verify the authenticity of property documents against the blockchain record.</CardDescription>
              </CardHeader>
              <CardContent>
                 <VerifyDocument property={property} />
              </CardContent>
            </Card>

            {/* History Section */}
            {property.history && property.history.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center"><History className="mr-3 text-primary" />Ownership History</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="relative pl-6">
                        <div className="absolute left-9 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                        <ul className="space-y-8">
                          {property.history.slice().reverse().map((item, index) => (
                            <li key={index} className="relative flex items-start space-x-6">
                              <div className="absolute left-0 top-1.5 h-6 w-6 bg-secondary rounded-full flex items-center justify-center -translate-x-1/2 ring-4 ring-background">
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="pt-1 w-full">
                                <p className="font-semibold text-base">Ownership Transferred</p>
                                <div className="text-sm text-muted-foreground mt-1 space-y-2">
                                    <div className="flex justify-between items-center"><span>From:</span> <HashPill type="address" hash={item.from} /></div>
                                    <div className="flex justify-between items-center"><span>To:</span> <HashPill type="address" hash={item.to} /></div>
                                    {item.price && item.price !== "0" && <div className="flex justify-between items-center"><span>Price:</span> <span className="font-semibold">{formatEther(item.price)} ETH</span></div>}
                                </div>
                                <p className="text-xs text-muted-foreground/70 mt-2">{format(item.timestamp.toDate(), "PPP 'at' p")}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                  </CardContent>
                </Card>
            )}
          </div>

          {/* Right Column (Sticky) */}
          <div className="relative mt-8 lg:mt-0">
             <div className="lg:sticky lg:top-24 space-y-8">
                
                {property.forSale && (
                  <Alert className="border-accent !mt-4 bg-accent/10 text-accent-foreground shadow-lg">
                   <Tag className="h-4 w-4 text-accent" />
                   <AlertTitle className="text-accent font-bold">This property is for sale</AlertTitle>
                   <AlertDescription>
                     Price: <span className="font-bold text-2xl">{formatEther(property.price!)} ETH</span>
                   </AlertDescription>
                 </Alert>
                )}

                {/* Actions */}
                {isOwner && property.status === "verified" && (
                  <ManageSale property={property} onSaleStatusChanged={fetchProperty} />
                )}
                {!isOwner && property.forSale && (
                  <BuyProperty property={property} onPurchase={fetchProperty} />
                )}

                {/* Status-based Alerts for Owner */}
                {isOwner && property.status === 'unverified' && (
                  <Card className="border-dashed">
                      <CardHeader className="flex-row items-center gap-4">
                          <Hourglass className="h-8 w-8 text-muted-foreground"/>
                          <div>
                              <CardTitle>Pending Verification</CardTitle>
                              <CardDescription>This property is awaiting review from the registrar.</CardDescription>
                          </div>
                      </CardHeader>
                  </Card>
                )}
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
                
                {/* Delete action for owner */}
                {isOwner && (property.status === 'unverified' || property.status === 'rejected') && (
                    <Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-950/30">
                        <CardHeader>
                            <CardTitle>Owner Actions</CardTitle>
                            <CardDescription>You can remove this listing to submit a new, corrected registration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeleting} className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete and Re-register
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently remove this property registration.</AlertDialogDescription>
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

                {/* Key Details */}
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                     <div className="flex items-center justify-between"><strong className="text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4"/>Owner</strong> <HashPill type="address" hash={property.owner}/></div>
                      <div className="flex items-center justify-between"><strong className="text-muted-foreground flex items-center gap-2"><Fingerprint className="h-4 w-4"/>Parcel ID</strong> <HashPill type="parcel" hash={property.parcelId}/></div>
                     <Separator/>
                     <div className="flex items-center justify-between"><strong className="text-muted-foreground flex items-center gap-2"><Square className="h-4 w-4"/>Area</strong> <span className="font-semibold">{property.area}</span></div>
                      <div className="flex items-center justify-between"><strong className="text-muted-foreground flex items-center gap-2"><History className="h-4 w-4"/>Registered</strong> <span className="font-semibold">{format(property.registeredAt.toDate(), "PPP")}</span></div>
                  </CardContent>
                </Card>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

    
