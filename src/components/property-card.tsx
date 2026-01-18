
"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Fingerprint, MapPin, Square, CheckCircle, Clock, ShieldX, Map } from 'lucide-react';
import { CopyButton } from './copy-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { formatEther } from 'ethers';
import { cn } from '@/lib/utils';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-muted animate-pulse flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading Map...</p></div>
});


interface PropertyCardProps {
  property: Property;
}

function truncateHash(hash: string, startChars = 6, endChars = 4) {
  if (!hash) return "";
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

export function PropertyCard({ property }: PropertyCardProps) {

  const StatusBadge = () => {
    if (property.status === 'verified') {
      return (
        <Badge variant="default" className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-md bg-green-100 text-green-800 border border-green-200 z-10">
          <CheckCircle className="h-3.5 w-3.5" />
          Verified
        </Badge>
      );
    }
    if (property.status === 'rejected') {
       return (
        <Badge variant="destructive" className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-md z-10">
          <ShieldX className="h-3.5 w-3.5" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-md bg-amber-100 text-amber-800 border border-amber-200 z-10">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden rounded-xl border border-border/50 shadow-md hover:shadow-xl hover:border-primary/60 transition-all duration-300 bg-card group">
      
      <CardHeader className="p-0 relative">
        <div className="aspect-video w-full relative">
            <Link href={`/property/${property.parcelId}`} className="block h-full w-full" aria-label={`View details for ${property.title}`}>
                <Image src={property.imageUrl} alt={property.title} fill className="object-cover"/>
            </Link>
            <StatusBadge />

            <Dialog>
                <DialogTrigger asChild>
                    <div role="button" aria-label="View on map" className={cn(
                        "absolute inset-0 bg-black/60 flex items-center justify-center text-white",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    )}>
                        <Button variant="outline" className="bg-white/90 text-black hover:bg-white text-sm font-semibold">
                            <Map className="mr-2 h-4 w-4"/> View on Map
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Map View: {property.title}</DialogTitle>
                         <CardDescription>This is only a tentative boundary for representation of land, actual boundary may differ.</CardDescription>
                    </DialogHeader>
                    <div className="flex-grow h-full">
                        <LeafletMap readOnly initialData={property.polygon}/>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow flex flex-col">
          {property.forSale && property.price ? (
            <div className="text-2xl font-bold text-primary mb-1">
                {formatEther(property.price)} ETH
            </div>
            ) : (
                <div className="h-[32px] mb-1"></div> // Placeholder to keep alignment
            )
        }
        <Link href={`/property/${property.parcelId}`}>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground line-clamp-1 hover:underline">{property.title}</CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{property.location}</p>
        
        <div className="flex-grow"></div>
        
        <div className="mt-4 pt-4 border-t border-border/60 space-x-4 text-sm flex items-center">
            <div className="flex items-center text-muted-foreground gap-2">
                <Square className="h-4 w-4 text-primary shrink-0" />
                 <span className="font-medium text-foreground/90">{property.area}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
