
"use client";

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Fingerprint, MapPin, Square, CheckCircle, Clock, ShieldX } from 'lucide-react';
import { CopyButton } from './copy-button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { MapDisplay } from './dashboard/map-display';

interface PropertyCardProps {
  property: Property;
}

function truncateHash(hash: string, startChars = 6, endChars = 4) {
  if (!hash) return "";
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const showReadMore = property.description.length > 100;

  const StatusBadge = () => {
    if (property.status === 'verified') {
      return (
        <Badge variant="default" className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-md bg-green-100 text-green-800 z-10">
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
      <Badge variant="secondary" className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-md bg-amber-100 text-amber-800 z-10">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden rounded-xl border border-border/50 shadow-md hover:shadow-xl hover:border-primary/60 transition-all duration-300 bg-card relative group">
      
      {/* Map Section */}
      <CardHeader className="p-0 relative">
         <div className="relative aspect-video overflow-hidden">
             <MapDisplay properties={[property]} selectedProperty={null} />
             <StatusBadge />
         </div>
         {/* Clickable Overlay Link */}
         <Link href={`/property/${property.parcelId}`} className="absolute inset-0 z-20" aria-label={`View details for ${property.title}`} />
      </CardHeader>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col bg-card">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground line-clamp-1">
            <Link href={`/property/${property.parcelId}`} className="hover:underline relative z-30">
                {property.title}
            </Link>
        </CardTitle>

        <div className="text-sm text-muted-foreground leading-relaxed mt-1 min-h-[40px] flex-grow">
          <p className="line-clamp-2">{property.description}</p>
          {showReadMore && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-xs -mt-1 relative z-30">Read more...</Button>
              </DialogTrigger>
              <DialogContent className="z-50">
                <DialogHeader>
                  <DialogTitle>{property.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="max-h-[60vh] overflow-y-auto">
                  {property.description}
                </DialogDescription>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Specs Row */}
        <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
                <Square className="h-4 w-4 mr-2 text-primary shrink-0" />
                <span className="font-medium text-foreground/90">{property.area || "Not specified"}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
                <span className="truncate">{property.location || "Not specified"}</span>
            </div>
        </div>
      </div>

      {/* Footer Section */}
      <CardFooter className="p-3 bg-secondary/30 relative z-30">
           <div className="flex items-center text-xs text-muted-foreground font-mono">
              <Fingerprint className="h-4 w-4 mr-2 text-primary shrink-0" />
              <span className="truncate">
                  ID: {truncateHash(property.parcelId, 10, 6)}
              </span>
              <CopyButton textToCopy={property.parcelId} size="sm" className="ml-2 h-6 w-6" />
          </div>
      </CardFooter>
    </Card>
  );
}
