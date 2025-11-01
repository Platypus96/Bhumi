
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
import { User, ShieldAlert, Key, Loader2, History, Check, Tag, Building, Hourglass, MapPin, Video } from "lucide-react";
import { format } from 'date-fns';
import { VerifyDocument } from "@/components/verify-document";
import { ManageSale } from "@/components/manage-sale";
import { BuyProperty } from "@/components/buy-property";
import { formatEther } from "ethers";
import { Button } from "@/components/ui/button";

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

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId;
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1];
    } else {
      return null;
    }
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  const videoEmbedUrl = property?.videoUrl ? getYoutubeEmbedUrl(property.videoUrl) : null;

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
              <Image src={property.imageUrl} alt={property.title} fill className="object-cover" />
               {property.forSale && (
                <Badge variant="destructive" className="absolute top-4 right-4 text-base px-3 py-1">
                  For Sale
                </Badge>
              )}
            </div>
             <CardContent className="p-6">
                <CardTitle className="text-3xl font-bold">{property.title}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{property.area}</CardDescription>
                <p className="mt-4">{property.description}</p>
             </CardContent>
          </Card>

           {videoEmbedUrl && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center"><Video className="mr-2"/> Property Video</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={videoEmbedUrl}
                            title="Property Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </CardContent>
            </Card>
           )}

          <VerifyDocument property={property} />
          
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl break-all">Parcel ID: {property.parcelId}</CardTitle>
              {property.registeredAt && <CardDescription>Registered on {format(property.registeredAt.toDate(), "PPP")}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center break-all"><Key className="mr-3 h-5 w-5 text-primary flex-shrink-0" /> <div><strong>Owner:</strong> {property.owner}</div></div>
              <div className="flex items-center"><Building className="mr-3 h-5 w-5 text-primary" /> <div><strong>Status:</strong> <Badge variant={property.verified ? 'secondary' : 'destructive'}>{property.verified ? "Verified" : "Unverified"}</Badge></div></div>
              
               <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <strong>Location:</strong>
                  <p>
                    <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                        {property.location}
                    </Link>
                  </p>
                </div>
              </div>
              
              {property.forSale && property.price && (
                <Alert className="border-accent">
                  <Tag className="h-4 w-4 text-accent" />
                  <AlertTitle className="text-accent">This property is for sale!</AlertTitle>
                  <AlertDescription>
                    Price: <span className="font-bold text-lg">{formatEther(property.price)} ETH</span>
                  </AlertDescription>
                </Alert>
              )}
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

          {property.history && property.history.length > 0 && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="flex items-center"><History className="mr-2" />Transfer History</CardTitle></CardHeader>
              <CardContent>
                 <ul className="space-y-4">
                    {property.history.slice().reverse().map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">From: <span className="font-mono text-xs">{item.from}</span></p>

                          <p className="font-semibold">To: <span className="font-mono text-xs">{item.to}</span></p>
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
      </div>
    </div>
  );
}
