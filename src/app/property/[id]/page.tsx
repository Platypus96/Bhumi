"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getPropertyByParcelId } from "@/lib/data";
import type { Property } from "@/lib/types";
import { useWeb3 } from "@/hooks/use-web3";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, ShieldAlert, Key, Loader2, History, Check, Tag, Building } from "lucide-react";
import { format } from 'date-fns';
import { VerifyDocument } from "@/components/verify-document";
import { ManageSale } from "@/components/manage-sale";
import { BuyProperty } from "@/components/buy-property";
import { formatEther } from "ethers";

export default function PropertyDetailPage() {
  const params = useParams();
  const { account } = useWeb3();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isOwner = account?.toLowerCase() === property?.owner.toLowerCase();
  
  const fetchProperty = async () => {
    if (id) {
      setLoading(true);
      const prop = await getPropertyByParcelId(id);
      setProperty(prop);
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProperty();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  

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

          {isOwner && (
            <ManageSale property={property} onSaleStatusChanged={fetchProperty} />
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
