
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPropertyByParcelId } from "@/lib/data";
import type { Property } from "@/lib/types";
import { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase/provider";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, ShieldAlert, History, Check, Tag, Hourglass, ExternalLink, FileText } from "lucide-react";
import { format } from 'date-fns';
import { VerifyDocument } from "@/components/verify-document";
import { ManageSale } from "@/components/manage-sale";
import { BuyProperty } from "@/components/buy-property";
import { formatEther } from "ethers";
import { Button } from "@/components/ui/button";
import { HashPill } from "@/components/hash-pill";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NearbyPlaces } from "@/components/nearby-places";
import PropertiesMap from "@/components/property-map";

export default function PropertyDetailPage() {
  const params = useParams();
  const { account } = useWeb3();
  const { firestore } = useFirebase();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

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
          <Card className="overflow-hidden">
             <div className="h-[400px] w-full">
                <PropertiesMap properties={[property]} />
             </div>
             <CardContent className="p-6">
                <CardTitle className="text-3xl font-bold">{property.title}</CardTitle>
                <div className="mt-4 text-muted-foreground">
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

            {isCoordinate && (
              <NearbyPlaces latitude={property.latitude!} longitude={property.longitude!} />
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
                    <div className="flex items-center justify-between"><strong className="text-muted-foreground">Status</strong> <Badge variant={property.verified ? 'secondary' : 'destructive'}>{property.verified ? "Verified" : "Unverified"}</Badge></div>
                    {property.location && (
                        <div className="flex items-center justify-between">
                            <strong className="text-muted-foreground">Location</strong>
                            <span className="text-right">{property.location}</span>
                        </div>
                    )}
                </div>
                <Separator className="my-4" />
                <VerifyDocument property={property} />
            </CardContent>
          </Card>
          
           {isOwner && property.verified && (
            <ManageSale property={property} onSaleStatusChanged={fetchProperty} />
          )}

           {isOwner && !property.verified && (
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
        </div>
      </div>
    </div>
  );
}
