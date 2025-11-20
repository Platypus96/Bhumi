import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Fingerprint, MapPin, Square, Copy, CheckCircle, Clock } from 'lucide-react';
import { CopyButton } from './copy-button';

interface PropertyCardProps {
  property: Property;
}

function truncateHash(hash: string, startChars = 6, endChars = 4) {
  if (!hash) return "";
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.parcelId}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden rounded-xl border border-border/50 shadow-md hover:shadow-xl hover:border-primary/60 transition-all duration-300 bg-card">
        {/* Image Section */}
        <CardHeader className="p-0 relative">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
             <Badge
                variant={property.verified ? 'default' : 'secondary'}
                className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-md ${
                  property.verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {property.verified ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    Unverified
                  </>
                )}
              </Badge>
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <div className="p-4 flex-grow flex flex-col">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground line-clamp-1">
                {property.title}
            </CardTitle>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1 min-h-[40px] flex-grow">
                {property.description}
            </p>

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
        <CardFooter className="p-3 bg-secondary/30">
             <div className="flex items-center text-xs text-muted-foreground font-mono">
                <Fingerprint className="h-4 w-4 mr-2 text-primary shrink-0" />
                <span className="truncate">
                    ID: {truncateHash(property.parcelId, 10, 6)}
                </span>
                <CopyButton textToCopy={property.parcelId} size="sm" className="ml-2 h-6 w-6" />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
